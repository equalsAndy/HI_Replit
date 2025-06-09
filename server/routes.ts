import express from 'express';
import { attachUser } from './middleware/auth';

// Import route modules
import authRoutes from './routes/auth-routes';
import inviteRoutes from './routes/invite-routes';
import fixedInviteRoutes from './routes/fixed-invite-routes';
import userRoutes from './routes/user-routes';
import workshopDataRoutes from './routes/workshop-data-routes';
import growthPlanRoutes from './routes/growth-plan-routes';
import navigationProgressRoutes from './routes/navigation-progress-routes';
import { resetRouter } from './reset-routes';
import { adminRouter } from './routes/admin-routes';

// Create a router
export const router = express.Router();

// Attach user to request if authenticated
router.use(attachUser);

// Use route modules
router.use('/auth', authRoutes);
router.use('/invites', inviteRoutes);
router.use('/admin/invites', fixedInviteRoutes);
router.use('/admin', adminRouter);
router.use('/user', userRoutes);
router.use('/test-users/reset', resetRouter);
router.use('/workshop-data', workshopDataRoutes);
router.use('/growth-plan', growthPlanRoutes);
router.use('/navigation-progress', navigationProgressRoutes);

// Add visualization endpoints directly at the API root level
router.use('/', workshopDataRoutes);

// Base API route to check if the API is running
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Heliotrope Imaginal Workshop API',
    version: '1.0.0',
    user: (req as any).user || null
  });
});