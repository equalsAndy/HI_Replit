import express from 'express';
import { userManagementService } from '../services/user-management-service.js';
import bcrypt from 'bcryptjs';
const router = express.Router();
router.post('/create', async (req, res) => {
    try {
        const { name, email, username, password, organization, jobTitle, inviteCode, isBetaTester } = req.body;
        if (!name || !email || !username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Name, email, username, and password are required'
            });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }
        const usernameRegex = /^[a-zA-Z0-9._-]+$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({
                success: false,
                error: 'Username can only contain letters, numbers, and ._-'
            });
        }
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 8 characters long'
            });
        }
        const usernameAvailable = await userManagementService.isUsernameAvailable(username);
        if (!usernameAvailable) {
            return res.status(400).json({
                success: false,
                error: 'Username is already taken'
            });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const userData = {
            username,
            password: hashedPassword,
            name,
            email,
            role: 'participant',
            organization: organization || null,
            jobTitle: jobTitle || null,
            profilePicture: null,
            isTestUser: true,
            contentAccess: 'professional',
            astAccess: true,
            iaAccess: true,
            inviteCode: inviteCode || null,
            betaTester: true
        };
        const result = await userManagementService.createUser(userData);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error || 'Failed to create user account'
            });
        }
        console.log(`✅ Beta tester account created successfully: ${username} (${email})`);
        const { password: _, ...userWithoutPassword } = result.user;
        res.json({
            success: true,
            message: 'Beta tester account created successfully',
            user: userWithoutPassword
        });
    }
    catch (error) {
        console.error('❌ Error creating beta tester account:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create beta tester account. Please try again later.',
            details: typeof error === 'object' && error !== null && 'message' in error ? error.message : String(error)
        });
    }
});
router.post('/check-invite', async (req, res) => {
    try {
        const { inviteCode } = req.body;
        if (!inviteCode) {
            return res.status(400).json({
                success: false,
                error: 'Invite code is required'
            });
        }
        const normalizedCode = inviteCode.toLowerCase();
        const isBetaInvite = normalizedCode.includes('beta') ||
            normalizedCode.includes('test') ||
            inviteCode.toUpperCase().startsWith('BETA');
        res.json({
            success: true,
            isBetaInvite,
            inviteCode
        });
    }
    catch (error) {
        console.error('❌ Error checking beta invite:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check invite code'
        });
    }
});
export default router;
