import { Router } from 'express';
import assessmentRoutes from './workshop-assessment-routes.js';
import reflectionRoutes from './workshop-reflection-routes.js';
import visualizationRoutes from './workshop-visualization-routes.js';
import completionRoutes from './workshop-completion-routes.js';
import profileRoutes from './workshop-profile-routes.js';

const workshopDataRouter = Router();

workshopDataRouter.use('/', assessmentRoutes);
workshopDataRouter.use('/', reflectionRoutes);
workshopDataRouter.use('/', visualizationRoutes);
workshopDataRouter.use('/', completionRoutes);
workshopDataRouter.use('/', profileRoutes);

export default workshopDataRouter;
