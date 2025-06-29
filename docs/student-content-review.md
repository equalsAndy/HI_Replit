# Student Content Review & Recommendations

## 🎯 Confirmed Changes Needed

### 1. Orientation Content
- **Orientation Video**: Replace workplace-focused video with youth/school version
- **Welcome Text**: Update intro text to use school/academic context instead of workplace
- **Location**: Likely in orientation/welcome components

### 2. Menu Section Headers  
- **Current**: "Session 1", "Session 2", etc.
- **Student Version**: "Week 1", "Week 2", etc.
- **Scope**: Navigation menu headers only, not throughout entire UI

## 📋 Content Audit Recommendations

### High Priority - Orientation Areas to Review:
- [ ] Welcome/intro video content
- [ ] Onboarding text and instructions
- [ ] Initial setup guidance
- [ ] Assessment introduction text

### Medium Priority - Navigation Elements:
- [ ] Section/module headers in navigation
- [ ] Progress indicators in menus
- [ ] Breadcrumb terminology

### Low Priority - General Content Scan:
- [ ] Email templates (if role-specific)
- [ ] Help text and tooltips
- [ ] Error messages with role context

## 🔍 Files to Investigate

### Likely Orientation Files:
- `client/src/components/orientation/` (if exists)
- `client/src/components/welcome/` (if exists) 
- `client/src/pages/onboarding/` or similar
- Main dashboard/landing components

### Navigation Files:
- `client/src/components/navigation/navigationData.ts` (confirmed exists)
- Navigation menu components
- Progress/section header components

## 📝 Implementation Notes
- Keep changes minimal and role-specific
- Use conditional rendering based on user role
- Maintain existing workplace content for other user types
- Focus on first-impression areas (orientation) and navigation clarity

## ✅ Next Steps
1. Locate orientation/welcome components
2. Identify section header locations in navigation
3. Plan conditional content rendering by user role
4. Test with student accounts after changes