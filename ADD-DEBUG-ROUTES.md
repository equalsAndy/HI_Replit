# Add Debug Routes to Server

Add this line to `/server/index.ts` after the holistic report routes (around line 245):

```typescript
import holisticReportDebugRoutes from './routes/holistic-report-debug-routes.ts';

// ... other imports ...

// Then mount it after holistic report routes:
app.use('/api/reports/holistic', holisticReportRoutes);
app.use('/api/reports/holistic', holisticReportDebugRoutes);  // ADD THIS LINE
```

This will enable the debug endpoint at:
`GET /api/reports/holistic/debug/:reportId`

Then you can run the script:
```bash
node create-debug-package.js
```
