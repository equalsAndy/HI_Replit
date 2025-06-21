import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
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
    role: 'admin' | 'facilitator' | 'participant';
    organization?: string | null;
    jobTitle?: string | null;
    profilePicture?: string | null;
  }) {
    try {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);
      
      // Insert the user into the database
      const result = await db.insert(users).values({
        username: data.username,
        password: hashedPassword,
        name: data.name,
        email: data.email.toLowerCase(),
        role: data.role,
        organization: data.organization || null,
        jobTitle: data.jobTitle || null,
        profilePicture: data.profilePicture || null,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      // Return the user without the password
      const user = result[0];
      if (user) {
        const { password, ...userWithoutPassword } = user;
        return {
          success: true,
          user: userWithoutPassword
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
    role?: 'admin' | 'facilitator' | 'participant';
    navigationProgress?: string | null;
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
      
      // Toggle the test status
      const result = await db.update(users)
        .set({
          isTestUser: !isCurrentlyTestUser,
          updatedAt: new Date()
        })
        .where(eq(users.id, id))
        .returning();
      
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
      // For now, just return success
      // In a real implementation, this would update the video in the database
      return {
        success: true,
        video: {
          id,
          ...data
        }
      };
    } catch (error) {
      console.error('Error updating video:', error);
      return {
        success: false,
        error: 'Failed to update video'
      };
    }
  }

  /**
   * Delete all user data except profile and password
   */
  async deleteUserData(userId: number) {
    try {
      console.log(`Starting data deletion for user ${userId}`);
      
      // Import required modules
      const { eq, and } = await import('drizzle-orm');
      const { sql } = await import('drizzle-orm');
      
      let deletedData = {
        starCard: false,
        flowAttributes: false,
        userAssessments: false,
        navigationProgress: false
      };

      // 1. Delete star card data
      try {
        const starCardResult = await db.execute(sql`DELETE FROM star_cards WHERE user_id = ${userId}`);
        console.log(`Deleted star card data for user ${userId}`);
        deletedData.starCard = true;
      } catch (error) {
        console.log(`No star card data found for user ${userId}`);
        deletedData.starCard = true; // Count as success if nothing to delete
      }

      // 2. Delete flow attributes
      try {
        const flowResult = await db.execute(sql`DELETE FROM flow_attributes WHERE user_id = ${userId}`);
        console.log(`Deleted flow attributes for user ${userId}`);
        deletedData.flowAttributes = true;
      } catch (error) {
        console.log(`No flow attributes found for user ${userId}`);
        deletedData.flowAttributes = true;
      }

      // 3. Delete user assessments
      try {
        const assessmentResult = await db.execute(sql`DELETE FROM user_assessments WHERE user_id = ${userId}`);
        console.log(`Deleted user assessments for user ${userId}`);
        deletedData.userAssessments = true;
      } catch (error) {
        console.log(`No user assessments found for user ${userId}`);
        deletedData.userAssessments = true;
      }

      // 4. Delete navigation progress from dedicated table
      try {
        const navResult = await db.execute(sql`DELETE FROM navigation_progress WHERE user_id = ${userId}`);
        console.log(`Deleted navigation progress for user ${userId}:`, navResult);
        deletedData.navigationProgress = true;
      } catch (error) {
        console.log(`No navigation progress found for user ${userId}`);
        deletedData.navigationProgress = true;
      }

      // 5. Clear navigation progress field in users table
      try {
        await db.execute(sql`UPDATE users SET navigation_progress = NULL WHERE id = ${userId}`);
        console.log(`Cleared navigation_progress field in users table for user ${userId}`);
      } catch (error) {
        console.log(`Error clearing navigation_progress field for user ${userId}:`, error);
      }

      // 5. Delete any workshop participation data
      try {
        await db.execute(sql`DELETE FROM workshop_participation WHERE user_id = ${userId}`);
        console.log(`Deleted workshop participation for user ${userId}`);
      } catch (error) {
        console.log(`No workshop participation found for user ${userId}`);
      }

      console.log(`Completed data deletion for user ${userId}`, deletedData);

      return {
        success: true,
        message: 'User data deleted successfully',
        deletedData
      };
    } catch (error) {
      console.error('Error deleting user data:', error);
      return {
        success: false,
        error: 'Failed to delete user data'
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