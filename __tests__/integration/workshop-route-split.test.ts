/**
 * Workshop Route Split Integration Tests
 * =======================================
 * Verifies that the thin aggregator (workshop-data-routes.ts) correctly
 * delegates to all 5 domain route files, and that every previously-existing
 * endpoint is still reachable after the split.
 *
 * Strategy: A missing route returns 404. A route that exists but requires
 * authentication returns 401. All tests assert NOT 404 — proving each
 * endpoint is registered in the aggregator.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// ──────────────────────────────────────────────────────────────────────────────
// Global mocks (must come before any route imports)
// ──────────────────────────────────────────────────────────────────────────────

// A thenable that also has .limit() — needed because some routes do
// db.select().from().where() and others do db.select().from().where().limit()
const makeQueryResult = (data: any[] = []) => ({
  then: (onFulfilled: any, onRejected: any) =>
    Promise.resolve(data).then(onFulfilled, onRejected),
  catch: (onRejected: any) => Promise.resolve(data).catch(onRejected),
  limit: vi.fn(() => Promise.resolve(data)),
});

vi.mock('@server/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => makeQueryResult([])),
        limit: vi.fn(() => Promise.resolve([])),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve([])),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([])),
      })),
    })),
  },
}));

vi.mock('@shared/schema', () => ({
  users: {},
  userAssessments: {},
  navigationProgress: {},
  workshopStepData: {},
  starCards: {},
  videos: {},
  flowAttributes: {},
}));

vi.mock('@server/middleware/feature-flags', () => ({
  getFeatureStatus: (_req: any, res: any) => res.json({ features: {} }),
}));

vi.mock('@server/services/photo-storage-service', () => ({
  photoStorageService: {
    storePhoto: vi.fn().mockResolvedValue(999),
    storeVisualizationImage: vi.fn().mockResolvedValue(999),
  },
}));

// ──────────────────────────────────────────────────────────────────────────────
// Test app factory
// ──────────────────────────────────────────────────────────────────────────────

async function buildApp() {
  const app = express();
  app.use(express.json());

  // Simulate an unauthenticated session (no userId)
  app.use((req: any, _res: any, next: any) => {
    req.session = {};
    req.cookies = {};
    next();
  });

  const { default: workshopDataRouter } = await import(
    '@server/routes/workshop-data-routes'
  );
  app.use('/api/workshop-data', workshopDataRouter);

  return app;
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/** Assert route exists (registered) by confirming it does NOT return 404. */
async function assertRouteExists(
  app: express.Application,
  method: 'get' | 'post',
  path: string,
  body?: object
) {
  const req = method === 'get'
    ? request(app).get(path)
    : request(app).post(path).send(body ?? {});

  const res = await req;
  expect(
    res.status,
    `Expected route ${method.toUpperCase()} ${path} to be registered (not 404), got ${res.status}`
  ).not.toBe(404);
}

// ──────────────────────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────────────────────

describe('Workshop Route Split — Aggregator Registration', () => {
  let app: express.Application;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();
  });

  // ── Completion domain (workshop-completion-routes.ts) ─────────────────────

  describe('Completion routes', () => {
    it('GET /navigation-progress/:appType is registered', async () => {
      await assertRouteExists(app, 'get', '/api/workshop-data/navigation-progress/ast');
    });

    it('POST /navigation-progress is registered', async () => {
      await assertRouteExists(app, 'post', '/api/workshop-data/navigation-progress', {
        appType: 'ast',
        completedSteps: [],
        currentStepId: '1-1',
        unlockedSteps: ['1-1'],
      });
    });

    it('GET /feature-status is registered', async () => {
      await assertRouteExists(app, 'get', '/api/workshop-data/feature-status');
    });

    it('GET /completion-status is registered', async () => {
      await assertRouteExists(app, 'get', '/api/workshop-data/completion-status');
    });

    it('POST /complete-workshop is registered', async () => {
      await assertRouteExists(app, 'post', '/api/workshop-data/complete-workshop', {
        appType: 'ast',
      });
    });

    it('GET /videos/workshop/:workshopType is registered', async () => {
      await assertRouteExists(app, 'get', '/api/workshop-data/videos/workshop/allstarteams');
    });

    it('GET /videos/:id is registered', async () => {
      // Use a non-numeric id so the route responds 400 (not 404 "not found")
      // proving the route is registered even without seeded video data
      await assertRouteExists(app, 'get', '/api/workshop-data/videos/abc');
    });
  });

  // ── Visualization domain (workshop-visualization-routes.ts) ───────────────

  describe('Visualization routes', () => {
    it('POST /upload-visualization-image is registered', async () => {
      await assertRouteExists(app, 'post', '/api/workshop-data/upload-visualization-image', {
        imageData: 'data:image/png;base64,abc',
      });
    });

    it('POST /visualizing-potential is registered', async () => {
      await assertRouteExists(app, 'post', '/api/workshop-data/visualizing-potential', {
        selectedImages: ['img1'],
      });
    });

    it('GET /visualizing-potential is registered', async () => {
      await assertRouteExists(app, 'get', '/api/workshop-data/visualizing-potential');
    });

    it('POST /visualization is registered', async () => {
      await assertRouteExists(app, 'post', '/api/workshop-data/visualization', {
        wellBeingLevel: 7,
        futureWellBeingLevel: 8,
      });
    });

    it('GET /visualization is registered', async () => {
      await assertRouteExists(app, 'get', '/api/workshop-data/visualization');
    });

    it('POST /store-visualization-image is registered', async () => {
      await assertRouteExists(app, 'post', '/api/workshop-data/store-visualization-image', {
        imageUrl: 'https://example.com/img.jpg',
        attribution: 'Test',
      });
    });
  });

  // ── Assessment domain (workshop-assessment-routes.ts) ─────────────────────

  describe('Assessment routes', () => {
    it('GET /starcard is registered', async () => {
      await assertRouteExists(app, 'get', '/api/workshop-data/starcard');
    });

    it('GET /flow-attributes is registered', async () => {
      await assertRouteExists(app, 'get', '/api/workshop-data/flow-attributes');
    });

    it('POST /flow-attributes is registered', async () => {
      await assertRouteExists(app, 'post', '/api/workshop-data/flow-attributes', {
        attributes: [],
      });
    });

    it('GET /assessment/questions is registered', async () => {
      await assertRouteExists(app, 'get', '/api/workshop-data/assessment/questions');
    });

    it('POST /assessment/start is registered', async () => {
      await assertRouteExists(app, 'post', '/api/workshop-data/assessment/start');
    });

    it('GET /flow-assessment is registered', async () => {
      await assertRouteExists(app, 'get', '/api/workshop-data/flow-assessment');
    });

    it('GET /userAssessments is registered', async () => {
      await assertRouteExists(app, 'get', '/api/workshop-data/userAssessments');
    });

    it('GET /ia-assessment is registered', async () => {
      await assertRouteExists(app, 'get', '/api/workshop-data/ia-assessment');
    });
  });

  // ── Reflection domain (workshop-reflection-routes.ts) ─────────────────────

  describe('Reflection routes', () => {
    it('GET /rounding-out is registered', async () => {
      await assertRouteExists(app, 'get', '/api/workshop-data/rounding-out');
    });

    it('POST /rounding-out is registered', async () => {
      await assertRouteExists(app, 'post', '/api/workshop-data/rounding-out', {
        roundingOutData: {},
      });
    });

    it('GET /future-self is registered', async () => {
      await assertRouteExists(app, 'get', '/api/workshop-data/future-self');
    });

    it('POST /future-self is registered', async () => {
      await assertRouteExists(app, 'post', '/api/workshop-data/future-self', {
        futureSelfData: {},
      });
    });

    it('GET /final-reflection is registered', async () => {
      await assertRouteExists(app, 'get', '/api/workshop-data/final-reflection');
    });

    it('POST /final-reflection is registered', async () => {
      await assertRouteExists(app, 'post', '/api/workshop-data/final-reflection', {
        reflectionData: {},
      });
    });

    it('GET /final-insights is registered', async () => {
      await assertRouteExists(app, 'get', '/api/workshop-data/final-insights');
    });

    it('GET /step/:workshopType/:stepId is registered', async () => {
      await assertRouteExists(app, 'get', '/api/workshop-data/step/ast/2-1');
    });

    it('GET /steps/:workshopType is registered', async () => {
      await assertRouteExists(app, 'get', '/api/workshop-data/steps/ast');
    });
  });

  // ── Profile domain (workshop-profile-routes.ts) ────────────────────────────

  describe('Profile routes', () => {
    it('GET /assessment-profile is registered', async () => {
      await assertRouteExists(app, 'get', '/api/workshop-data/assessment-profile');
    });

    it('POST /assessment-profile is registered', async () => {
      await assertRouteExists(app, 'post', '/api/workshop-data/assessment-profile', {
        profileData: {},
      });
    });

    it('GET /profile-activities is registered', async () => {
      await assertRouteExists(app, 'get', '/api/workshop-data/profile-activities');
    });

    it('GET /woo-results is registered', async () => {
      await assertRouteExists(app, 'get', '/api/workshop-data/woo-results');
    });

    it('POST /quick-start-profile is registered', async () => {
      await assertRouteExists(app, 'post', '/api/workshop-data/quick-start-profile', {
        profileData: {},
      });
    });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Specific behaviour tests (beyond registration)
// ──────────────────────────────────────────────────────────────────────────────

describe('Workshop Route Split — Route Behaviour', () => {
  let app: express.Application;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();
  });

  it('GET /feature-status returns 200 without authentication', async () => {
    const res = await request(app).get('/api/workshop-data/feature-status');
    expect(res.status).toBe(200);
  });

  it('GET /videos/workshop/:workshopType returns 200 without authentication', async () => {
    const res = await request(app).get('/api/workshop-data/videos/workshop/ast');
    expect(res.status).toBe(200);
  });

  it('GET /completion-status returns 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/workshop-data/completion-status');
    expect(res.status).toBe(401);
  });

  it('GET /starcard returns 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/workshop-data/starcard');
    expect(res.status).toBe(401);
  });

  it('POST /upload-visualization-image returns 401 when unauthenticated', async () => {
    const res = await request(app)
      .post('/api/workshop-data/upload-visualization-image')
      .send({ imageData: 'data:image/png;base64,abc' });
    expect(res.status).toBe(401);
  });

  it('GET /navigation-progress/ast returns 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/workshop-data/navigation-progress/ast');
    expect(res.status).toBe(401);
  });

  it('POST /visualization validates wellBeingLevel range', async () => {
    // Mount an app WITH a session so we get past auth
    const authApp = express();
    authApp.use(express.json());
    authApp.use((req: any, _res: any, next: any) => {
      req.session = { userId: 1 };
      req.cookies = {};
      next();
    });
    const { default: router } = await import('@server/routes/workshop-data-routes');
    authApp.use('/api/workshop-data', router);

    const res = await request(authApp)
      .post('/api/workshop-data/visualization')
      .send({ wellBeingLevel: 99 }); // out of range

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('POST /visualizing-potential validates max image count', async () => {
    // This route has authenticateUser + checkWorkshopLocked before the handler.
    // We must mock the DB to return a user so checkWorkshopLocked passes through.
    const { db: mockDb } = await import('@server/db');
    const mockUser = {
      id: 1, astWorkshopCompleted: false, iaWorkshopCompleted: false,
      astCompletedAt: null, iaCompletedAt: null,
    };
    vi.mocked(mockDb.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          then: (r: any) => Promise.resolve([mockUser]).then(r),
          catch: (r: any) => Promise.resolve([mockUser]).catch(r),
          limit: vi.fn().mockResolvedValue([mockUser]),
        }),
        limit: vi.fn().mockResolvedValue([mockUser]),
      }),
    } as any);

    const authApp = express();
    authApp.use(express.json());
    authApp.use((req: any, _res: any, next: any) => {
      req.session = { userId: 1 };
      req.cookies = {};
      next();
    });
    const { default: router } = await import('@server/routes/workshop-data-routes');
    authApp.use('/api/workshop-data', router);

    const res = await request(authApp)
      .post('/api/workshop-data/visualizing-potential')
      .send({ selectedImages: ['a', 'b', 'c', 'd', 'e', 'f'] }); // > 5

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/maximum 5/i);
  });
});
