# 504 Timeout Fix Required

## Problem
Report generation times out after 60 seconds because:
1. OpenAI API calls can take 60-120 seconds
2. Express server has default 60s timeout
3. Frontend shows 504 error and JSON parse error

## Current Flow (Synchronous - BROKEN)
```
User clicks generate → API waits for OpenAI → Times out after 60s → Error
```

## Solution: Make it Asynchronous

### Change the `/generate` endpoint to:
1. Create report record with status='generating'
2. **Return immediately** with reportId and status
3. Continue OpenAI generation **in background**
4. UI polls `/status` endpoint to check progress

### Updated Flow
```
1. User clicks generate
2. Server: Create DB record with status='generating'
3. Server: Return { reportId, status: 'generating' } immediately
4. Server: Start background OpenAI call (don't await the response)
5. UI: Poll /status every 2 seconds
6. When complete: Update DB with status='completed' and HTML
7. UI: See 'completed' status, load report
```

## Code Changes Needed

### In `/generate` endpoint:
```typescript
// Don't await this - let it run in background
generateReportInBackground(reportId, userId, reportType);

// Return immediately
res.json({
  success: true,
  reportId,
  status: 'generating',
  message: 'Report generation started'
});
```

### New async function:
```typescript
async function generateReportInBackground(reportId, userId, reportType) {
  try {
    const reportData = await generateReportUsingTalia(userId, reportType);
    const htmlContent = generateHtmlReport(reportData, reportType);
    
    // Update database
    await pool.query(
      `UPDATE holistic_reports SET 
        report_data = $1, 
        html_content = $2,
        generation_status = 'completed'
      WHERE id = $3`,
      [JSON.stringify(reportData), htmlContent, reportId]
    );
  } catch (error) {
    // Update with failed status
    await pool.query(
      `UPDATE holistic_reports SET 
        generation_status = 'failed',
        error_message = $1
      WHERE id = $2`,
      [error.message, reportId]
    );
  }
}
```

## Alternative Quick Fix
If you can't change the flow, increase the timeout in `server.ts`:

```typescript
// In server.ts
app.use((req, res, next) => {
  req.setTimeout(180000); // 3 minutes
  res.setTimeout(180000);
  next();
});
```

But async approach is better!

## Current Workaround
The report IS being generated successfully (you can see it in the database), but the client times out before getting the response. So:

1. Wait 2 minutes after clicking generate
2. Refresh the page
3. The report should appear

## Files to Modify
- `/server/routes/holistic-report-routes.ts` - Make generation async
- `/client/src/features/holistic-reports/HolisticReportView.tsx` - Already polls, just needs to handle "generating" status properly
