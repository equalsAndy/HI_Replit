import { db } from '../db.js';
import { users } from '../../shared/schema.js';
import { eq, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { convertUserToPhotoReference, processProfilePicture, sanitizeUserForNetwork } from '../utils/user-photo-utils.js';

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
    isBetaTester?: boolean;
  }) {
    try {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);
      
      // Insert the user into the database using raw SQL to avoid schema conflicts
      const result = await db.execute(sql`
        INSERT INTO users (username, password, name, email, role, organization, job_title, profile_picture, is_test_user, is_beta_tester, content_access, ast_access, ia_access, invited_by, created_at, updated_at)
        VALUES (${data.username}, ${hashedPassword}, ${data.name}, ${data.email.toLowerCase()}, ${data.role}, ${data.organization || null}, ${data.jobTitle || null}, ${data.profilePicture || null}, ${(data as any).isTestUser || false}, ${data.isBetaTester || false}, 'professional', true, true, ${data.invitedBy || null}, NOW(), NOW())
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
            isBetaTester: userData.is_beta_tester,
            showDemoDataButtons: userData.show_demo_data_buttons,
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
      // TEMPORARY FIX: Use raw SQL to bypass Drizzle schema issues
      const result = await db.execute(sql`
        SELECT * FROM users WHERE username = ${username} LIMIT 1
      `);
      
      console.log('🔍 Raw SQL result:', result);
      console.log('🔍 Result type:', typeof result);
      console.log('🔍 Result length:', result?.length);
      console.log('🔍 First item:', result?.[0]);
      
      if (!result || result.length === 0) {
        console.log('❌ No user found for username:', username);
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }
      
      // Handle different result formats from raw SQL
      const user = result[0] || (result as any).rows?.[0];
      console.log('🔍 Selected user:', user ? 'Found' : 'Not found');
      console.log('🔍 User object keys:', user ? Object.keys(user) : 'None');
      
      // Verify the password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }
      
      // Return the user without the password and map database fields to camelCase
      const { password: _, ...rawUser } = user;
      return {
        success: true,
        user: {
          id: rawUser.id,
          username: rawUser.username,
          name: rawUser.name,
          email: rawUser.email,
          role: rawUser.role,
          organization: rawUser.organization,
          jobTitle: rawUser.job_title,
          profilePicture: rawUser.profile_picture,
          isTestUser: rawUser.is_test_user,
          isBetaTester: rawUser.is_beta_tester,
          hasSeenBetaWelcome: rawUser.has_seen_beta_welcome,
          showDemoDataButtons: rawUser.show_demo_data_buttons,
          contentAccess: rawUser.content_access,
          astAccess: rawUser.ast_access,
          iaAccess: rawUser.ia_access,
          invitedBy: rawUser.invited_by,
          createdAt: rawUser.created_at,
          updatedAt: rawUser.updated_at
        }
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
      
      // Return the user without the password and map database fields to camelCase
      const { password: _, ...rawUser } = user;
      return {
        success: true,
        user: {
          id: rawUser.id,
          username: rawUser.username,
          name: rawUser.name,
          email: rawUser.email,
          role: rawUser.role,
          organization: rawUser.organization,
          jobTitle: rawUser.jobTitle,
          profilePicture: rawUser.profilePicture,
          isTestUser: rawUser.isTestUser,
          isBetaTester: rawUser.isBetaTester,
          hasSeenBetaWelcome: rawUser.hasSeenBetaWelcome,
          showDemoDataButtons: rawUser.showDemoDataButtons,
          contentAccess: rawUser.contentAccess,
          astAccess: rawUser.astAccess,
          iaAccess: rawUser.iaAccess,
          invitedBy: rawUser.invitedBy,
          createdAt: rawUser.createdAt,
          updatedAt: rawUser.updatedAt
        }
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
    isBetaTester?: boolean;
    showDemoDataButtons?: boolean;
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
      if (data.isBetaTester !== undefined) {
        console.log(`🔍 DEBUG: Updating isBetaTester for user ${id} from ${data.isBetaTester}`);
        updateData.isBetaTester = data.isBetaTester;
      }
      if (data.showDemoDataButtons !== undefined) updateData.showDemoDataButtons = data.showDemoDataButtons;
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
      
      // Debug log the update data
      console.log(`🔍 DEBUG: About to update user ${id} with data:`, JSON.stringify(updateData, null, 2));
      
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
      
      // Debug log the returned user
      console.log(`🔍 DEBUG: User ${id} updated successfully. isBetaTester in result:`, user.isBetaTester || user.is_beta_tester);
      
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
        
        // Debug logging for beta tester fields
        if (user.id === 8) {
          console.log(`🔍 DEBUG: User ${user.id} raw data:`, {
            isBetaTester: user.isBetaTester,
            is_beta_tester: (user as any).is_beta_tester,
            showDemoDataButtons: user.showDemoDataButtons,
            show_demo_data_buttons: (user as any).show_demo_data_buttons
          });
        }
        
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
   * Get all beta testers - TEMPORARILY DISABLED
   */
  async getAllBetaTesters() {
    try {
      const result = await db.select()
        .from(users)
        .where(eq(users.isBetaTester, true));
      
      return {
        success: true,
        users: result.map(user => ({
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization,
          jobTitle: user.jobTitle,
          profilePicture: user.profilePicture,
          isTestUser: user.isTestUser,
          isBetaTester: user.isBetaTester,
          showDemoDataButtons: user.showDemoDataButtons,
          contentAccess: user.contentAccess,
          astAccess: user.astAccess,
          iaAccess: user.iaAccess,
          invitedBy: user.invitedBy,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }))
      };
    } catch (error) {
      console.error('Error getting beta testers:', error);
      return {
        success: false,
        error: 'Failed to get beta testers'
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
      const { videos } = await import('../../shared/schema.js');
      
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
      const { videos } = await import('../../shared/schema.js');
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
      const { videos } = await import('../../shared/schema.js');
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
      if (data.requiredWatchPercentage !== undefined) updateData.requiredWatchPercentage = data.requiredWatchPercentage;
      if (data.required_watch_percentage !== undefined) updateData.requiredWatchPercentage = data.required_watch_percentage;
      
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
          sortOrder: updatedVideo.sortOrder,
          requiredWatchPercentage: updatedVideo.requiredWatchPercentage
        }
      };
    } catch (error) {
      console.error('Error updating video:', error);
      return {
        success: false,
        error: 'Failed to update video: ' + (error instanceof Error ? (error as Error).message : 'Unknown error')
      };
    }
  }

  /**
   * Delete a video
   */
  async deleteVideo(id: number) {
    try {
      console.log(`Attempting to delete video ${id}`);
      
      const { sql } = await import('drizzle-orm');
      
      // First check if video exists
      const existingVideo = await db.execute(sql`SELECT id FROM videos WHERE id = ${id}`);
      
      if (existingVideo.length === 0) {
        console.log(`Video ${id} not found`);
        return {
          success: false,
          error: 'Video not found'
        };
      }
      
      // Delete the video
      const result = await db.execute(sql`DELETE FROM videos WHERE id = ${id}`);
      
      console.log(`Successfully deleted video ${id}`);
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting video:', error);
      return {
        success: false,
        error: 'Failed to delete video: ' + (error instanceof Error ? (error as Error).message : 'Unknown error')
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
        discernmentProgress: 0,
        workshopStepData: 0,
        holisticReports: 0,
        holisticReportFiles: 0
      };

      // 1. Delete ALL user assessments (includes star cards, flow data, reflections, etc.)
      try {
        const assessmentResult = await db.execute(sql`DELETE FROM user_assessments WHERE user_id = ${userId}`);
        deletedData.userAssessments = assessmentResult.length;
        console.log(`Deleted ${deletedData.userAssessments} assessment records for user ${userId}`);
      } catch (error) {
        console.log(`No user assessments found for user ${userId}:`, (error as Error).message);
      }

      // 2. Delete navigation progress from dedicated table
      try {
        const navResult = await db.execute(sql`DELETE FROM navigation_progress WHERE user_id = ${userId}`);
        deletedData.navigationProgressTable = navResult.length;
        console.log(`Deleted ${deletedData.navigationProgressTable} navigation progress records for user ${userId}`);
      } catch (error) {
        console.log(`No navigation progress found for user ${userId}:`, (error as Error).message);
      }

      // 3. Clear navigation progress field in users table and reset workshop completion status
      try {
        await db.execute(sql`UPDATE users SET 
          navigation_progress = NULL,
          ast_workshop_completed = false,
          ia_workshop_completed = false,
          ast_completed_at = NULL,
          ia_completed_at = NULL
        WHERE id = ${userId}`);
        deletedData.navigationProgressField = true;
        console.log(`Cleared navigation_progress field and reset workshop completion status for user ${userId}`);
      } catch (error) {
        console.log(`Error clearing navigation_progress field for user ${userId}:`, (error as Error).message);
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

      // 8. Delete workshop step data (hybrid approach: hard delete for test users, soft delete for production)
      let workshopStepDataDeleted = 0;
      try {
        console.log(`=== STARTING HYBRID WORKSHOP RESET for user ${userId} ===`);
        
        // Get user info to determine reset strategy
        const userResult = await db.execute(sql`SELECT is_test_user FROM users WHERE id = ${userId}`);
        
        if (userResult.length > 0) {
          const isTestUser = userResult[0].is_test_user;
          console.log(`=== RESET STRATEGY: User ${userId} isTestUser: ${isTestUser} ===`);
          
          if (isTestUser) {
            // Hard delete for test users (no recovery needed)
            console.log(`=== ATTEMPTING HARD DELETE for test user ${userId} ===`);
            const workshopResult = await db.execute(sql`DELETE FROM workshop_step_data WHERE user_id = ${userId}`);
            workshopStepDataDeleted = Array.isArray(workshopResult) ? workshopResult.length : (workshopResult as any).changes || 0;
            console.log(`=== HARD DELETE: Permanently deleted ${workshopStepDataDeleted} workshop records for test user ${userId} ===`);
          } else {
            // Soft delete for production users (recovery possible)
            console.log(`=== ATTEMPTING SOFT DELETE for production user ${userId} ===`);
            const workshopResult = await db.execute(sql`UPDATE workshop_step_data SET deleted_at = NOW(), updated_at = NOW() WHERE user_id = ${userId} AND deleted_at IS NULL`);
            workshopStepDataDeleted = Array.isArray(workshopResult) ? workshopResult.length : (workshopResult as any).changes || 0;
            console.log(`=== SOFT DELETE: Marked ${workshopStepDataDeleted} workshop records as deleted for production user ${userId} ===`);
          }
        }
      } catch (error) {
        console.error(`ERROR resetting workshop step data for user ${userId}:`, error);
      }

      // Add workshop step data to deleted data tracking
      deletedData.workshopStepData = workshopStepDataDeleted;

      // 9. Delete holistic report DB records
      try {
        const holisticResult = await db.execute(sql`DELETE FROM holistic_reports WHERE user_id = ${userId}`);
        deletedData.holisticReports = holisticResult.length || 0;
        console.log(`Deleted ${deletedData.holisticReports} holistic report DB records for user ${userId}`);
      } catch (error) {
        console.log(`No holistic reports found for user ${userId}`);
      }

      // 10. Delete holistic report PDF files from /uploads
      try {
        const fs = await import('fs');
        const path = await import('path');
        const uploadsDir = path.resolve(process.cwd(), 'uploads');
        const files = fs.readdirSync(uploadsDir);
        const userPattern = new RegExp(`HI-Report-.*${userId}.*\\.pdf$`);
        let deletedFiles = 0;
        for (const file of files) {
          if (userPattern.test(file)) {
            try {
              fs.unlinkSync(path.join(uploadsDir, file));
              deletedFiles++;
              console.log(`Deleted holistic report file: ${file}`);
            } catch (err) {
              console.error(`Error deleting file ${file}:`, err);
            }
          }
        }
        deletedData.holisticReportFiles = deletedFiles;
        console.log(`Deleted ${deletedFiles} holistic report PDF files for user ${userId}`);
      } catch (error) {
        console.error(`Error deleting holistic report files for user ${userId}:`, error);
      }

      const totalRecordsDeleted = deletedData.userAssessments + 
        deletedData.navigationProgressTable + 
        deletedData.workshopParticipation + 
        deletedData.growthPlans + 
        deletedData.finalReflections + 
        deletedData.discernmentProgress + 
        deletedData.workshopStepData +
        deletedData.holisticReports +
        deletedData.holisticReportFiles;

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
        error: 'Failed to delete user data: ' + (error instanceof Error ? (error as Error).message : 'Unknown error')
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

  /**
   * Get users that are accessible to a facilitator (role-based scoping)
   * Includes users assigned directly to facilitator and users in facilitator's cohorts
   */
  async getUsersForFacilitator(facilitatorId: number, includeDeleted: boolean = false) {
    try {
      const { sql } = await import('drizzle-orm');
      
      // Build the query to get users scoped to this facilitator
      // Include users directly assigned to facilitator OR users in facilitator's cohorts
      const usersQuery = sql`
        SELECT DISTINCT u.*, 
               c.name as cohort_name, 
               o.name as organization_name
        FROM users u
        LEFT JOIN cohorts c ON u.cohort_id = c.id  
        LEFT JOIN organizations o ON u.organization_id = o.id
        WHERE (
          u.assigned_facilitator_id = ${facilitatorId} 
          OR u.cohort_id IN (
            SELECT id FROM cohorts WHERE facilitator_id = ${facilitatorId}
          )
        )
        ${includeDeleted ? sql`` : sql`AND u.deleted_at IS NULL`}
        ORDER BY u.created_at DESC
      `;
      
      const result = await db.execute(usersQuery);
      
      if (!result || result.length === 0) {
        return {
          success: true,
          users: []
        };
      }
      
      // Import schema modules for assessment data
      const { userAssessments, navigationProgress } = await import('../../shared/schema');
      const { eq, and } = await import('drizzle-orm');
      
      // Get assessment data for all scoped users
      const userIds = result.map((user: any) => user.id);
      
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
      
      // Build user data with assessment status (same structure as getAllUsers)
      const usersWithoutPasswords = result.map((user: any) => {
        const { password, ...userWithoutPassword } = user;
        
        // Check for real assessment data
        const hasStarCard = starCardAssessments.some(assessment => assessment.userId === user.id);
        const hasFlowAttributes = flowAssessments.some(assessment => assessment.userId === user.id);
        const hasAssessment = allAssessments.some(assessment => assessment.userId === user.id);
        
        // Get navigation progress data
        const userNavProgress = navProgress.filter(nav => nav.userId === user.id);
        const astProgress = userNavProgress.find(nav => nav.appType === 'ast');
        const iaProgress = userNavProgress.find(nav => nav.appType === 'ia');
        
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
          navigationProgress: user.navigationProgress,
          // Include cohort and organization info from the join
          cohortName: user.cohort_name,
          organizationName: user.organization_name
        };
      });
      
      console.log(`Facilitator ${facilitatorId} accessed ${usersWithoutPasswords.length} scoped users`);
      
      return {
        success: true,
        users: usersWithoutPasswords
      };
    } catch (error) {
      console.error('Error getting users for facilitator:', error);
      return {
        success: false,
        error: 'Failed to get users for facilitator'
      };
    }
  }

  /**
   * Update user password
   */
  async updateUserPassword(userId: number, hashedPassword: string) {
    try {
      const result = await db.execute(sql`
        UPDATE users 
        SET password = ${hashedPassword}, updated_at = NOW()
        WHERE id = ${userId}
        RETURNING id
      `);

      const updatedUser = (result as any)[0] || (result as any).rows?.[0];
      
      if (!updatedUser) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        message: 'Password updated successfully'
      };
    } catch (error) {
      console.error('Error updating user password:', error);
      return {
        success: false,
        error: 'Failed to update password'
      };
    }
  }

  /**
   * Mark beta welcome as seen for a user
   */
  async markBetaWelcomeAsSeen(userId: number) {
    try {
      const result = await db.execute(sql`
        UPDATE users 
        SET has_seen_beta_welcome = true, updated_at = NOW()
        WHERE id = ${userId} AND is_beta_tester = true
        RETURNING id, username, name, email, is_beta_tester, has_seen_beta_welcome
      `);
      
      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'User not found or not a beta tester'
        };
      }
      
      return {
        success: true,
        user: result[0]
      };
    } catch (error) {
      console.error('Error marking beta welcome as seen:', error);
      return {
        success: false,
        error: 'Failed to update beta welcome status'
      };
    }
  }
}

export const userManagementService = new UserManagementService();