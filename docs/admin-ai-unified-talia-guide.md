# Admin AI: Unified Talia Report Generation System

## Overview

The Talia report generation system has been unified to ensure consistent behavior across all report generation interfaces. This guide explains how the new system works and how to manage it effectively.

## Architecture

### Single Main Prompt System

**Main Prompt Document:**
- **Title**: `"Talia Report Generation Prompt"`
- **Purpose**: Contains comprehensive instructions for both personal and professional reports
- **Location**: Managed through Admin → Persona Management → star_report persona
- **Behavior**: Handles report type differentiation internally based on user request

### Supporting Documents

**Document Types:**
- **Examples**: `"Samantha Personal Report"`, professional report examples
- **Guidelines**: Training data and behavioral guidelines
- **Context**: AST methodology, flow attributes, coaching principles

## Report Generation Paths

### 1. Admin Console Reports (`/admin`)
- **Path**: Admin → Test Reports → Generate Personal/Professional Report
- **Uses**: Main prompt + enabled supporting documents
- **Features**: Full document access, comprehensive generation

### 2. Holistic Report Page (`/holistic-reports`)
- **Path**: User dashboard → Generate Personal/Professional Report buttons
- **Uses**: Same main prompt + supporting documents (token-optimized)
- **Features**: User-facing interface, optimized for performance

**Important**: Both paths now use identical document lookup and generation logic.

## Document Management

### Viewing Current Configuration

1. **Go to Admin Console** → Persona Management
2. **Select `star_report` persona**
3. **Main Prompt Section** displays:
   - Current main prompt document title
   - Edit button for direct modification
   - Last updated timestamp

4. **Supporting Documents Section** shows:
   - List of enabled supporting documents
   - Document types and descriptions
   - Toggle switches for enable/disable

### Editing the Main Prompt

1. **Access**: Admin → Persona Management → star_report → Main Prompt
2. **Edit Button**: Opens full document editor
3. **Structure**: Prompt should handle both personal/professional reports
4. **Variables**: Use `{reportType}` placeholder for dynamic content
5. **Save**: Updates take effect immediately for all report generation

### Managing Supporting Documents

1. **Upload**: Admin → Training Documents → Upload New Document
2. **Enable**: Persona Management → star_report → Check document boxes
3. **Types**: 
   - `prompt_template`: Additional prompt instructions
   - `example_report`: Sample reports for reference
   - `coaching_guide`: Behavioral guidelines
   - `methodology`: AST framework documentation

## Troubleshooting

### Report Generation Issues

**Symptom**: Generic/fallback prompt being used
- **Check**: Main prompt document exists with exact title `"Talia Report Generation Prompt"`
- **Verify**: Document is enabled for star_report persona
- **Solution**: Upload or rename document to match expected title

**Symptom**: Inconsistent behavior between admin and holistic reports
- **Check**: Both paths using same document lookup system
- **Verify**: No hardcoded prompts in service layer
- **Solution**: Restart application to clear any cached prompts

**Symptom**: Invalid OpenAI API key error when generating holistic reports
- **Check**: Confirm `OPENAI_API_KEY` in AWS SSM Parameter Store is set to a valid key (sk-...)
- **Verify**: No placeholder (`YOUR_KEY`) remains in SSM or environment
- **Solution**: Update `/prod/hi-replit/OPENAI_API_KEY` in AWS SSM to your actual OpenAI secret key

### Document Access Problems

**Symptom**: Document not found in enabled documents
- **Check**: Document status is 'active' in database
- **Verify**: Document ID is in star_report persona's training_documents array
- **Solution**: Re-enable document through persona management interface

**Symptom**: Changes not taking effect
- **Check**: Document was saved successfully
- **Verify**: No browser caching issues
- **Solution**: Clear browser cache or try incognito mode

## Log Analysis

### Successful Document Access
```
✅ Using Talia Report Generation Prompt from enabled documents
📋 Found X enabled documents for star_report persona
🎯 Using unified prompt system for report generation
```

### Document Access Issues
```
⚠️ Talia Report Generation Prompt not found in enabled documents, using fallback
❌ Main prompt document not accessible
🚨 Falling back to generic prompt template
```

### Configuration Verification
```
📊 star_report persona configuration:
  - Main prompt: ✅ Found
  - Supporting docs: X enabled
  - Training data: ✅ Active
```

## Best Practices

### Main Prompt Design
1. **Single Source**: One prompt handles both personal and professional reports
2. **Dynamic Content**: Use placeholders for report-specific content
3. **Clear Instructions**: Explicit guidance for AI behavior
4. **Error Handling**: Fallback instructions for missing data

### Supporting Documents
1. **Relevant Examples**: Include high-quality sample reports
2. **Clear Naming**: Descriptive titles that explain document purpose
3. **Regular Updates**: Keep examples current with methodology changes
4. **Size Management**: Balance comprehensiveness with token limits

### Testing and Validation
1. **Both Paths**: Test admin console AND holistic report generation
2. **Both Types**: Verify personal and professional reports work correctly
3. **Document Changes**: Test after any prompt or document updates
4. **Error Scenarios**: Verify fallback behavior when documents are missing

## System Integration

### Database Schema
- `talia_personas.training_documents`: Array of enabled document IDs
- `training_documents.title`: Exact match required for main prompt
- `training_documents.status`: Must be 'active' for access

### API Endpoints
- `/api/admin/ai/generate-report-talia-md`: Admin console generation
- `/api/reports/holistic/generate`: User-facing generation
- `/api/admin/ai/personas`: Persona configuration management
- `/api/admin/ai/training-docs`: Document management

### Service Layer
- `ai-management-routes.ts`: Admin report generation logic
- `talia-personas.ts`: Unified prompt system implementation
- `claude-api-service.ts`: Report generation execution
- `talia-training-service.ts`: Training data integration

This unified system ensures consistent, manageable, and transparent report generation across all interfaces while providing full administrative control over AI behavior.
