# Frontend Error Handling Fix

## Backend Changes Completed ✅
- Made report generation async (no more 504 timeouts)
- Returns immediately with status='generating'
- Processes in background
- Friendly error messages: "Uh oh, something went wrong"

## Frontend Changes Needed

### Find the Component
The component that calls `/api/reports/holistic/generate` needs to be updated.

Location possibilities:
- `/client/src/pages/` directory
- `/client/src/components/` directory  
- Search for: `fetch('/api/reports/holistic/generate')`

### Update Error Handling

**Current (probably):**
```typescript
try {
  const response = await fetch('/api/reports/holistic/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reportType })
  });
  const data = await response.json(); // ❌ Fails if HTML error page
} catch (error) {
  console.error('Report generation failed:', error); // ❌ Shows technical details
}
```

**Should be:**
```typescript
try {
  const response = await fetch('/api/reports/holistic/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ reportType })
  });
  
  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    // Handle HTML error pages
    throw new Error('Uh oh, something went wrong');
  }
  
  if (!response.ok) {
    throw new Error(data.message || 'Uh oh, something went wrong');
  }
  
  // Success - data will have { reportId, status: 'generating' }
  // Start polling for status...
  
} catch (error) {
  // Show friendly error to user
  setError('Uh oh, something went wrong');
  // OR use toast notification:
  toast({
    title: "Uh oh, something went wrong",
    description: "Please try again or contact support if the issue persists",
    variant: "destructive"
  });
}
```

### Update Success Handling

Since the endpoint now returns immediately with `status: 'generating'`, update the success handler:

```typescript
// After successful API call
const { reportId, status } = data;

if (status === 'generating') {
  // Start polling for completion
  const pollInterval = setInterval(async () => {
    const statusResponse = await fetch(`/api/reports/holistic/${reportType}/status`, {
      credentials: 'include'
    });
    const statusData = await statusResponse.json();
    
    if (statusData.status === 'completed') {
      clearInterval(pollInterval);
      // Show report or redirect
      setReportReady(true);
    } else if (statusData.status === 'failed') {
      clearInterval(pollInterval);
      setError('Uh oh, something went wrong');
    }
  }, 2000); // Poll every 2 seconds
}
```

## Error Messages
All user-facing errors should be:
- **Friendly**: "Uh oh, something went wrong"
- **No technical details**: No stack traces, no error codes
- **Actionable**: "Please try again" or "Contact support"

### Examples:
- ❌ "SyntaxError: Unexpected token '<', "<html>..." 
- ✅ "Uh oh, something went wrong"

- ❌ "Failed to load resource: the server responded with a status of 504"
- ✅ "Uh oh, something went wrong"

- ❌ "Report generation failed: Empty response from Claude API"
- ✅ "Uh oh, something went wrong"

## Testing
1. Generate a report - should work now without timeout
2. Kill the OpenAI service - should show "Uh oh, something went wrong"
3. Break the API endpoint - should show "Uh oh, something went wrong"

No technical details should ever reach the user!
