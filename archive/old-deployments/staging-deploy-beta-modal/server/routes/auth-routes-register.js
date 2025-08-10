import express from 'express';
import { userManagementService } from '../services/user-management-service.js';
import { inviteService } from '../services/invite-service.js';
import { z } from 'zod';
import { validateInviteCode, normalizeInviteCode } from '../utils/invite-code.js';
const router = express.Router();
router.post('/validate-invite', async (req, res) => {
    const { inviteCode } = req.body;
    if (!inviteCode) {
        return res.status(400).json({
            success: false,
            error: 'Invite code is required'
        });
    }
    if (!validateInviteCode(inviteCode)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid invite code format'
        });
    }
    try {
        const normalizedCode = normalizeInviteCode(inviteCode);
        const result = await inviteService.getInviteByCode(normalizedCode);
        if (!result.success) {
            return res.status(404).json({
                success: false,
                error: 'Invalid invite code'
            });
        }
        if (result.invite?.usedAt) {
            return res.status(400).json({
                success: false,
                error: 'This invite code has already been used'
            });
        }
        res.json({
            success: true,
            invite: {
                email: result.invite?.email,
                role: result.invite?.role,
                name: result.invite?.name,
                isBetaTester: result.invite?.isBetaTester || result.invite?.is_beta_tester || false
            }
        });
    }
    catch (error) {
        console.error('Error validating invite code:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to validate invite code'
        });
    }
});
router.post('/register', async (req, res) => {
    const registerSchema = z.object({
        inviteCode: z.string().min(12, 'Invite code is required'),
        username: z.string().min(3, 'Username must be at least 3 characters'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email address'),
        organization: z.string().optional().nullable(),
        jobTitle: z.string().optional().nullable(),
        profilePicture: z.string().optional().nullable()
    });
    try {
        const data = registerSchema.parse(req.body);
        const normalizedCode = normalizeInviteCode(data.inviteCode);
        const inviteResult = await inviteService.getInviteByCode(normalizedCode);
        if (!inviteResult.success || inviteResult.invite?.usedAt) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or already used invite code'
            });
        }
        if (data.email.toLowerCase() !== inviteResult.invite?.email.toLowerCase()) {
            return res.status(400).json({
                success: false,
                error: 'Email does not match the invite'
            });
        }
        const createResult = await userManagementService.createUser({
            username: data.username,
            password: data.password,
            name: data.name,
            email: data.email,
            role: inviteResult.invite.role,
            organization: data.organization,
            jobTitle: data.jobTitle,
            profilePicture: data.profilePicture,
            invitedBy: inviteResult.invite.createdBy,
            isBetaTester: inviteResult.invite.isBetaTester || inviteResult.invite.is_beta_tester || false
        });
        if (!createResult.success) {
            return res.status(400).json(createResult);
        }
        await inviteService.markInviteAsUsed(normalizedCode, createResult.user?.id);
        req.session.userId = createResult.user?.id;
        req.session.username = createResult.user?.username;
        req.session.userRole = createResult.user?.role;
        req.session.save((err) => {
            if (err) {
                console.error('❌ Session save error during registration:', err);
                console.error('❌ Session data:', {
                    userId: req.session.userId,
                    username: req.session.username,
                    userRole: req.session.userRole
                });
                return res.status(500).json({
                    success: false,
                    error: 'Session creation failed',
                    details: typeof err === 'object' && err !== null && 'message' in err ? err.message : String(err)
                });
            }
            console.log('✅ Session saved successfully for new user:', createResult.user?.id);
            console.log('✅ Session ID:', req.sessionID);
            res.json(createResult);
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: error.errors[0].message
            });
        }
        console.error('Error registering user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to register user'
        });
    }
});
export default router;
