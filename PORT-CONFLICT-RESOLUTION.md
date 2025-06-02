# Port Conflict Resolution Workflow for Replit

## Overview
This workflow addresses the common "Cannot GET /" error and port conflicts that occur when multiple server instances try to bind to the same port in Replit environments.

## Problem Identification

### Symptoms
- `EADDRINUSE: address already in use` errors
- "Cannot GET /" responses from the server
- Server startup failures
- Multiple workflow processes competing for the same port

### Root Causes
1. **Multiple Workflow Definitions**: The `.replit` file contains multiple workflows that all try to start the server
2. **Zombie Processes**: Previous server instances that didn't shut down properly
3. **Port Binding Conflicts**: Multiple processes attempting to use port 5000 simultaneously

## Resolution Steps

### Step 1: Identify Conflicting Workflows
Check your `.replit` file for multiple workflow definitions:
```yaml
[workflows]
runButton = "Run"

[[workflows.workflow]]
name = "Project"
mode = "parallel"
author = "agent"

[[workflows.workflow.tasks]]
task = "workflow.run"
args = "Start application"

[[workflows.workflow]]
name = "Start application"
author = "agent"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "npm run dev"
waitForPort = 5000

[[workflows.workflow]]
name = "Run"
author = 36344449
mode = "sequential"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "npm run dev"
```

**Problem**: This creates a cascade where multiple processes compete for port 5000.

### Step 2: Implement Port Conflict Resolution
Add automatic port detection to your server code:

```typescript
// Function to find an available port
const findAvailablePort = (startPort: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const testServer = server.listen(startPort, '0.0.0.0', () => {
      const actualPort = (testServer.address() as any)?.port || startPort;
      testServer.close(() => {
        resolve(actualPort);
      });
    });
    
    testServer.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${startPort} is busy, trying ${startPort + 1}...`);
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
  });
};

// Start the server with port conflict resolution
findAvailablePort(port)
  .then((availablePort) => {
    server.listen(availablePort, '0.0.0.0', () => {
      console.log(`✅ Server successfully started on port ${availablePort}`);
      console.log(`🌐 Access your app at: http://localhost:${availablePort}`);
      
      if (availablePort !== port) {
        console.log(`⚠️  Note: Requested port ${port} was busy, using port ${availablePort} instead`);
      }
    });
  })
  .catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
```

### Step 3: Add Graceful Shutdown Handling
Implement proper cleanup for server processes:

```typescript
// Handle server shutdown gracefully
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});
```

### Step 4: Verify Server Configuration
Ensure your server has proper routing setup:

**Development Mode (with Vite)**:
```typescript
if (process.env.NODE_ENV === 'development') {
  import('./vite').then(({ setupVite }) => {
    setupVite(app, server).then(() => {
      console.log('Vite middleware setup complete');
    }).catch(err => {
      console.error('Failed to setup Vite:', err);
    });
  });
}
```

**Production Mode**:
```typescript
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist/public');
  
  // Serve static files
  app.use(express.static(distPath, {
    maxAge: '1y',
    etag: false
  }));

  // Catch-all handler for client-side routing
  app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    res.sendFile(indexPath);
  });
}
```

## Diagnostic Commands

### Check Running Processes
```bash
ps aux | grep -E "(node|npm|tsx)" | grep -v grep
```

### Check Port Usage
```bash
lsof -i :5000 2>/dev/null || netstat -tlnp 2>/dev/null | grep :5000
```

### Kill Zombie Processes
```bash
pkill -f "npm run dev"
```

## Prevention Strategies

### 1. Simplified Workflow Configuration
Keep only one workflow definition in `.replit`:
```yaml
[workflows]
runButton = "Start application"

[[workflows.workflow]]
name = "Start application"
author = "agent"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "npm run dev"
waitForPort = 5000
```

### 2. Environment Variable Configuration
Use environment variables for port configuration:
```typescript
const port = parseInt(process.env.PORT || process.env.REPL_PORT || '5000');
```

### 3. Health Check Endpoint
Add a health check to verify server status:
```typescript
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    port: server.address()?.port,
    timestamp: new Date().toISOString()
  });
});
```

## Troubleshooting Checklist

- [ ] Check for multiple workflow definitions in `.replit`
- [ ] Verify no zombie processes are running
- [ ] Confirm server routing is properly configured
- [ ] Test both development and production environments
- [ ] Ensure port conflict resolution is implemented
- [ ] Verify graceful shutdown handlers are in place
- [ ] Check that Vite middleware is properly set up for development

## Success Indicators

When the resolution is working correctly, you should see:
```
✅ Server successfully started on port 5000
🌐 Access your app at: http://localhost:5000
Database connection successful
Vite middleware setup complete
```

If port 5000 is busy:
```
Port 5000 is busy, trying 5001...
✅ Server successfully started on port 5001
🌐 Access your app at: http://localhost:5001
⚠️  Note: Requested port 5000 was busy, using port 5001 instead
```

## Implementation Status

✅ **Completed**: Port conflict resolution has been implemented in `server/index.ts`
✅ **Completed**: Automatic port detection finds available ports (5001, 5002, etc.)
✅ **Completed**: Graceful shutdown handling for SIGTERM and SIGINT
✅ **Completed**: Server successfully running with fallback port functionality

## Related Files
- `server/index.ts` - Main server configuration with port conflict resolution
- `.replit` - Replit workflow configuration (multiple workflows identified)
- `server/vite.ts` - Vite middleware setup
- `package.json` - Scripts and dependencies