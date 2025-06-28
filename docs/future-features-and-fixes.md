# Future Features & Fixes Backlog

## 📋 About This Document

This file tracks feature requests, bugs, and improvements that come up during development but aren't addressed in the current chat session. Use this to maintain continuity across development sessions and ensure nothing gets lost.

## 🎯 How to Use This Document

### **For Development Sessions:**
- **Add items** when features/fixes are identified but not implemented
- **Move items** from "Backlog" to "In Progress" when working on them
- **Move items** to "Completed" when finished
- **Include context** about why the item is needed and any implementation notes

### **For Claude/AI Assistants:**
- **Always check this file** at the start of new development sessions
- **Ask the user** if they want to work on any backlog items
- **Update this file** when new items are discovered or completed
- **Reference this file** when planning development priorities

---

## 🚀 Feature Requests

### **High Priority**
*Features that would significantly improve user experience or functionality*

- [ ] **Real-time progress sync** - Currently progress only updates on page refresh
- [ ] **Bulk user management** - Admin ability to import/export multiple users at once
- [ ] **Workshop completion certificates** - Generate PDF certificates when users complete workshops

### **Medium Priority**
*Nice-to-have features that would enhance the platform*

- [ ] **User profile pictures** - Allow users to upload and display profile photos
- [ ] **Workshop analytics dashboard** - Show completion rates, time spent, popular steps
- [ ] **Email notifications** - Notify users of progress milestones or admin messages
- [ ] **Workshop themes/branding** - Allow customization of colors and logos per organization

### **Low Priority**
*Future enhancements for consideration*

- [ ] **Mobile app** - Native iOS/Android apps for workshop access
- [ ] **Multi-language support** - Translate workshops into multiple languages
- [ ] **Workshop builder** - Allow admins to create custom workshop content
- [ ] **Integration APIs** - Connect with external HR/learning management systems

---

## 🐛 Bug Fixes & Technical Improvements

### **High Priority**
*Issues that affect core functionality*

- [ ] **Session timeout handling** - Better UX when user sessions expire
- [ ] **Error boundary improvements** - More graceful error handling throughout app
- [ ] **Database performance optimization** - Query optimization for large user bases
- [ ] **Workshop Card button logic consistency** - Consider standardizing "Go to Workshop" vs "Continue Workshop" vs "Switch to Workshop" logic across different user states

### **Medium Priority**
*Issues that occasionally cause problems*

- [ ] **Loading state consistency** - Standardize loading indicators across all components
- [ ] **Mobile responsive design** - Improve mobile experience for smaller screens
- [ ] **Browser compatibility** - Test and fix issues with older browsers

### **Low Priority**
*Minor issues or code quality improvements*

- [ ] **TypeScript strict mode** - Improve type safety throughout codebase
- [ ] **Code documentation** - Add JSDoc comments to all major functions
- [ ] **Test coverage** - Add unit and integration tests for critical paths
- [ ] **Performance monitoring** - Add metrics and monitoring for production

---

## ✅ Completed Items

### **Recent Completions** *(Move items here when finished)*

- ✅ **Test user progress display bug** *(2025-06-28)* - Fixed step ID mapping to show correct sequential progress (4-1 → step 10 of 14)
- ✅ **Admin export permissions** *(2025-06-28)* - Allow admins to access any user data while maintaining security for self-access
- ✅ **Data export consistency** *(2025-06-28)* - Unified admin and test user export formats to use identical structure
- ✅ **Function hoisting error** *(2025-06-28)* - Fixed "Cannot access before initialization" error by moving helper functions before usage
- ✅ **Step number calculation** *(2025-06-28)* - Created proper mapping from AST step IDs to sequential positions (1-1=1, 2-1=2, ..., 4-1=10)
- ✅ **Admin role detection** *(2025-06-28)* - Fixed permission check to use session.userRole instead of session.role
- ✅ **Workshop step count accuracy** *(2025-06-28)* - Corrected AST workshop to show 14 steps instead of 19 (removed non-workshop steps from count)

---

## 📝 Implementation Notes

### **Development Patterns Established**
- Use precision prompts for complex multi-file changes
- Claude direct editing for simple 1-2 file modifications
- Always test both admin and test user workflows when making changes
- Maintain separation between AST and IA workshop logic

### **Architecture Decisions**
- Test users use admin export endpoint with self-access permissions (session.userRole === 'admin' OR sessionUserId === requestedUserId)
- Workshop step IDs map to sequential numbers for display (4-1 → step 10 of 14) using astStepOrder lookup table
- Navigation progress stored separately for AST and IA workshops in navigationProgress.ast and navigationProgress.ia objects
- Shared components use `isImaginalAgility` prop for workshop differentiation
- AST workshop has 14 actual steps (1-1 through 4-5), not 19 as originally implemented
- Helper functions must be defined before useMemo hooks that reference them to avoid hoisting errors

### **Testing Checklist Template**
When implementing new features, test:
- [ ] Admin user functionality
- [ ] Test user functionality  
- [ ] AST workshop behavior
- [ ] IA workshop behavior
- [ ] Mobile responsiveness
- [ ] Data export/import consistency

---

## 🔄 Recurring Development Tasks

### **Regular Maintenance**
- Review and update this backlog monthly
- Check for security updates in dependencies
- Monitor user feedback for new feature requests
- Performance review and optimization

### **Before Major Releases**
- Full regression testing across all user types
- Data export/import validation
- Mobile device testing
- Documentation updates

---

**Last Updated:** June 28, 2025  
**Next Review:** July 28, 2025