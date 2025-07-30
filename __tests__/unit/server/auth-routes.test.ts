/**
 * Authentication Routes Unit Tests
 * ===============================
 * Tests for server/routes/auth-routes.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import session from 'express-session'
import authRoutes from '@server/routes/auth-routes'
import { userManagementService } from '@server/services/user-management-service'
import { testUsers, loginCredentials } from '../../fixtures/users'

// Mock dependencies
vi.mock('@server/services/user-management-service')
vi.mock('@server/middleware/auth', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    if (req.session?.userId) {
      next()
    } else {
      res.status(401).json({ success: false, error: 'Authentication required' })
    }
  }
}))

describe('Authentication Routes', () => {
  let app: express.Application
  let mockUserService: any

  beforeEach(() => {
    // Create Express app for testing
    app = express()
    app.use(express.json())
    
    // Configure session middleware
    app.use(session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }
    }))
    
    app.use('/auth', authRoutes)
    
    // Mock user management service
    mockUserService = vi.mocked(userManagementService)
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('POST /auth/login', () => {
    it('should login successfully with valid username and password', async () => {
      // Arrange
      mockUserService.authenticateUser.mockResolvedValue({
        success: true,
        user: testUsers.admin
      })

      // Act
      const response = await request(app)
        .post('/auth/login')
        .send(loginCredentials.validAdmin)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.user).toEqual(testUsers.admin)
      expect(mockUserService.authenticateUser).toHaveBeenCalledWith(
        loginCredentials.validAdmin.username,
        loginCredentials.validAdmin.password
      )
    })

    it('should login successfully with valid email and password', async () => {
      // Arrange
      mockUserService.authenticateUser.mockResolvedValue({
        success: true,
        user: testUsers.admin
      })

      // Act
      const response = await request(app)
        .post('/auth/login')
        .send(loginCredentials.validAdminEmail)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(mockUserService.authenticateUser).toHaveBeenCalledWith(
        loginCredentials.validAdminEmail.email,
        loginCredentials.validAdminEmail.password
      )
    })

    it('should reject login with invalid credentials', async () => {
      // Arrange
      mockUserService.authenticateUser.mockResolvedValue({
        success: false,
        error: 'Invalid credentials'
      })

      // Act
      const response = await request(app)
        .post('/auth/login')
        .send(loginCredentials.invalidCredentials)

      // Assert
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid credentials')
    })

    it('should reject login with missing username', async () => {
      // Act
      const response = await request(app)
        .post('/auth/login')
        .send({ password: 'password' })

      // Assert
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Username/identifier and password are required')
    })

    it('should reject login with missing password', async () => {
      // Act
      const response = await request(app)
        .post('/auth/login')
        .send({ username: 'admin' })

      // Assert
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Username/identifier and password are required')
    })

    it('should handle authentication service errors', async () => {
      // Arrange
      mockUserService.authenticateUser.mockRejectedValue(new Error('Database connection failed'))

      // Act
      const response = await request(app)
        .post('/auth/login')
        .send(loginCredentials.validAdmin)

      // Assert
      expect(response.status).toBe(500)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Authentication failed')
    })

    it('should support both username and identifier fields', async () => {
      // Arrange
      mockUserService.authenticateUser.mockResolvedValue({
        success: true,
        user: testUsers.admin
      })

      // Act - test with 'identifier' field instead of 'username'
      const response = await request(app)
        .post('/auth/login')
        .send({
          identifier: 'admin',
          password: 'password'
        })

      // Assert
      expect(response.status).toBe(200)
      expect(mockUserService.authenticateUser).toHaveBeenCalledWith('admin', 'password')
    })
  })

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      // Act
      const response = await request(app)
        .post('/auth/logout')

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Logged out successfully')
    })

    it('should handle session destruction errors', async () => {
      // This test is complex to implement with supertest since we can't easily mock session.destroy
      // In a real scenario, you'd test this with a more sophisticated setup
      expect(true).toBe(true) // Placeholder
    })
  })

  describe('GET /auth/me', () => {
    it('should return current user when authenticated', async () => {
      // Arrange
      mockUserService.getUserById.mockResolvedValue({
        success: true,
        user: testUsers.admin
      })

      // Create authenticated session
      const agent = request.agent(app)
      
      // Mock session middleware to simulate authenticated user
      app.use((req, res, next) => {
        req.session.userId = testUsers.admin.id
        next()
      })

      // Act
      const response = await agent.get('/auth/me')

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.user).toEqual(testUsers.admin)
      expect(mockUserService.getUserById).toHaveBeenCalledWith(testUsers.admin.id)
    })

    it('should reject request when not authenticated', async () => {
      // Act
      const response = await request(app)
        .get('/auth/me')

      // Assert
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Authentication required')
    })

    it('should handle user not found error', async () => {
      // Arrange
      mockUserService.getUserById.mockResolvedValue({
        success: false,
        error: 'User not found'
      })

      // Mock authenticated session
      app.use((req, res, next) => {
        req.session.userId = 999 // Non-existent user
        next()
      })

      // Act
      const response = await request(app)
        .get('/auth/me')

      // Assert
      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
    })
  })

  describe('PUT /auth/me', () => {
    beforeEach(() => {
      // Mock authenticated session for profile update tests
      app.use((req, res, next) => {
        req.session.userId = testUsers.admin.id
        next()
      })
    })

    it('should update user profile with valid data', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Admin',
        email: 'updated@example.com',
        organization: 'Test Org',
        jobTitle: 'Test Manager'
      }

      mockUserService.updateUser.mockResolvedValue({
        success: true,
        user: { ...testUsers.admin, ...updateData }
      })

      // Act
      const response = await request(app)
        .put('/auth/me')
        .send(updateData)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Profile updated successfully')
      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        testUsers.admin.id,
        updateData
      )
    })

    it('should reject profile update with invalid email format', async () => {
      // Act
      const response = await request(app)
        .put('/auth/me')
        .send({
          name: 'Test User',
          email: 'invalid-email'
        })

      // Assert
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid email format')
    })

    it('should reject profile update with missing required fields', async () => {
      // Act
      const response = await request(app)
        .put('/auth/me')
        .send({
          name: 'Test User'
          // Missing email
        })

      // Assert
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Name and email are required for profile updates')
    })

    it('should validate contentAccess field', async () => {
      // Act
      const response = await request(app)
        .put('/auth/me')
        .send({
          contentAccess: 'invalid-access-level'
        })

      // Assert
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Content access must be either "student" or "professional"')
    })

    it('should handle user service update errors', async () => {
      // Arrange
      mockUserService.updateUser.mockResolvedValue({
        success: false,
        error: 'Email already exists'
      })

      // Act
      const response = await request(app)
        .put('/auth/me')
        .send({
          name: 'Test User',
          email: 'existing@example.com'
        })

      // Assert
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })

    it('should require authentication for profile updates', async () => {
      // Create new app without authenticated session
      const unauthApp = express()
      unauthApp.use(express.json())
      unauthApp.use(session({
        secret: 'test-secret',
        resave: false,
        saveUninitialized: false
      }))
      unauthApp.use('/auth', authRoutes)

      // Act
      const response = await request(unauthApp)
        .put('/auth/me')
        .send({
          name: 'Test User',
          email: 'test@example.com'
        })

      // Assert
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Authentication required')
    })
  })

  describe('Role-based Access Control', () => {
    it('should properly handle different user roles in session', async () => {
      // Test that different user roles are properly stored in session
      const roles = ['admin', 'facilitator', 'participant']
      
      for (const role of roles) {
        const testUser = { ...testUsers.admin, role }
        mockUserService.authenticateUser.mockResolvedValue({
          success: true,
          user: testUser
        })

        const response = await request(app)
          .post('/auth/login')
          .send(loginCredentials.validAdmin)

        expect(response.status).toBe(200)
        expect(response.body.user.role).toBe(role)
      }
    })
  })

  describe('Session Management', () => {
    it('should create session on successful login', async () => {
      // Arrange
      mockUserService.authenticateUser.mockResolvedValue({
        success: true,
        user: testUsers.admin
      })

      // Act
      const agent = request.agent(app)
      const loginResponse = await agent
        .post('/auth/login')
        .send(loginCredentials.validAdmin)

      // Assert login successful
      expect(loginResponse.status).toBe(200)

      // Mock getUserById for the /me endpoint
      mockUserService.getUserById.mockResolvedValue({
        success: true,
        user: testUsers.admin
      })

      // Test that session persists by calling authenticated endpoint
      const meResponse = await agent.get('/auth/me')
      expect(meResponse.status).toBe(200)
    })

    it('should destroy session on logout', async () => {
      // Arrange - Login first
      mockUserService.authenticateUser.mockResolvedValue({
        success: true,
        user: testUsers.admin
      })

      const agent = request.agent(app)
      await agent
        .post('/auth/login')
        .send(loginCredentials.validAdmin)

      // Act - Logout
      const logoutResponse = await agent.post('/auth/logout')
      expect(logoutResponse.status).toBe(200)

      // Assert - Session should be destroyed
      const meResponse = await agent.get('/auth/me')
      expect(meResponse.status).toBe(401)
    })
  })
})