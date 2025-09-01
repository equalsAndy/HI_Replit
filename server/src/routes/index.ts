import { Router } from 'express';
import { deleteUserHandler } from './admin.deleteUser';

export const adminRouter = Router();
adminRouter.delete('/users/:auth0Id', deleteUserHandler);
