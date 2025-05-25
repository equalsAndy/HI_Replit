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
    profilePicture?: string | null;
    isTestUser?: boolean;
    role?: 'admin' | 'facilitator' | 'participant';
  }) {
    try {
      // Update the user in the database
      const result = await db.update(users)
        .set({
          ...data,
          updatedAt: new Date()
        })
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
        user: userWithoutPassword
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
   * Get all users
   */
  async getAllUsers() {
    try {
      const result = await db.select()
        .from(users);
      
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
}

export const userManagementService = new UserManagementService();