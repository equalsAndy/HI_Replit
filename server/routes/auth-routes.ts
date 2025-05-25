import express from 'express';
import { userManagementService } from '../services/user-management-service';
import { inviteService } from '../services/invite-service';
import { normalizeInviteCode } from '../utils/invite-code';
import bcrypt from 'bcryptjs';

export const authRouter = express.Router();

// Login route
authRouter.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Validate user credentials
    const user = await userManagementService.validateUserCredentials(username, password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Check if user is soft deleted
    if (user.deletedAt) {
      return res.status(403).json({ error: 'This account has been deactivated' });
    }
    
    // Set session data
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.userRole = user.role;
    
    // Update last login timestamp
    await userManagementService.updateLastLogin(user.id);
    
    // Return user data (excluding password)
    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        jobTitle: user.jobTitle,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'An error occurred during login' });
  }
});

// Verify invite code route
authRouter.post('/verify-invite', async (req, res) => {
  try {
    const { inviteCode } = req.body;
    
    if (!inviteCode) {
      return res.status(400).json({ error: 'Invite code is required' });
    }
    
    // Normalize and verify the invite code
    const normalizedCode = normalizeInviteCode(inviteCode);
    const verification = await inviteService.verifyInviteCode(normalizedCode);
    
    if (!verification.valid) {
      return res.status(400).json({ error: verification.message });
    }
    
    // Return basic invite data for registration
    return res.status(200).json({
      valid: true,
      name: verification.invite.name || null,
      email: verification.invite.email || null,
      role: verification.invite.role,
      cohortId: verification.invite.cohortId,
      inviteCode: normalizedCode
    });
  } catch (error) {
    console.error('Invite verification error:', error);
    return res.status(500).json({ error: 'An error occurred while verifying the invite code' });
  }
});

// Register with invite code route
authRouter.post('/register', async (req, res) => {
  try {
    const { 
      username, 
      password, 
      email, 
      name, 
      inviteCode,
      organization,
      jobTitle,
      profilePicture
    } = req.body;
    
    // Validate required fields
    if (!username || !password || !email || !name || !inviteCode) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }
    
    // Normalize and verify the invite code
    const normalizedCode = normalizeInviteCode(inviteCode);
    const verification = await inviteService.verifyInviteCode(normalizedCode);
    
    if (!verification.valid) {
      return res.status(400).json({ error: verification.message });
    }
    
    // Validate username format and availability
    const usernameValidation = await userManagementService.validateUsername(username);
    if (!usernameValidation.valid) {
      return res.status(400).json({ error: usernameValidation.message });
    }
    
    // Validate password strength
    const passwordValidation = userManagementService.validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }
    
    // Check if email is already in use
    const existingEmail = await userManagementService.getUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email is already in use' });
    }
    
    // Create the user
    const newUser = await userManagementService.createUser({
      username,
      password,
      email,
      name,
      role: verification.invite.role,
      inviteCode: normalizedCode,
      organization,
      jobTitle,
      profilePicture,
      createdByFacilitator: verification.invite.createdBy
    });
    
    // Mark invite as used
    await inviteService.markInviteAsUsed(normalizedCode, newUser.id);
    
    // Set session data
    req.session.userId = newUser.id;
    req.session.username = newUser.username;
    req.session.userRole = newUser.role;
    
    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'An error occurred during registration' });
  }
});

// Get current user data
authRouter.get('/me', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Get user data
    const user = await userManagementService.getUserById(req.session.userId);
    
    if (!user) {
      // Clear session if user not found
      req.session.destroy(err => {
        if (err) console.error('Session destruction error:', err);
      });
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user is soft deleted
    if (user.deletedAt) {
      // Clear session if user is deleted
      req.session.destroy(err => {
        if (err) console.error('Session destruction error:', err);
      });
      return res.status(403).json({ error: 'This account has been deactivated' });
    }
    
    // Return user data
    return res.status(200).json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ error: 'An error occurred while fetching user data' });
  }
});

// Update user profile
authRouter.put('/profile', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { name, organization, jobTitle, profilePicture } = req.body;
    
    // Update profile
    const updatedProfile = await userManagementService.updateUserProfile(
      req.session.userId,
      { name, organization, jobTitle, profilePicture }
    );
    
    return res.status(200).json({ profile: updatedProfile });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'An error occurred while updating profile' });
  }
});

// Change password
authRouter.post('/change-password', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    // Get user with password
    const user = await userManagementService.getUserWithPassword(req.session.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Validate new password strength
    const passwordValidation = userManagementService.validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }
    
    // Change password
    await userManagementService.changePassword(req.session.userId, newPassword);
    
    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: 'An error occurred while changing password' });
  }
});

// Check username availability
authRouter.post('/check-username', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    // Check username availability
    const isAvailable = await userManagementService.isUsernameAvailable(username);
    
    return res.status(200).json({ available: isAvailable });
  } catch (error) {
    console.error('Username check error:', error);
    return res.status(500).json({ error: 'An error occurred while checking username availability' });
  }
});

// Logout route
authRouter.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'An error occurred during logout' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Logged out successfully' });
  });
});