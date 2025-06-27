import { Request, Response, NextFunction } from 'express';

export const requireTestUser = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (!user?.isTestUser) {
    return res.status(403).json({ 
      error: 'Test features only available to test users',
      code: 'TEST_USER_REQUIRED'
    });
  }
  
  next();
};

export const validateTestAction = (action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user?.isTestUser) {
      console.warn(`Non-test user ${user?.id} attempted test action: ${action}`);
      return res.status(403).json({ 
        error: `Test action '${action}' not available`,
        code: 'UNAUTHORIZED_TEST_ACTION'
      });
    }
    
    next();
  };
};