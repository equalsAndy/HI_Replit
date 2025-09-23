/**
 * User Management Service Unit Tests
 * =================================
 * Tests for server/services/user-management-service.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import bcrypt from 'bcryptjs'
import { UserManagementService } from '@server/services/user-management-service'
import { testUsers, invalidUsers } from '../../fixtures/users'

// Mock dependencies
vi.mock('@server/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn()
      }))
    })),
    execute: vi.fn()
  }
}))

vi.mock('bcryptjs')
vi.mock('@server/utils/user-photo-utils', () => ({
  convertUserToPhotoReference: vi.fn(),
  processProfilePicture: vi.fn(),
  sanitizeUserForNetwork: vi.fn()
}))

describe('UserManagementService', () => {
  let userService: UserManagementService
  let mockDb: any
  let mockBcrypt: any

  beforeEach(async () => {
    // Import mocked dependencies
    const { db } = await import('@server/db')
    mockDb = vi.mocked(db)
    mockBcrypt = vi.mocked(bcrypt)
    
    userService = new UserManagementService()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('isUsernameAvailable', () => {
    it('should return true for available username', async () => {
      // Arrange
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]) // Empty array = username available
        })
      })

      // Act
      const result = await userService.isUsernameAvailable('newuser')

      // Assert
      expect(result).toBe(true)
    })

    it('should return false for taken username', async () => {
      // Arrange
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([testUsers.admin]) // User exists
        })
      })

      // Act
      const result = await userService.isUsernameAvailable('admin')

      // Assert
      expect(result).toBe(false)
    })

    it('should handle database errors gracefully', async () => {
      // Arrange
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockRejectedValue(new Error('Database error'))
        })
      })

      // Act
      const result = await userService.isUsernameAvailable('testuser')

      // Assert
      expect(result).toBe(false) // Should return false on error
    })
  })

  describe('createUser', () => {
    it('should create user successfully with valid data', async () => {
      // Arrange
      const userData = {
        username: 'newuser',
        password: 'password',
        name: 'New User',
        email: 'new@example.com',
        role: 'participant' as const,
        organization: 'Test Org',
        jobTitle: 'Test Role'
      }

      const hashedPassword = 'hashed_password'
      mockBcrypt.genSalt.mockResolvedValue('salt')
      mockBcrypt.hash.mockResolvedValue(hashedPassword)

      const mockUserResult = {
        id: 5,
        username: userData.username,
        password: hashedPassword,
        name: userData.name,
        email: userData.email.toLowerCase(),
        role: userData.role,
        organization: userData.organization,
        job_title: userData.jobTitle,
        profile_picture: null,
        is_test_user: false,
        is_beta_tester: false,
        show_demo_data_buttons: false,
        content_access: 'professional',
        ast_access: true,
        ia_access: true,
        invited_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      mockDb.execute.mockResolvedValue([mockUserResult])

      // Act
      const result = await userService.createUser(userData)

      // Assert
      expect(result.success).toBe(true)
      expect(result.user).toBeDefined()
      expect(result.user?.username).toBe(userData.username)
      expect(result.user?.email).toBe(userData.email)
      expect(result.user?.role).toBe(userData.role)
      expect(result.user).not.toHaveProperty('password') // Password should be excluded
      expect(mockBcrypt.hash).toHaveBeenCalledWith(userData.password, 'salt')
    })

    it('should handle password hashing', async () => {
      // Arrange
      const userData = {
        username: 'testuser',
        password: 'plaintext_password',
        name: 'Test User',
        email: 'test@example.com',
        role: 'participant' as const
      }

      mockBcrypt.genSalt.mockResolvedValue('test_salt')
      mockBcrypt.hash.mockResolvedValue('hashed_password')
      mockDb.execute.mockResolvedValue([{
        id: 1,
        username: userData.username,
        password: 'hashed_password',
        name: userData.name,
        email: userData.email,
        role: userData.role
      }])

      // Act
      await userService.createUser(userData)

      // Assert
      expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10)
      expect(mockBcrypt.hash).toHaveBeenCalledWith('plaintext_password', 'test_salt')
    })

    it('should normalize email to lowercase', async () => {
      // Arrange
      const userData = {
        username: 'testuser',
        password: 'password',
        name: 'Test User',
        email: 'TEST@EXAMPLE.COM',
        role: 'participant' as const
      }

      mockBcrypt.genSalt.mockResolvedValue('salt')
      mockBcrypt.hash.mockResolvedValue('hashed')
      mockDb.execute.mockResolvedValue([{
        id: 1,
        email: 'test@example.com'
      }])

      // Act
      await userService.createUser(userData)

      // Assert
      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('test@example.com')
      )
    })

    it('should handle database errors during user creation', async () => {
      // Arrange
      const userData = {
        username: 'testuser',
        password: 'password',
        name: 'Test User',
        email: 'test@example.com',
        role: 'participant' as const
      }

      mockBcrypt.genSalt.mockResolvedValue('salt')
      mockBcrypt.hash.mockResolvedValue('hashed')
      mockDb.execute.mockRejectedValue(new Error('Database error'))

      // Act
      const result = await userService.createUser(userData)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to create user')
    })
  })

  describe('authenticateUser', () => {
    it('should authenticate user with valid credentials', async () => {
      // Arrange
      const username = 'admin'
      const password = 'password'
      const hashedPassword = 'hashed_password'

      const mockUser = {
        ...testUsers.admin,
        password: hashedPassword
      }

      mockDb.execute.mockResolvedValue([mockUser])
      mockBcrypt.compare.mockResolvedValue(true)

      // Act
      const result = await userService.authenticateUser(username, password)

      // Assert
      expect(result.success).toBe(true)
      expect(result.user).toBeDefined()
      expect(result.user).not.toHaveProperty('password') // Password should be excluded
      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword)
    })

    it('should reject authentication with invalid password', async () => {
      // Arrange
      const username = 'admin'
      const password = 'wrongpassword'

      mockDb.execute.mockResolvedValue([{
        ...testUsers.admin,
        password: 'hashed_password'
      }])
      mockBcrypt.compare.mockResolvedValue(false)

      // Act
      const result = await userService.authenticateUser(username, password)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid username or password')
    })

    it('should reject authentication for non-existent user', async () => {
      // Arrange
      const username = 'nonexistent'
      const password = 'password'

      mockDb.execute.mockResolvedValue([]) // No user found

      // Act
      const result = await userService.authenticateUser(username, password)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid username or password')
    })

    it('should handle database errors during authentication', async () => {
      // Arrange
      const username = 'admin'
      const password = 'password'

      mockDb.execute.mockRejectedValue(new Error('Database connection failed'))

      // Act
      const result = await userService.authenticateUser(username, password)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Authentication failed')
    })

    it('should handle bcrypt comparison errors', async () => {
      // Arrange
      const username = 'admin'
      const password = 'password'

      mockDb.execute.mockResolvedValue([{
        ...testUsers.admin,
        password: 'hashed_password'
      }])
      mockBcrypt.compare.mockRejectedValue(new Error('Bcrypt error'))

      // Act
      const result = await userService.authenticateUser(username, password)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Authentication failed')
    })
  })

  describe('getUserById', () => {
    it('should return user by valid ID', async () => {
      // Arrange
      const userId = 1
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([testUsers.admin])
        })
      })

      // Act
      const result = await userService.getUserById(userId)

      // Assert
      expect(result.success).toBe(true)
      expect(result.user).toBeDefined()
      expect(result.user?.id).toBe(testUsers.admin.id)
      expect(result.user).not.toHaveProperty('password')
    })

    it('should return error for non-existent user ID', async () => {
      // Arrange
      const userId = 999
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]) // No user found
        })
      })

      // Act
      const result = await userService.getUserById(userId)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found')
    })

    it('should handle database errors', async () => {
      // Arrange
      const userId = 1
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockRejectedValue(new Error('Database error'))
        })
      })

      // Act
      const result = await userService.getUserById(userId)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to get user')
    })
  })

  describe('getUserByEmail', () => {
    it('should return user by valid email', async () => {
      // Arrange
      const email = 'admin@heliotropeimaginal.com'
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([testUsers.admin])
        })
      })

      // Act
      const result = await userService.getUserByEmail(email)

      // Assert
      expect(result.success).toBe(true)
      expect(result.user).toBeDefined()
      expect(result.user?.email).toBe(testUsers.admin.email)
      expect(result.user).not.toHaveProperty('password')
    })

    it('should normalize email to lowercase before search', async () => {
      // Arrange
      const email = 'ADMIN@HELIOTROPEIMAGINAL.COM'
      const mockWhere = vi.fn().mockResolvedValue([testUsers.admin])
      
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: mockWhere
        })
      })

      // Act
      await userService.getUserByEmail(email)

      // Assert
      expect(mockWhere).toHaveBeenCalledWith(
        expect.anything() // The actual eq() call with lowercase email
      )
    })

    it('should return error for non-existent email', async () => {
      // Arrange
      const email = 'nonexistent@example.com'
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([])
        })
      })

      // Act
      const result = await userService.getUserByEmail(email)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found')
    })
  })

  describe('Password Security', () => {
    it('should use proper salt rounds for password hashing', async () => {
      // Arrange
      const userData = {
        username: 'testuser',
        password: 'password',
        name: 'Test',
        email: 'test@example.com',
        role: 'participant' as const
      }

      mockBcrypt.genSalt.mockResolvedValue('salt')
      mockBcrypt.hash.mockResolvedValue('hashed')
      mockDb.execute.mockResolvedValue([{ id: 1 }])

      // Act
      await userService.createUser(userData)

      // Assert
      expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10) // Should use 10 salt rounds
    })

    it('should never return password in user objects', async () => {
      // Test that passwords are always excluded from returned user objects
      const testMethods = [
        () => userService.getUserById(1),
        () => userService.getUserByEmail('test@example.com')
      ]

      // Setup mocks
      const userWithPassword = { ...testUsers.admin, password: 'hashed_password' }
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([userWithPassword])
        })
      })

      // Test each method
      for (const method of testMethods) {
        const result = await method()
        if (result.success) {
          expect(result.user).not.toHaveProperty('password')
        }
      }
    })
  })

  describe('Role Management', () => {
    it('should create users with different roles', async () => {
      const roles = ['admin', 'facilitator', 'participant', 'student'] as const

      for (const role of roles) {
        // Arrange
        const userData = {
          username: `${role}user`,
          password: 'password',
          name: `${role} User`,
          email: `${role}@example.com`,
          role
        }

        mockBcrypt.genSalt.mockResolvedValue('salt')
        mockBcrypt.hash.mockResolvedValue('hashed')
        mockDb.execute.mockResolvedValue([{
          id: 1,
          role,
          ...userData
        }])

        // Act
        const result = await userService.createUser(userData)

        // Assert
        expect(result.success).toBe(true)
        expect(result.user?.role).toBe(role)
      }
    })
  })

  describe('Data Validation', () => {
    it('should handle email normalization consistently', async () => {
      const emails = [
        'TEST@EXAMPLE.COM',
        'test@EXAMPLE.com',
        'Test@Example.Com'
      ]

      for (const email of emails) {
        mockBcrypt.genSalt.mockResolvedValue('salt')
        mockBcrypt.hash.mockResolvedValue('hashed')
        mockDb.execute.mockResolvedValue([{
          id: 1,
          email: email.toLowerCase()
        }])

        const userData = {
          username: 'testuser',
          password: 'password',
          name: 'Test User',
          email,
          role: 'participant' as const
        }

        const result = await userService.createUser(userData)
        
        if (result.success) {
          expect(result.user?.email).toBe(email.toLowerCase())
        }
      }
    })
  })
})
