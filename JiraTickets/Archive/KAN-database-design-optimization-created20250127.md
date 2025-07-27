# KAN - Database Design and Performance Optimization

**Issue Type:** Task  
**Project:** KAN  
**Priority:** Medium  
**Reporter:** Claude Code  
**Date Created:** 2025-01-27

## Summary
Optimize database schema design, add proper indexing, and implement database performance monitoring for the dual-workshop platform.

## Description
Review of the database schema reveals opportunities for optimization, missing indexes, and the need for better query performance monitoring.

**Current Database State:**
- Well-structured schema with proper relationships
- Workshop separation maintained in data model
- Missing performance indexes on frequently queried columns
- No query performance monitoring
- Limited database connection optimization

**Performance Impact:**
- Slower queries on user workshop data
- Inefficient navigation progress lookups
- Suboptimal admin dashboard queries
- Potential scaling bottlenecks

## Acceptance Criteria

### Phase 1: Index Optimization
- [ ] Add indexes on frequently queried columns
- [ ] Create composite indexes for workshop queries
- [ ] Add indexes for user lookup operations
- [ ] Optimize navigation progress queries
- [ ] Add indexes for admin dashboard filters

### Phase 2: Query Performance Analysis
- [ ] Implement query performance logging
- [ ] Identify slow queries using EXPLAIN ANALYZE
- [ ] Optimize workshop data retrieval queries
- [ ] Improve user authentication query performance
- [ ] Optimize admin reporting queries

### Phase 3: Database Connection Optimization
- [ ] Implement connection pooling optimization
- [ ] Configure appropriate pool sizes
- [ ] Add connection monitoring
- [ ] Implement query timeout settings
- [ ] Add database health checks

### Phase 4: Schema Improvements
- [ ] Review and optimize data types
- [ ] Add database constraints for data integrity
- [ ] Implement proper cascade rules
- [ ] Add audit triggers for sensitive operations
- [ ] Optimize JSON column usage

## Technical Implementation

### Index Creation Strategy:
```sql
-- User lookup optimization
CREATE INDEX CONCURRENTLY idx_users_username_active ON users(username) WHERE is_test_user = false;
CREATE INDEX CONCURRENTLY idx_users_role_active ON users(role) WHERE is_test_user = false;

-- Workshop data optimization  
CREATE INDEX CONCURRENTLY idx_workshop_step_data_user_workshop ON workshop_step_data(user_id, workshop_type);
CREATE INDEX CONCURRENTLY idx_workshop_step_data_step_id ON workshop_step_data(step_id);

-- Navigation progress optimization
CREATE INDEX CONCURRENTLY idx_users_navigation_progress ON users USING GIN(navigation_progress);

-- Assessment data optimization
CREATE INDEX CONCURRENTLY idx_user_assessments_user_type ON user_assessments(user_id, assessment_type);
CREATE INDEX CONCURRENTLY idx_user_assessments_created ON user_assessments(created_at DESC);

-- Admin queries optimization
CREATE INDEX CONCURRENTLY idx_users_created_role ON users(created_at DESC, role);
CREATE INDEX CONCURRENTLY idx_workshop_completion ON users(ast_workshop_completed, ia_workshop_completed);
```

### Query Performance Monitoring:
```typescript
// server/middleware/queryLogger.ts
import { performance } from 'perf_hooks';

export const queryLogger = (query: string, params: any[]) => {
  const start = performance.now();
  
  return {
    logCompletion: (result: any) => {
      const duration = performance.now() - start;
      
      if (duration > 100) { // Log slow queries
        console.warn('Slow Query:', {
          query: query.substring(0, 200),
          duration: `${duration.toFixed(2)}ms`,
          rowCount: result.rowCount
        });
      }
      
      // Send to monitoring service
      metrics.queryDuration.observe(
        { query_type: getQueryType(query) },
        duration
      );
    }
  };
};
```

### Connection Pool Optimization:
```typescript
// server/db/pool.ts
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Timeout if can't connect within 2s
  maxUses: 7500, // Close connection after 7500 uses
  
  // Connection validation
  application_name: 'heliotrope_imaginal',
  
  // SSL configuration for production
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Monitor pool events
pool.on('connect', () => {
  metrics.dbConnections.inc();
});

pool.on('remove', () => {
  metrics.dbConnections.dec();
});
```

## Database Performance Targets

### Query Performance:
- User authentication queries < 50ms
- Workshop data retrieval < 100ms
- Navigation progress updates < 30ms
- Admin dashboard queries < 200ms

### Connection Management:
- Connection pool utilization < 80%
- Average connection wait time < 10ms
- Zero connection timeouts under normal load

### Index Effectiveness:
- All primary queries use indexes
- Index hit ratio > 95%
- Table scan reduction by 80%

## Schema Optimization Areas

### High-Priority Tables:
```sql
-- Users table optimization
ALTER TABLE users ADD CONSTRAINT users_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Workshop data integrity
ALTER TABLE workshop_step_data ADD CONSTRAINT workshop_step_data_workshop_type_check 
  CHECK (workshop_type IN ('ast', 'ia'));

-- Navigation progress JSON optimization
ALTER TABLE users ADD CONSTRAINT navigation_progress_valid_json 
  CHECK (navigation_progress IS NULL OR json_valid(navigation_progress));
```

### Data Type Optimization:
```sql
-- Optimize text columns with length limits
ALTER TABLE users ALTER COLUMN username TYPE varchar(100);
ALTER TABLE users ALTER COLUMN email TYPE varchar(255);

-- Use more specific types where possible
ALTER TABLE workshop_step_data ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE user_assessments ALTER COLUMN score TYPE numeric(5,2);
```

## Query Optimization Examples

### Before (Slow Query):
```sql
SELECT * FROM users 
WHERE navigation_progress LIKE '%step-3-2%' 
AND role = 'participant';
```

### After (Optimized):
```sql
SELECT u.id, u.name, u.email, u.navigation_progress 
FROM users u 
WHERE u.role = 'participant' 
AND u.navigation_progress ? 'step-3-2'
LIMIT 100;
```

## Monitoring and Alerting

### Database Metrics:
- Query execution times
- Connection pool status
- Index usage statistics
- Table size growth
- Lock contention

### Performance Alerts:
- Slow query threshold exceeded
- Connection pool exhaustion
- Disk space low
- Replication lag (if applicable)

## Migration Strategy

### Phase 1: Non-blocking Changes
- Add new indexes concurrently
- Implement monitoring
- Optimize connection pool

### Phase 2: Schema Changes
- Add constraints during low-traffic periods
- Optimize data types with careful testing
- Update application code for schema changes

### Phase 3: Advanced Optimizations
- Implement query result caching
- Add read replicas if needed
- Consider partitioning for large tables

## Files to Modify

### Database Files:
```
server/db/ - Database connection and configuration
migrations/ - New migration files for indexes
server/routes/ - Update queries to use optimized patterns
```

### Monitoring Files:
```
server/middleware/queryLogger.ts - Query performance logging
server/monitoring/database.ts - Database metrics collection
```

## Dependencies
- Database migration tools
- Query performance monitoring
- Connection pool monitoring
- Index usage analysis tools

## Risk Assessment
**Medium Priority** - Database optimizations can significantly improve performance but require careful testing and gradual rollout to avoid disrupting existing functionality.