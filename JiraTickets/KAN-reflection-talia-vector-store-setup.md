# KAN - Configure Reflection Talia Vector Store with Required Documents

**Issue Type:** Task  
**Project:** KAN  
**Priority:** High  
**Reporter:** Claude Code  
**Date Created:** 2025-08-02  

## Summary
Reflection Talia assistant exists in OpenAI but its vector store is missing the required training documents for coaching functionality.

## Description
During the OpenAI architecture refactoring from multiple projects to single project with multiple assistants, we successfully created the Reflection Talia assistant (ID: `asst_pspnPtUj1RF5zC460VKkkjdV`) with vector store (`vs_688e55e74e68819190cca71d1fa54f52`). However, the required training documents were not uploaded to the vector store.

**Current State:**
- ✅ Reflection Talia assistant created in OpenAI
- ✅ Vector store created and linked to assistant
- ❌ Training documents missing from vector store
- ❌ Database persona record not updated with document assignments

**Impact:**
- Reflection Talia cannot access coaching knowledge for user interactions
- AI coaching functionality is degraded without proper training context

## Required Documents for Reflection Talia
Based on admin training documents interface, these 4 documents must be uploaded:

1. **Reflection Talia Training Doc** (Category: Talia_Training)
2. **AST Workshop Compendium 2025** (Category: coaching_system) 
3. **Talia AI Coach Training Manual** (Category: coaching_system)
4. **Strengths-Based Coaching Principles** (Category: Strengths Development)

## Acceptance Criteria

### Phase 1: Document Upload to Vector Store
- [ ] Query database to get OpenAI file IDs for the 4 required documents
- [ ] Upload documents to Reflection Talia vector store (`vs_688e55e74e68819190cca71d1fa54f52`)
- [ ] Verify documents appear in OpenAI vector store (should show 4 files)

### Phase 2: Database Update
- [ ] Update `talia_personas` table for `ast_reflection` record:
  - [ ] Set `document_ids` field with JSON array of document IDs
  - [ ] Set `vector_store_id` to `vs_688e55e74e68819190cca71d1fa54f52`
  - [ ] Set `assistant_id` to `asst_pspnPtUj1RF5zC460VKkkjdV`

### Phase 3: Verification
- [ ] Test Reflection Talia responses to verify document access
- [ ] Confirm coaching responses include context from training documents
- [ ] Validate that Assistants API properly retrieves vector store content

## Technical Implementation Notes

### Database Schema
```sql
-- talia_personas table structure
UPDATE talia_personas 
SET 
  document_ids = '["doc_id_1", "doc_id_2", "doc_id_3", "doc_id_4"]',
  vector_store_id = 'vs_688e55e74e68819190cca71d1fa54f52',
  assistant_id = 'asst_pspnPtUj1RF5zC460VKkkjdV'
WHERE id = 'ast_reflection';
```

### OpenAI API Integration
- Vector Store ID: `vs_688e55e74e68819190cca71d1fa54f52`
- Assistant ID: `asst_pspnPtUj1RF5zC460VKkkjdV`
- Uses file_search tool for document retrieval
- Requires OpenAI file IDs from `training_documents.openai_file_id`

### Files Involved
- `/server/services/openai-api-service.ts` - Already updated for assistant architecture
- `/server/routes/coaching-routes.ts` - Uses Reflection Talia for coaching responses
- Database tables: `training_documents`, `talia_personas`

## Related Work
- Part of larger OpenAI architecture refactoring (multiple projects → single project + assistants)
- Builds on completed work: Report Talia vector store setup
- Required for proper AI coaching functionality

## Testing Plan
1. **Document Upload Verification**
   - Check OpenAI dashboard shows 4 files in vector store
   - Verify file names match expected training documents

2. **Functional Testing**
   - Test coaching interface responses
   - Verify context from training documents appears in responses
   - Confirm no "I don't have access to that information" responses

3. **Database Integrity**
   - Verify persona record has correct IDs
   - Check document assignments match uploaded files

## Definition of Done
- [ ] All 4 required documents uploaded to Reflection Talia vector store
- [ ] Database records updated with correct IDs and assignments
- [ ] Reflection Talia responses demonstrate access to training document context
- [ ] No errors in coaching interface functionality
- [ ] Documentation updated for vector store setup process

## Priority Justification
**High Priority** - This blocks the AI coaching functionality which is a core feature. Without proper training documents, Reflection Talia cannot provide informed coaching responses, degrading user experience significantly.