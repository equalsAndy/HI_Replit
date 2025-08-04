# KAN - Unified Talia Report Generation System

**Issue Type:** Story  
**Project:** KAN  
**Priority:** High  
**Reporter:** Claude Code  
**Date Created:** 2025-08-01

## Summary
Unify Talia report generation system to ensure consistent behavior across admin console and holistic report page interfaces.

## Description

### Current Problem
The application has two separate report generation paths for Talia that use different document systems and logic:

1. **Admin Console Reports** (`/api/admin/ai/generate-report-talia-md`)
   - Searches for specific document titles: "Talia Personal Report Generation Prompt" / "Talia Professional Report Generation Prompt"  
   - Currently failing with fallback generic prompt due to document title mismatch
   - Uses document-based lookup system

2. **Holistic Report Page** (`/api/reports/holistic/generate`)
   - Uses hardcoded identity prompt in `talia-personas.ts`
   - Searches for "Samantha Personal Report" document
   - Different document structure and access logic

**Impact:**
- Inconsistent report quality and behavior between interfaces
- Admin console reports falling back to generic prompts
- Different document management requirements
- User confusion about report differences
- Maintenance overhead from dual systems

### Root Cause Analysis
- Document title expectations don't match actual document names
- Two separate codepaths with different prompt systems
- No unified document management interface
- Hardcoded prompts bypass persona management system

## Acceptance Criteria

### 1. Unified Document System
- [ ] Single main prompt document titled `"Talia Report Generation Prompt"`
- [ ] Both admin console and holistic reports use identical document lookup
- [ ] Main prompt handles personal/professional differentiation internally
- [ ] Supporting documents accessible through unified system

### 2. Admin Interface Transparency
- [ ] Main prompt document visible in persona management interface
- [ ] Ability to edit main prompt directly from admin console
- [ ] Display of enabled supporting documents with descriptions
- [ ] Real-time feedback on document availability and effectiveness

### 3. Code Unification
- [ ] Admin console route uses unified document lookup
- [ ] Holistic report service uses same document system
- [ ] Remove hardcoded prompts from service layer
- [ ] Consistent error handling and fallback behavior

### 4. Logging and Monitoring
- [ ] Clear log messages indicating successful document access
- [ ] Warning logs for document access failures
- [ ] Configuration verification in logs
- [ ] Troubleshooting information for operators

### 5. Testing and Validation
- [ ] Both report paths generate identical quality reports
- [ ] Personal and professional reports work correctly from both interfaces
- [ ] Document changes affect both generation paths
- [ ] Fallback behavior works when documents are missing
- [ ] Training data integration works consistently

## Technical Notes

### Files to Modify
- `server/routes/ai-management-routes.ts` (lines 745-747): Update document lookup logic
- `server/services/talia-personas.ts` (lines 401-465): Replace hardcoded prompt with document lookup
- `client/src/components/admin/PersonaManagement.tsx`: Add main prompt visibility and editing
- `server/services/claude-api-service.ts`: Ensure consistent document access

### Database Changes
- Verify `star_report` persona has correct document assignments
- Ensure main prompt document exists with correct title
- Update document status to 'active' if needed

### Document Structure
```
Main Prompt: "Talia Report Generation Prompt"
├── Handles both personal and professional reports
├── Uses dynamic placeholders for report type
└── Contains comprehensive generation instructions

Supporting Documents:
├── "Samantha Personal Report" (example)
├── Professional report examples
├── AST methodology documents
└── Coaching guidelines
```

## Implementation Plan

### Phase 1: Backend Unification (2 hours)
1. Update `ai-management-routes.ts` to use single main prompt lookup
2. Modify `talia-personas.ts` to use document-based prompts
3. Ensure both paths use identical document retrieval logic
4. Add comprehensive logging for troubleshooting

### Phase 2: Frontend Transparency (1.5 hours)
1. Add main prompt display to persona management interface
2. Implement direct prompt editing capability
3. Show enabled supporting documents with descriptions
4. Add document status indicators

### Phase 3: Document Setup (0.5 hours)
1. Create or rename main prompt document with correct title
2. Verify document is enabled for star_report persona
3. Test document accessibility from both generation paths
4. Validate supporting document assignments

### Phase 4: Testing and Validation (1 hour)
1. Test both admin console and holistic report generation
2. Verify consistency between personal and professional reports
3. Test document editing and immediate effect
4. Validate fallback behavior
5. Check log output for proper operation

## Definition of Done
- [ ] Both report generation paths use identical document system
- [ ] Admin interface shows current main prompt and allows editing
- [ ] Supporting documents are visible and manageable
- [ ] All tests pass for both report types from both interfaces
- [ ] Documentation updated with new system architecture
- [ ] Log analysis confirms proper document access
- [ ] No hardcoded prompts remain in service layer
- [ ] Training data integration works consistently across both paths

## Business Value
- **Consistency**: Users get identical high-quality reports regardless of interface
- **Maintainability**: Single source of truth for prompt management
- **Transparency**: Administrators can see and control all AI behavior
- **Reliability**: Proper fallback behavior and error handling
- **Efficiency**: Reduced maintenance overhead from unified system

## Risk Assessment
- **Low Risk**: Changes are primarily architectural improvements
- **Mitigation**: Comprehensive testing of both report generation paths
- **Rollback**: Keep current system as backup until validation complete
- **Impact**: Improved user experience and reduced maintenance burden