import express from 'express';
import { attachUser } from './middleware/auth';

// Import route modules
import authRoutes from './routes/auth-routes';
import inviteRoutes from './routes/invite-routes';
import fixedInviteRoutes from './routes/fixed-invite-routes';
import userRoutes from './routes/user-routes';
import workshopDataRoutes from './routes/workshop-data-routes';
import { resetRouter } from './reset-routes';

// Create a router
export const router = express.Router();

// Attach user to request if authenticated
router.use(attachUser);

// Use route modules
router.use('/auth', authRoutes);
router.use('/invites', inviteRoutes);
router.use('/admin/invites', fixedInviteRoutes);
router.use('/user', userRoutes);
router.use('/test-users/reset', resetRouter);
router.use('/', workshopDataRoutes);

// Base API route to check if the API is running
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Heliotrope Imaginal Workshop API',
    version: '1.0.0',
    user: req.user || null
  });
});