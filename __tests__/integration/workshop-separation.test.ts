/**
 * Workshop Separation Integration Tests
 * ====================================
 * Critical tests to ensure AST and IA workshops remain completely separate
 * and prevent cross-workshop data contamination
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import { testUsers, testWorkshopData } from '../fixtures/workshops'

// Mock database and services
vi.mock('@server/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(),
        leftJoin: vi.fn(() => ({
          where: vi.fn()
        }))
      }))
    })),
    insert: vi.fn(() => ({
      into: vi.fn(() => ({
        values: vi.fn(() => ({
          returning: vi.fn()
        }))
      }))
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn()
      }))
    })),
    execute: vi.fn()
  }
}))

vi.mock('@server/services/user-management-service', () => ({
  userManagementService: {
    getUserById: vi.fn(),
    authenticateUser: vi.fn()
  }
}))

describe('Workshop Separation Integration Tests', () => {
  let app: express.Application
  let mockDb: any

  beforeEach(() => {
    // Setup Express app with both workshop routes
    app = express()
    app.use(express.json())
    
    // Mock session middleware
    app.use((req, res, next) => {
      req.session = { userId: testUsers.participant.id }
      next()
    })

    // Import and setup mocked database
    const { db } = await import('@server/db')
    mockDb = vi.mocked(db)
    
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('API Endpoint Separation', () => {
    it('should reject AST data access via IA endpoints', async () => {
      // Mock AST user data in database
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{
            ...testWorkshopData.ast.starCard,
            workshop_type: 'ast'
          }])
        })
      })

      // Try to access AST data via IA endpoint (should fail)
      const response = await request(app)
        .get('/api/ia/starcard')

      expect(response.status).toBe(404)
      expect(response.body.error).toContain('not found')
    })

    it('should reject IA data access via AST endpoints', async () => {
      // Mock IA user data in database  
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{
            ...testWorkshopData.ia.profile,
            workshop_type: 'ia'
          }])
        })
      })

      // Try to access IA data via AST endpoint (should fail)
      const response = await request(app)
        .get('/api/ast/starcard')

      expect(response.status).toBe(404)
      expect(response.body.error).toContain('not found')
    })

    it('should enforce workshop type in data creation', async () => {
      const astData = { ...testWorkshopData.ast.starCard }
      
      // Try to create AST data via IA endpoint
      const response = await request(app)
        .post('/api/ia/starcard')
        .send(astData)

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('workshop type mismatch')
    })

    it('should validate workshop context in updates', async () => {
      const updateData = { thinking: 50, acting: 30, feeling: 10, planning: 10 }
      
      // Try to update with wrong workshop context
      const response = await request(app)
        .put('/api/ia/starcard/1')
        .send(updateData)

      expect(response.status).toBe(403)
      expect(response.body.error).toContain('workshop access denied')
    })
  })

  describe('Data Model Isolation', () => {
    it('should prevent cross-workshop user data mixing', async () => {
      // Setup user with AST workshop data
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{
            id: testUsers.participant.id,
            workshop_type: 'ast',
            ...testWorkshopData.ast.starCard
          }])
        })
      })

      // Query should only return AST data for AST endpoints
      const astResponse = await request(app)
        .get('/api/ast/workshop-data/user')

      expect(astResponse.status).toBe(200)
      expect(astResponse.body.workshop_type).toBe('ast')

      // IA endpoints should not return this data
      const iaResponse = await request(app)
        .get('/api/ia/workshop-data/user')

      expect(iaResponse.status).toBe(404)
    })

    it('should maintain separate assessment results', async () => {
      const astAssessment = {
        userId: testUsers.participant.id,
        workshop_type: 'ast',
        quadrantData: testWorkshopData.ast.starCard
      }

      const iaAssessment = {
        userId: testUsers.participant.id,
        workshop_type: 'ia',
        capacityData: testWorkshopData.ia.profile
      }

      // Mock separate storage
      mockDb.insert.mockReturnValue({
        into: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([astAssessment])
          })
        })
      })

      // Store AST assessment
      const astResponse = await request(app)
        .post('/api/ast/assessment/complete')
        .send(astAssessment)

      expect(astResponse.status).toBe(200)

      // Store IA assessment (should be separate)
      mockDb.insert.mockReturnValue({
        into: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([iaAssessment])
          })
        })
      })

      const iaResponse = await request(app)
        .post('/api/ia/assessment/complete')
        .send(iaAssessment)

      expect(iaResponse.status).toBe(200)

      // Verify both assessments were stored with correct workshop types
      expect(mockDb.insert).toHaveBeenCalledTimes(2)
    })

    it('should prevent workshop type tampering in requests', async () => {
      const maliciousData = {
        ...testWorkshopData.ast.starCard,
        workshop_type: 'ia' // Trying to fool the system
      }

      const response = await request(app)
        .post('/api/ast/starcard')
        .send(maliciousData)

      // Should reject due to workshop type mismatch
      expect(response.status).toBe(400)
      expect(response.body.error).toContain('workshop type validation failed')
    })
  })

  describe('Route Access Control', () => {
    it('should block unauthorized cross-workshop access', async () => {
      // User enrolled in AST trying to access IA endpoints
      app.use((req, res, next) => {
        req.session.workshopAccess = ['ast'] // Only AST access
        next()
      })

      const response = await request(app)
        .get('/api/ia/workshop-data/step/ia-1-1')

      expect(response.status).toBe(403)
      expect(response.body.error).toContain('insufficient workshop access')
    })

    it('should allow dual workshop access when authorized', async () => {
      // User with access to both workshops
      app.use((req, res, next) => {
        req.session.workshopAccess = ['ast', 'ia']
        next()
      })

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([testWorkshopData.ast.starCard])
        })
      })

      const astResponse = await request(app)
        .get('/api/ast/workshop-data/step/2-1')

      expect(astResponse.status).toBe(200)

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([testWorkshopData.ia.profile])
        })
      })

      const iaResponse = await request(app)
        .get('/api/ia/workshop-data/step/ia-1-1')

      expect(iaResponse.status).toBe(200)
    })

    it('should validate step ID format by workshop', async () => {
      // AST step IDs: 1-1, 1-2, 2-1, 2-2, 3-1, 3-2
      const validAstResponse = await request(app)
        .get('/api/ast/workshop-data/step/2-1')

      expect(validAstResponse.status).not.toBe(400) // Should not be format error

      // IA step IDs: ia-1-1, ia-1-2, ia-2-1, ia-2-2
      const validIaResponse = await request(app)
        .get('/api/ia/workshop-data/step/ia-1-1')

      expect(validIaResponse.status).not.toBe(400) // Should not be format error

      // Invalid cross-workshop step ID
      const invalidResponse = await request(app)
        .get('/api/ast/workshop-data/step/ia-1-1')

      expect(invalidResponse.status).toBe(400)
      expect(invalidResponse.body.error).toContain('invalid step format')
    })
  })

  describe('Session and State Isolation', () => {
    it('should maintain separate workshop progress', async () => {
      const sessionData = {
        userId: testUsers.participant.id,
        astProgress: { currentStep: '2-1', completed: ['1-1', '1-2'] },
        iaProgress: { currentStep: 'ia-1-2', completed: ['ia-1-1'] }
      }

      // Mock session storage
      app.use((req, res, next) => {
        req.session.workshopProgress = sessionData
        next()
      })

      // AST progress should only return AST data
      const astProgressResponse = await request(app)
        .get('/api/ast/workshop-data/progress')

      expect(astProgressResponse.body.currentStep).toBe('2-1')
      expect(astProgressResponse.body.completed).not.toContain('ia-1-1')

      // IA progress should only return IA data
      const iaProgressResponse = await request(app)
        .get('/api/ia/workshop-data/progress')

      expect(iaProgressResponse.body.currentStep).toBe('ia-1-2')
      expect(iaProgressResponse.body.completed).not.toContain('1-1')
    })

    it('should prevent workshop state leakage in responses', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{
            ...testWorkshopData.ast.starCard,
            internal_ia_data: 'should not be exposed', // Sensitive IA data
            workshop_type: 'ast'
          }])
        })
      })

      const response = await request(app)
        .get('/api/ast/starcard')

      expect(response.status).toBe(200)
      expect(response.body).not.toHaveProperty('internal_ia_data')
      expect(response.body.workshop_type).toBe('ast')
    })
  })

  describe('Database Query Isolation', () => {
    it('should filter queries by workshop type', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([testWorkshopData.ast.starCard])
        })
      })

      await request(app)
        .get('/api/ast/workshop-data/assessments')

      // Verify WHERE clause includes workshop type filter
      const whereCall = mockDb.select().from().where
      expect(whereCall).toHaveBeenCalledWith(
        expect.objectContaining({
          workshop_type: 'ast'
        })
      )
    })

    it('should prevent SQL injection via workshop parameters', async () => {
      const maliciousWorkshopType = "ast'; DROP TABLE starcard; --"

      const response = await request(app)
        .get(`/api/workshop-data/${maliciousWorkshopType}/step/1-1`)

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('invalid workshop type')
    })

    it('should validate workshop-specific foreign key relationships', async () => {
      const astStarCard = {
        userId: testUsers.participant.id,
        workshop_type: 'ast',
        flow_attributes_id: 'ia-flow-123' // Wrong workshop reference
      }

      const response = await request(app)
        .post('/api/ast/starcard')
        .send(astStarCard)

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('invalid cross-workshop reference')
    })
  })

  describe('Workshop Theme and Content Separation', () => {
    it('should serve correct workshop themes', async () => {
      // AST should use blue theme
      const astThemeResponse = await request(app)
        .get('/api/ast/workshop-data/theme')

      expect(astThemeResponse.body.primaryColor).toBe('#3B82F6') // Blue
      expect(astThemeResponse.body.workshopName).toBe('AllStarTeams')

      // IA should use purple theme
      const iaThemeResponse = await request(app)
        .get('/api/ia/workshop-data/theme')

      expect(iaThemeResponse.body.primaryColor).toBe('#8B5CF6') // Purple
      expect(iaThemeResponse.body.workshopName).toBe('Imaginal Agility')
    })

    it('should prevent content mixing between workshops', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{
            id: 1,
            content: 'AST specific content about teamwork',
            workshop_type: 'ast'
          }])
        })
      })

      // AST content should not appear in IA endpoints
      const iaContentResponse = await request(app)
        .get('/api/ia/workshop-data/content/step-1')

      expect(iaContentResponse.status).toBe(404)
      expect(iaContentResponse.body).not.toContain('teamwork')
    })
  })

  describe('Error Boundary Testing', () => {
    it('should handle workshop type validation errors gracefully', async () => {
      const invalidData = {
        workshop_type: 'invalid-workshop'
      }

      const response = await request(app)
        .post('/api/workshop-data/generic')
        .send(invalidData)

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('unsupported workshop type')
      expect(response.body.validTypes).toEqual(['ast', 'ia'])
    })

    it('should prevent workshop confusion in error messages', async () => {
      // Try to access AST-specific feature via IA endpoint
      const response = await request(app)
        .get('/api/ia/starcard/download')

      expect(response.status).toBe(404)
      expect(response.body.error).not.toContain('ast')
      expect(response.body.error).toContain('feature not available in Imaginal Agility')
    })

    it('should maintain separation during concurrent access', async () => {
      // Simulate concurrent requests to both workshops
      const astPromise = request(app)
        .get('/api/ast/workshop-data/step/1-1')
      
      const iaPromise = request(app)
        .get('/api/ia/workshop-data/step/ia-1-1')

      const [astResponse, iaResponse] = await Promise.all([astPromise, iaPromise])

      // Both should succeed independently
      expect(astResponse.status).toBe(200)
      expect(iaResponse.status).toBe(200)

      // Responses should not interfere with each other
      expect(astResponse.body.workshopType).toBe('ast')
      expect(iaResponse.body.workshopType).toBe('ia')
    })
  })

  describe('Audit and Logging Separation', () => {
    it('should log workshop-specific actions separately', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      await request(app)
        .post('/api/ast/workshop-data/step/1-1')
        .send({ action: 'complete' })

      await request(app)
        .post('/api/ia/workshop-data/step/ia-1-1')
        .send({ action: 'complete' })

      // Should have separate log entries with workshop context
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[AST]')
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[IA]')
      )

      consoleSpy.mockRestore()
    })

    it('should track workshop-specific user activities', async () => {
      const activityData = {
        userId: testUsers.participant.id,
        action: 'assessment_complete',
        workshop_type: 'ast'
      }

      mockDb.insert.mockReturnValue({
        into: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([activityData])
          })
        })
      })

      const response = await request(app)
        .post('/api/ast/activity/log')
        .send(activityData)

      expect(response.status).toBe(200)
      expect(mockDb.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          workshop_type: 'ast'
        })
      )
    })
  })
})
