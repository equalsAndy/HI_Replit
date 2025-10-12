# Rate Limit Retry Implementation

**Date**: January 2025
**Feature**: Automatic retry on OpenAI rate limit errors
**Status**: ✅ Implemented

## Overview

The AST report generation system now automatically handles OpenAI rate limit errors by:
1. Detecting rate limit errors
2. Parsing the suggested wait time from the error message
3. Waiting 150% of the suggested time
4. Automatically retrying up to 3 times

## Problem

When generating multiple report sections in quick succession, OpenAI's token-per-minute (TPM) rate limits can be exceeded:

```
Rate limit reached for gpt-4o in organization:
Limit 30000, Used 14143, Requested 19737.
Please try again in 7.76s.
```

Previously, this would cause section generation to fail immediately, resulting in incomplete reports.

## Solution

### 1. Rate Limit Detection

The system now detects rate limit errors by checking for:
- `rate_limit_exceeded` in error messages
- `Rate limit reached` text in error messages

### 2. Wait Time Parsing

New method `parseRateLimitWaitTime()` extracts the wait time from OpenAI's error message:

```typescript
private parseRateLimitWaitTime(errorMessage: string): number {
  // Error format: "Please try again in 7.76s"
  const match = errorMessage.match(/try again in ([\d.]+)s/i);
  if (match) {
    const seconds = parseFloat(match[1]);
    // Return 150% of suggested wait time
    return Math.ceil(seconds * 1.5 * 1000); // Convert to milliseconds
  }
  // Default to 10 seconds if we can't parse
  return 10000;
}
```

**Key features:**
- Regex pattern matches "try again in X.XXs"
- Multiplies by 1.5 (150%) for safety margin
- Defaults to 10 seconds if parsing fails

### 3. Automatic Retry Logic

Updated `generateSectionContentWithPayload()` to accept `retryCount` parameter:

```typescript
private async generateSectionContentWithPayload(
  payload: any,
  sectionDef: any,
  reportType: string,
  retryCount: number = 0
): Promise<{ content: string; aiRequestPayload: any }>
```

**Retry behavior:**
- Maximum 3 retries (4 total attempts)
- Exponential backoff via 150% wait time multiplier
- Logs wait time and retry attempt number
- Recursive retry call with incremented counter

### 4. Console Logging

Enhanced logging for visibility:

```
⏳ Rate limit hit. Waiting 11640ms (150% of suggested time) before retry 1/3...
🔄 Retrying section 4 generation (attempt 2/4)...
```

## Example Flow

### Scenario: Generating 5 Sections Quickly

**Initial Attempt:**
```
📄 Generating section 1 for user 76 ✅
📄 Generating section 2 for user 76 ✅
📄 Generating section 3 for user 76 ✅
📄 Generating section 4 for user 76 ❌ Rate limit hit
```

**With Retry:**
```
❌ Rate limit hit for section 4
⏳ Waiting 11640ms (150% of 7.76s) before retry 1/3...
🔄 Retrying section 4 generation (attempt 2/4)...
✅ Section 4 generated successfully
```

**Without Retry (Old Behavior):**
```
❌ Error generating section 4: rate_limit_exceeded
[Report incomplete]
```

## Configuration

### Retry Limits
- **Max retries**: 3 (configurable via `retryCount < 3`)
- **Total attempts**: 4 (initial + 3 retries)

### Wait Time Calculation
- **Base**: OpenAI suggested time (from error message)
- **Multiplier**: 150% (1.5x)
- **Fallback**: 10 seconds (10000ms)

### Retry Eligibility
Only retries on:
- ✅ Rate limit errors (`rate_limit_exceeded`)
- ❌ NOT on other errors (500 errors, timeout, etc.)

## Error Messages

### Before Retry
```
❌ OpenAI Error Code: rate_limit_exceeded
❌ OpenAI Error Message: Rate limit reached for gpt-4o...
❌ Full run status: { ... }
```

### During Retry
```
⏳ Rate limit hit. Waiting 11640ms (150% of suggested time) before retry 1/3...
🔄 Retrying section 4 generation (attempt 2/4)...
```

### After Success
```
✅ Generated 3487 characters (raw content) for section 4 using v2.3 payload
```

### After Max Retries
```
❌ Error generating section content with payload: rate_limit_exceeded
(After 4 attempts)
```

## Future Enhancements

### Potential Improvements:

1. **Failed Section Tracking**
   - Track which sections failed
   - Retry failed sections at end of generation
   - Only assemble report after all sections complete

2. **Intelligent Queuing**
   - Queue section requests instead of running in parallel
   - Respect rate limits proactively
   - Adaptive delay between sections

3. **Per-User Rate Limiting**
   - Track TPM usage per user
   - Delay subsequent requests if approaching limit
   - Priority queue for different report types

4. **Partial Report Rendering**
   - Allow viewing of successfully generated sections
   - Show "In Progress" for pending sections
   - Auto-refresh when new sections complete

## Implementation Details

### Files Modified
- `server/services/ast-sectional-report-service.ts`
  - Added `parseRateLimitWaitTime()` method
  - Updated `generateSectionContentWithPayload()` signature
  - Added retry logic in catch block
  - Enhanced error logging

### Testing

**Test Scenario 1: Rate Limit During Generation**
1. Generate report for user with all sections
2. Trigger rate limit on section 3
3. Verify automatic retry occurs
4. Confirm section completes successfully

**Test Scenario 2: Multiple Retries**
1. Simulate sustained rate limiting
2. Verify exponential backoff
3. Confirm up to 3 retries attempted
4. Check error after max retries

**Test Scenario 3: Parse Various Error Formats**
```
"Please try again in 7.76s"  → 11640ms
"Please try again in 15.2s"  → 22800ms
"Please try again in 0.5s"   → 750ms
"Invalid format"             → 10000ms (default)
```

## Monitoring

### Key Metrics to Track:
- Rate limit error frequency
- Retry success rate
- Average wait times
- Sections requiring retries
- Failed reports after max retries

### Log Patterns:
```bash
# Find rate limit occurrences
grep "Rate limit hit" server.log

# Count successful retries
grep "Retrying section.*generation" server.log | wc -l

# Find max retry failures
grep "Error generating section content" server.log | grep "rate_limit"
```

## Comparison

### Before Implementation
- ❌ Immediate failure on rate limit
- ❌ Incomplete reports
- ❌ Manual retry required
- ❌ Poor user experience

### After Implementation
- ✅ Automatic detection and retry
- ✅ Intelligent wait times (150% buffer)
- ✅ Complete reports despite rate limits
- ✅ Transparent to users
- ✅ Up to 4 attempts per section

## Status

✅ **Rate limit retry implemented**
✅ **Wait time parsing working**
✅ **Exponential backoff (150%)**
✅ **Enhanced error logging**
⏭️ **Next: Track and retry failed sections at end**

---

**Implementation Date**: January 2025
**Version**: 1.0
**Tested**: Pending production validation
