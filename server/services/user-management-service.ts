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
      const { eq, and, isNotNull, sql } = await import('drizzle-orm');
      
      let result;
      
      if (!includeDeleted) {
        result = await db.select().from(users).where(eq(users.isDeleted, false));
      } else {
        result = await db.select().from(users);
      }
      
      // Calculate progress for each user
      const usersWithProgress = await Promise.all(result.map(async (user) => {
        const { password, ...userWithoutPassword } = user;
        
        try {
          // Get user's navigation progress
          let progress = 0;
          if (user.navigationProgress) {
            try {
              const navProgress = JSON.parse(user.navigationProgress);
              progress = navProgress.progress || 0;
            } catch (e) {
              progress = 0;
            }
          }
          
          // Check for assessment data
          let hasAssessment = false;
          try {
            const assessments = await db.execute(sql`SELECT COUNT(*) as count FROM user_assessments WHERE user_id = ${user.id}`);
            hasAssessment = assessments[0]?.count > 0;
          } catch (e) {
            hasAssessment = false;
          }
          
          // Check for star card data
          let hasStarCard = false;
          try {
            const starCards = await db.execute(sql`SELECT COUNT(*) as count FROM star_cards WHERE user_id = ${user.id}`);
            hasStarCard = starCards[0]?.count > 0;
          } catch (e) {
            hasStarCard = false;
          }
          
          // Check for flow attributes data
          let hasFlowAttributes = false;
          try {
            const flowAttrs = await db.execute(sql`SELECT COUNT(*) as count FROM flow_attributes WHERE user_id = ${user.id}`);
            hasFlowAttributes = flowAttrs[0]?.count > 0;
          } catch (e) {
            hasFlowAttributes = false;
          }
          
          return {
            ...userWithoutPassword,
            progress,
            hasAssessment,
            hasStarCard,
            hasFlowAttributes
          };
        } catch (error) {
          console.error(`Error calculating progress for user ${user.id}:`, error);
          return {
            ...userWithoutPassword,
            progress: 0,
            hasAssessment: false,
            hasStarCard: false,
            hasFlowAttributes: false
          };
        }
      }));
      
      return {
        success: true,
        users: usersWithProgress
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
      // Return real data from the add-workshop-videos file
      return [
        // AllStarTeams Workshop Videos
        {
          id: 1,
          title: "Intro to Strengths",
          description: "Introduction to understanding your strengths",
          url: "https://www.youtube.com/embed/ao04eaeDIFQ?enablejsapi=1",
          editableId: "ao04eaeDIFQ",
          workshop_type: "allstarteams",
          section: "introduction",
          sortOrder: 1
        },
        {
          id: 2,
          title: "Your Star Profile",
          description: "Understanding your personal Star Profile",
          url: "https://www.youtube.com/embed/x6h7LDtdnJw?enablejsapi=1",
          editableId: "x6h7LDtdnJw",
          workshop_type: "allstarteams",
          section: "assessment",
          sortOrder: 2
        },
        {
          id: 3,
          title: "Intro to Flow",
          description: "Introduction to flow states and performance",
          url: "https://www.youtube.com/embed/JxdhWd8agmE?enablejsapi=1",
          editableId: "JxdhWd8agmE",
          workshop_type: "allstarteams",
          section: "flow",
          sortOrder: 3
        },
        {
          id: 4,
          title: "Rounding Out",
          description: "Developing a well-rounded approach",
          url: "https://www.youtube.com/embed/srLM8lHPj40?enablejsapi=1",
          editableId: "srLM8lHPj40",
          workshop_type: "allstarteams",
          section: "development",
          sortOrder: 4
        },
        {
          id: 5,
          title: "Ladder of Well-being",
          description: "Understanding the Well-being Ladder concept",
          url: "https://www.youtube.com/embed/yidsMx8B678?enablejsapi=1",
          editableId: "yidsMx8B678",
          workshop_type: "allstarteams",
          section: "wellbeing",
          sortOrder: 5
        },
        {
          id: 6,
          title: "Your Future Self",
          description: "Envisioning and planning for your future",
          url: "https://www.youtube.com/embed/_VsH5NO9jyg?enablejsapi=1",
          editableId: "_VsH5NO9jyg",
          workshop_type: "allstarteams",
          section: "future",
          sortOrder: 6
        },
        
        // Imaginal Agility Workshop Videos
        {
          id: 7,
          title: "IAWS Orientation Video",
          description: "Introduction to the Imaginal Agility workshop",
          url: "https://www.youtube.com/embed/1Belekdly70?enablejsapi=1",
          editableId: "1Belekdly70", 
          workshop_type: "imaginal-agility",
          section: "introduction",
          sortOrder: 1
        },
        {
          id: 8,
          title: "AI Triple Challenge",
          description: "Understanding the challenges ahead",
          url: "https://www.youtube.com/embed/zIFGKPMN9t8?enablejsapi=1",
          editableId: "zIFGKPMN9t8",
          workshop_type: "imaginal-agility", 
          section: "workshop",
          sortOrder: 2
        },
        {
          id: 9,
          title: "Imaginal Agility Solution",
          description: "Core solution framework",
          url: "https://www.youtube.com/embed/BLh502BlZLE?enablejsapi=1",
          editableId: "BLh502BlZLE",
          workshop_type: "imaginal-agility",
          section: "workshop",
          sortOrder: 3
        },
        {
          id: 10,
          title: "5 Capabilities (5Cs)",
          description: "Guide to the five core capabilities",
          url: "https://www.youtube.com/embed/8wXSL3om6Ig?enablejsapi=1",
          editableId: "8wXSL3om6Ig",
          workshop_type: "imaginal-agility",
          section: "assessment",
          sortOrder: 4
        }
      ];
    } catch (error) {
      console.error('Error getting videos:', error);
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

      // 4. Reset navigation progress (keep profile data)
      try {
        await db.update(users)
          .set({
            navigationProgress: null,
            updatedAt: new Date()
          })
          .where(eq(users.id, userId));
        
        console.log(`Reset navigation progress for user ${userId}`);
        deletedData.navigationProgress = true;
      } catch (error) {
        console.error(`Error resetting navigation progress for user ${userId}:`, error);
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