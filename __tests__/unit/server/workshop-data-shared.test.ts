/**
 * Workshop Data Shared Middleware Unit Tests
 * ==========================================
 * Tests for server/routes/workshop-data-shared.ts
 *
 * Covers: authenticateUser, getStepModule, isModuleLocked, checkWorkshopLocked
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

// Mock the database before importing the shared module
vi.mock('@server/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([])),
      })),
    })),
  },
}));

vi.mock('@shared/schema', () => ({
  users: {},
  userAssessments: {},
}));

// Helper: build minimal mock req/res/next
function mockMiddleware(overrides: Partial<Request> = {}) {
  const req = {
    session: {},
    cookies: {},
    params: {},
    ...overrides,
  } as unknown as Request;

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;

  const next = vi.fn() as NextFunction;

  return { req, res, next };
}

describe('authenticateUser middleware', () => {
  let authenticateUser: (req: Request, res: Response, next: NextFunction) => void;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('@server/routes/workshop-data-shared');
    authenticateUser = mod.authenticateUser;
  });

  it('calls next() when session has userId', () => {
    const { req, res, next } = mockMiddleware({ session: { userId: 42 } as any });
    authenticateUser(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 when session is empty and no userId cookie', () => {
    const { req, res, next } = mockMiddleware({ session: {} as any, cookies: {} });
    authenticateUser(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  it('resolves userId from cookie when session is absent', () => {
    const { req, res, next } = mockMiddleware({
      session: {} as any,
      cookies: { userId: '7' },
    });
    authenticateUser(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('prefers session userId over cookie userId when both present', () => {
    // Cookie userId = 1 (demo user), session userId = 5 (real user)
    const { req, res, next } = mockMiddleware({
      session: { userId: 5 } as any,
      cookies: { userId: '1' },
    });
    authenticateUser(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });
});

describe('getStepModule', () => {
  // Return type is 1|2|3|4|5|null — only modules 1-5 are in-range
  let getStepModule: (stepId: string) => number | null;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('@server/routes/workshop-data-shared');
    getStepModule = mod.getStepModule;
  });

  it.each([
    ['1-1', 1],
    ['1-2', 1],
    ['1-3', 1],
    ['2-1', 2],
    ['2-2', 2],
    ['2-4', 2],
    ['3-1', 3],
    ['3-2', 3],
    ['3-3', 3],
    ['3-4', 3],
    ['4-1', 4],
  ])('maps AST step %s → module %d', (stepId, expectedModule) => {
    expect(getStepModule(stepId)).toBe(expectedModule);
  });

  it.each([
    ['ia-1-1', 1],
    ['ia-2-1', 2],
    ['ia-3-1', 3],
    ['ia-4-1', 4],
    ['ia-5-1', 5],
  ])('maps IA step %s → module %d', (stepId, expectedModule) => {
    expect(getStepModule(stepId)).toBe(expectedModule);
  });

  it('returns null for IA steps beyond module 5 (no module 6-8 in type)', () => {
    // Regex only matches ia-[1-5]-N, so ia-6-1 and ia-8-1 fall through to null
    expect(getStepModule('ia-6-1')).toBeNull();
    expect(getStepModule('ia-8-1')).toBeNull();
  });

  it('returns null for unrecognised step IDs', () => {
    expect(getStepModule('unknown-step')).toBeNull();
    expect(getStepModule('')).toBeNull();
  });
});

describe('isModuleLocked', () => {
  // Real signature: isModuleLocked(module, isWorkshopCompleted, workshopType)
  // Modules 1-3: locked when workshop IS completed
  // Modules 4-5: locked when workshop is NOT completed (ast only; ia always unlocked)
  let isModuleLocked: (module: number, isWorkshopCompleted: boolean, workshopType?: string) => boolean;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('@server/routes/workshop-data-shared');
    isModuleLocked = mod.isModuleLocked;
  });

  it.each([1, 2, 3])(
    'module %d is locked when AST workshop is completed',
    (module) => {
      expect(isModuleLocked(module, true, 'ast')).toBe(true);
    }
  );

  it.each([1, 2, 3])(
    'module %d is NOT locked when workshop is incomplete',
    (module) => {
      expect(isModuleLocked(module, false, 'ast')).toBe(false);
    }
  );

  it.each([4, 5])(
    'module %d (post-completion) is locked when AST workshop is NOT yet completed',
    (module) => {
      expect(isModuleLocked(module, false, 'ast')).toBe(true);
    }
  );

  it.each([4, 5])(
    'module %d (post-completion) is NOT locked once AST workshop is complete',
    (module) => {
      expect(isModuleLocked(module, true, 'ast')).toBe(false);
    }
  );

  it.each([4, 5])(
    'module %d is never locked for IA workshop',
    (module) => {
      expect(isModuleLocked(module, false, 'ia')).toBe(false);
      expect(isModuleLocked(module, true, 'ia')).toBe(false);
    }
  );

  it('returns false for module numbers outside 1-5', () => {
    expect(isModuleLocked(6, true, 'ast')).toBe(false);
    expect(isModuleLocked(0, false, 'ast')).toBe(false);
  });
});

describe('checkWorkshopLocked middleware', () => {
  let checkWorkshopLocked: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  let mockDb: any;

  const mockUser = {
    id: 1,
    astWorkshopCompleted: false,
    iaWorkshopCompleted: false,
    astCompletedAt: null,
    iaCompletedAt: null,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDb = (await import('@server/db')).db;
    const mod = await import('@server/routes/workshop-data-shared');
    checkWorkshopLocked = mod.checkWorkshopLocked;
  });

  it('calls next() for an incomplete workshop with no locked step', async () => {
    // Mock DB returning user (workshop not complete)
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockUser]),
        }),
      }),
    });

    const { req, res, next } = mockMiddleware({
      session: { userId: 1 } as any,
      cookies: {},
      body: { workshopType: 'ast' },
    });
    await checkWorkshopLocked(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 404 when user is not found in DB', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]), // empty → user not found
        }),
      }),
    });

    const { req, res, next } = mockMiddleware({
      session: { userId: 999 } as any,
      cookies: {},
      body: { workshopType: 'ast' },
    });
    await checkWorkshopLocked(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('calls next() when appType is not ast or ia (unknown workshop type)', async () => {
    // Invalid workshop type skips the check entirely
    const { req, res, next } = mockMiddleware({
      session: { userId: 1 } as any,
      cookies: {},
      body: { workshopType: 'unknown' },
    });
    await checkWorkshopLocked(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('returns 403 when a module 4-5 step is requested before AST completion', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ ...mockUser, astWorkshopCompleted: false }]),
        }),
      }),
    });

    const { req, res, next } = mockMiddleware({
      session: { userId: 1 } as any,
      cookies: {},
      body: { workshopType: 'ast', stepId: '4-1' }, // module 4, locked until completion
    });
    await checkWorkshopLocked(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
