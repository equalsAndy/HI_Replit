import { db } from '../db';
import { users } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

class UserManagementService {
  /**
   * Check if a username is available
   */
  async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.username, username));
      
      return existingUser.length === 0;
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  }
  
  /**
   * Create a new user
   */
  async createUser(data: {
    username: string;
    password: string;
    name: string;
    email: string;
    role: 'admin' | 'facilitator' | 'participant' | 'student';
    organization?: string | null;
    jobTitle?: string | null;
    profilePicture?: string | null;
    invitedBy?: number | null;
  }) {
    try {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);
      
      // Insert the user into the database using raw SQL to avoid schema conflicts
      const result = await db.execute(sql`
        INSERT INTO users (username, password, name, email, role, organization, job_title, profile_picture, is_test_user, content_access, ast_access, ia_access, invited_by, created_at, updated_at)
        VALUES (${data.username}, ${hashedPassword}, ${data.name}, ${data.email.toLowerCase()}, ${data.role}, ${data.organization || null}, ${data.jobTitle || null}, ${data.profilePicture || null}, ${(data as any).isTestUser || false}, 'professional', true, true, ${data.invitedBy || null}, NOW(), NOW())
        RETURNING *
      `);
      
      // Return the user without the password
      const userData = (result as any)[0] || (result as any).rows?.[0];
      if (userData) {
        const { password, ...userWithoutPassword } = userData;
        return {
          success: true,
          user: {
            id: userData.id,
            username: userData.username,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            organization: userData.organization,
            jobTitle: userData.job_title,
            profilePicture: userData.profile_picture,
            isTestUser: userData.is_test_user,
            contentAccess: userData.content_access,
            astAccess: userData.ast_access,
            iaAccess: userData.ia_access,
            invitedBy: userData.invited_by,
            createdAt: userData.created_at,
            updatedAt: userData.updated_at
          }
        };
      }
      
      return {
        success: false,
        error: 'Failed to create user'
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        error: 'Failed to create user'
      };
    }
  }
  
  /**
   * Authenticate a user
   */
  async authenticateUser(username: string, password: string) {
    try {
      // Find the user by username
      const result = await db.select()
        .from(users)
        .where(eq(users.username, username));
      
      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }
      
      const user = result[0];
      
      // Verify the password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }
      
      // Return the user without the password
      const { password: _, ...userWithoutPassword } = user;
      return {
        success: true,
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }
  
  /**
   * Get a user by ID
   */
  async getUserById(id: number) {
    try {
      const result = await db.select()
        .from(users)
        .where(eq(users.id, id));
      
      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'User not found'
        };
      }
      
      const user = result[0];
      
      // Return the user without the password
      const { password, ...userWithoutPassword } = user;
      return {
        success: true,
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return {
        success: false,
        error: 'Failed to get user'
      };
    }
  }
  
  /**
   * Get a user by email
   */
  async getUserByEmail(email: string) {
    try {
      const result = await db.select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()));
      
      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'User not found'
        };
      }
      
      const user = result[0];
      
      // Return the user without the password
      const { password, ...userWithoutPassword } = user;
      return {
        success: true,
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      return {
        success: false,
        error: 'Failed to get user'
      };
    }
  }
  
  /**
   * Update a user
   */
  async updateUser(id: number, data: {
    name?: string;
    email?: string;
    organization?: string | null;
    jobTitle?: string | null;
    title?: string | null; // For admin route compatibility
    profilePicture?: string | null;
    isTestUser?: boolean;
    role?: 'admin' | 'facilitator' | 'participant' | 'student';
    navigationProgress?: string | null;
    contentAccess?: 'student' | 'professional' | 'both';
    astAccess?: boolean;
    iaAccess?: boolean;
    password?: string | null;
  }) {
    try {
      const updateData: any = {};
      
      // Handle regular fields
      if (data.name !== undefined) updateData.name = data.name;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.organization !== undefined) updateData.organization = data.organization;
      if (data.jobTitle !== undefined) updateData.jobTitle = data.jobTitle;
      if (data.title !== undefined) updateData.jobTitle = data.title; // Map title to jobTitle
      if (data.profilePicture !== undefined) updateData.profilePicture = data.profilePicture;
      if (data.isTestUser !== undefined) updateData.isTestUser = data.isTestUser;
      if (data.role !== undefined) updateData.role = data.role;
      if (data.navigationProgress !== undefined) updateData.navigationProgress = data.navigationProgress;
      
      // Handle access control fields
      if (data.contentAccess !== undefined) updateData.contentAccess = data.contentAccess;
      if (data.astAccess !== undefined) updateData.astAccess = data.astAccess;
      if (data.iaAccess !== undefined) updateData.iaAccess = data.iaAccess;
      
      let temporaryPassword = null;
      
      // Handle password update
      if (data.password !== undefined) {
        if (data.password === null || data.password === '') {
          // Generate a temporary password
          temporaryPassword = Math.random().toString(36).slice(-8);
          const salt = await bcrypt.genSalt(10);
          updateData.password = await bcrypt.hash(temporaryPassword, salt);
        } else {
          // Use provided password
          const salt = await bcrypt.genSalt(10);
          updateData.password = await bcrypt.hash(data.password, salt);
        }
      }
      
      updateData.updatedAt = new Date();
      
      // Update the user in the database
      const result = await db.update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();
      
      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'User not found'
        };
      }
      
      const user = result[0];
      
      // Return the user without the password
      const { password, ...userWithoutPassword } = user;
      return {
        success: true,
        user: userWithoutPassword,
        temporaryPassword
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        error: 'Failed to update user'
      };
    }
  }
  
  /**
   * Toggle a user's test status
   */
  async toggleTestUserStatus(id: number) {
    try {
      // Get the current test status
      const currentUser = await db.select()
        .from(users)
        .where(eq(users.id, id));
        
      if (!currentUser || currentUser.length === 0) {
        return {
          success: false,
          error: 'User not found'
        };
      }
      
      const isCurrentlyTestUser = currentUser[0].isTestUser;
      
      // Toggle the test status using raw SQL to avoid schema conflicts
      const result = await db.execute(sql`
        UPDATE users 
        SET is_test_user = NOT is_test_user, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `);
      
      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'Failed to update test user status'
        };
      }
      
      const user = result[0];
      
      // Return the user without the password
      const { password, ...userWithoutPassword } = user;
      return {
        success: true,
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Error toggling test user status:', error);
      return {
        success: false,
        error: 'Failed to toggle test user status'
      };
    }
  }
  
  /**
   * Get all users with progress calculation
   */
  async getAllUsers(includeDeleted: boolean = false) {
    try {
      // Get all users
      const result = await db.select().from(users);
      
      // Import schema modules
      const { userAssessments, navigationProgress } = await import('../../shared/schema');
      const { eq, and } = await import('drizzle-orm');
      
      // Get assessment data for all users in parallel
      const userIds = result.map(user => user.id);
      
      // Fetch star card assessments
      const starCardAssessments = await db
        .select()
        .from(userAssessments)
        .where(
          and(
            eq(userAssessments.assessmentType, 'starCard')
          )
        );
      
      // Fetch flow attributes assessments
      const flowAssessments = await db
        .select()
        .from(userAssessments)
        .where(
          and(
            eq(userAssessments.assessmentType, 'flowAttributes')
          )
        );
      
      // Fetch all user assessments
      const allAssessments = await db
        .select()
        .from(userAssessments);
      
      // Fetch navigation progress
      const navProgress = await db
        .select()
        .from(navigationProgress);
      
      // Build user data with real assessment status
      const usersWithoutPasswords = result.map(user => {
        const { password, ...userWithoutPassword } = user;
        
        // Check for real assessment data
        const hasStarCard = starCardAssessments.some(assessment => assessment.userId === user.id);
        const hasFlowAttributes = flowAssessments.some(assessment => assessment.userId === user.id);
        const hasAssessment = allAssessments.some(assessment => assessment.userId === user.id);
        
        // Get navigation progress data
        const userNavProgress = navProgress.filter(nav => nav.userId === user.id);
        const astProgress = userNavProgress.find(nav => nav.appType === 'ast');
        const iaProgress = userNavProgress.find(nav => nav.appType === 'ia');
        
        // Debug logging for AST progress
        if (user.id === 1) {
          console.log(`Debug Admin User (${user.id}) AST Progress:`, {
            userNavProgress: userNavProgress.length,
            astProgress: astProgress ? {
              completedSteps: astProgress.completedSteps,
              currentStepId: astProgress.currentStepId,
              unlockedSteps: astProgress.unlockedSteps
            } : null
          });
        }
        
        return {
          ...userWithoutPassword,
          progress: 0,
          hasAssessment,
          hasStarCard,
          hasFlowAttributes,
          astProgress: astProgress ? {
            completedSteps: Array.isArray(astProgress.completedSteps) 
              ? astProgress.completedSteps 
              : JSON.parse(astProgress.completedSteps || '[]'),
            currentStepId: astProgress.currentStepId,
            unlockedSteps: Array.isArray(astProgress.unlockedSteps) 
              ? astProgress.unlockedSteps 
              : JSON.parse(astProgress.unlockedSteps || '[]'),
            videoProgress: typeof astProgress.videoProgress === 'object' 
              ? astProgress.videoProgress 
              : JSON.parse(astProgress.videoProgress || '{}')
          } : null,
          iaProgress: iaProgress ? {
            completedSteps: Array.isArray(iaProgress.completedSteps) 
              ? iaProgress.completedSteps 
              : JSON.parse(iaProgress.completedSteps || '[]'),
            currentStepId: iaProgress.currentStepId,
            unlockedSteps: Array.isArray(iaProgress.unlockedSteps) 
              ? iaProgress.unlockedSteps 
              : JSON.parse(iaProgress.unlockedSteps || '[]'),
            videoProgress: typeof iaProgress.videoProgress === 'object' 
              ? iaProgress.videoProgress 
              : JSON.parse(iaProgress.videoProgress || '{}')
          } : null,
          navigationProgress: user.navigationProgress // Include navigation progress for admin
        };
      });
      
      return {
        success: true,
        users: usersWithoutPasswords
      };
    } catch (error) {
      console.error('Error getting all users:', error);
      return {
        success: false,
        error: 'Failed to get users'
      };
    }
  }

  /**
   * Get all test users
   */
  async getAllTestUsers() {
    try {
      const result = await db.select()
        .from(users)
        .where(eq(users.isTestUser, true));
      
      // Return the users without their passwords
      const usersWithoutPasswords = result.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      return {
        success: true,
        users: usersWithoutPasswords
      };
    } catch (error) {
      console.error('Error getting test users:', error);
      return {
        success: false,
        error: 'Failed to get test users'
      };
    }
  }
  
  /**
   * Get all videos from the database
   */
  async getVideos() {
    try {
      // Import videos table from schema
      const { videos } = await import('@shared/schema');
      
      // Query the actual database for videos
      const result = await db.select().from(videos).orderBy(videos.sortOrder);
      
      // Transform the data to match the expected format
      return result.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description,
        url: video.url,
        editableId: video.editableId,
        workshop_type: video.workshopType,
        section: video.section,
        step_id: video.stepId,
        autoplay: video.autoplay,
        sortOrder: video.sortOrder
      }));
    } catch (error) {
      console.error('Error getting videos from database:', error);
      throw error;
    }
  }

  async getVideosByWorkshop(workshopType: string) {
    try {
      // Import videos table from schema
      const { videos } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');
      
      // Query the actual database for videos by workshop type
      const result = await db.select()
        .from(videos)
        .where(eq(videos.workshopType, workshopType))
        .orderBy(videos.sortOrder);
      
      // Transform the data to match the expected format
      return result.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description,
        url: video.url,
        editableId: video.editableId,
        workshop_type: video.workshopType,
        section: video.section,
        step_id: video.stepId,
        autoplay: video.autoplay,
        sortOrder: video.sortOrder
      }));
    } catch (error) {
      console.error('Error getting videos by workshop from database:', error);
      throw error;
    }
  }
  
  /**
   * Update a video
   */
  async updateVideo(id: number, data: any) {
    try {
      // Import videos table from schema
      const { videos } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');
      
      // Prepare update data - only update provided fields
      const updateData: any = {
        updatedAt: new Date()
      };
      
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.url !== undefined) updateData.url = data.url;
      if (data.editableId !== undefined) updateData.editableId = data.editableId;
      if (data.workshop_type !== undefined) updateData.workshopType = data.workshop_type;
      if (data.workshopType !== undefined) updateData.workshopType = data.workshopType;
      if (data.section !== undefined) updateData.section = data.section;
      if (data.stepId !== undefined) updateData.stepId = data.stepId;
      if (data.step_id !== undefined) updateData.stepId = data.step_id;
      if (data.autoplay !== undefined) updateData.autoplay = data.autoplay;
      if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
      if (data.sort_order !== undefined) updateData.sortOrder = data.sort_order;
      
      console.log(`Updating video ${id} with data:`, updateData);
      
      // Update the video in the database
      const result = await db.update(videos)
        .set(updateData)
        .where(eq(videos.id, id))
        .returning();
      
      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'Video not found'
        };
      }
      
      const updatedVideo = result[0];
      console.log(`Successfully updated video ${id}:`, updatedVideo);
      
      return {
        success: true,
        video: {
          id: updatedVideo.id,
          title: updatedVideo.title,
          description: updatedVideo.description,
          url: updatedVideo.url,
          editableId: updatedVideo.editableId,
          workshop_type: updatedVideo.workshopType,
          section: updatedVideo.section,
          step_id: updatedVideo.stepId,
          autoplay: updatedVideo.autoplay,
          sortOrder: updatedVideo.sortOrder
        }
      };
    } catch (error) {
      console.error('Error updating video:', error);
      return {
        success: false,
        error: 'Failed to update video: ' + (error instanceof Error ? error.message : 'Unknown error')
      };
    }
  }

  /**
   * Delete all user data except profile and password
   */
  async deleteUserData(userId: number) {
    try {
      console.log(`Starting complete data deletion for user ${userId}`);
      
      const { sql } = await import('drizzle-orm');
      
      let deletedData = {
        userAssessments: 0,
        navigationProgressTable: 0,
        navigationProgressField: false,
        workshopParticipation: 0,
        growthPlans: 0,
        finalReflections: 0,
        discernmentProgress: 0
      };

      // 1. Delete ALL user assessments (includes star cards, flow data, reflections, etc.)
      try {
        const assessmentResult = await db.execute(sql`DELETE FROM user_assessments WHERE user_id = ${userId}`);
        deletedData.userAssessments = assessmentResult.length;
        console.log(`Deleted ${deletedData.userAssessments} assessment records for user ${userId}`);
      } catch (error) {
        console.log(`No user assessments found for user ${userId}:`, error.message);
      }

      // 2. Delete navigation progress from dedicated table
      try {
        const navResult = await db.execute(sql`DELETE FROM navigation_progress WHERE user_id = ${userId}`);
        deletedData.navigationProgressTable = navResult.length;
        console.log(`Deleted ${deletedData.navigationProgressTable} navigation progress records for user ${userId}`);
      } catch (error) {
        console.log(`No navigation progress found for user ${userId}:`, error.message);
      }

      // 3. Clear navigation progress field in users table
      try {
        await db.execute(sql`UPDATE users SET navigation_progress = NULL WHERE id = ${userId}`);
        deletedData.navigationProgressField = true;
        console.log(`Cleared navigation_progress field in users table for user ${userId}`);
      } catch (error) {
        console.log(`Error clearing navigation_progress field for user ${userId}:`, error.message);
      }

      // 4. Delete workshop participation data
      try {
        const workshopResult = await db.execute(sql`DELETE FROM workshop_participation WHERE user_id = ${userId}`);
        deletedData.workshopParticipation = workshopResult.length;
        console.log(`Deleted ${deletedData.workshopParticipation} workshop participation records for user ${userId}`);
      } catch (error) {
        console.log(`No workshop participation found for user ${userId}`);
      }

      // 5. Delete growth plans
      try {
        const growthResult = await db.execute(sql`DELETE FROM growth_plans WHERE user_id = ${userId}`);
        deletedData.growthPlans = growthResult.length;
        console.log(`Deleted ${deletedData.growthPlans} growth plan records for user ${userId}`);
      } catch (error) {
        console.log(`No growth plans found for user ${userId}`);
      }

      // 6. Delete final reflections
      try {
        const reflectionResult = await db.execute(sql`DELETE FROM final_reflections WHERE user_id = ${userId}`);
        deletedData.finalReflections = reflectionResult.length;
        console.log(`Deleted ${deletedData.finalReflections} final reflection records for user ${userId}`);
      } catch (error) {
        console.log(`No final reflections found for user ${userId}`);
      }

      // 7. Delete discernment progress
      try {
        const discernmentResult = await db.execute(sql`DELETE FROM user_discernment_progress WHERE user_id = ${userId}`);
        deletedData.discernmentProgress = discernmentResult.length;
        console.log(`Deleted ${deletedData.discernmentProgress} discernment progress records for user ${userId}`);
      } catch (error) {
        console.log(`No discernment progress found for user ${userId}`);
      }

      const totalRecordsDeleted = deletedData.userAssessments + 
        deletedData.navigationProgressTable + 
        deletedData.workshopParticipation + 
        deletedData.growthPlans + 
        deletedData.finalReflections + 
        deletedData.discernmentProgress;

      console.log(`Completed data deletion for user ${userId}:`, deletedData);

      return {
        success: true,
        message: 'User data deleted successfully',
        deletedData,
        summary: `Deleted ${totalRecordsDeleted} total records across ${Object.keys(deletedData).length} data categories`
      };
    } catch (error) {
      console.error('Error deleting user data:', error);
      return {
        success: false,
        error: 'Failed to delete user data: ' + (error instanceof Error ? error.message : 'Unknown error')
      };
    }
  }

  async deleteUser(userId: number) {
    try {
      console.log(`Starting complete user deletion for user ${userId}`);
      
      // Import required modules
      const { eq } = await import('drizzle-orm');
      const { sql } = await import('drizzle-orm');
      
      // First delete all related data
      await this.deleteUserData(userId);
      
      // Then delete the user account itself
      try {
        await db.execute(sql`DELETE FROM users WHERE id = ${userId}`);
        console.log(`Deleted user account for user ${userId}`);
        
        return {
          success: true,
          message: 'User deleted successfully'
        };
      } catch (error) {
        console.error(`Error deleting user account ${userId}:`, error);
        return {
          success: false,
          error: 'Failed to delete user account'
        };
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        error: 'Failed to delete user'
      };
    }
  }
}

export const userManagementService = new UserManagementService();