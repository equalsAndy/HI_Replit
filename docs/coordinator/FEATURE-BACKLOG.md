# Feature Backlog & Improvements - Heliotrope Imaginal

## 🚀 Near Term (Next 2-4 weeks)

### **High Priority**
- [ ] **Missing Demo Data Buttons for Reflections** - Rounding Out, Well-being Reflections, Visualizing You (+ needs preset images), Reflection on Visualizing, Final Reflection
- [ ] **IA Assessment Data Corruption** - Test user's imaginal_agility assessment data stored as character-indexed object instead of proper JSON
- [ ] **Progress Reset Bug with Data Persistence** - User progress visually resets while data remains intact
- [ ] **Strengths Assessment Modal Issues** - Weird stutter/reload on load, modal resizes with each question
- [ ] **Make Reflections Required** - All reflection fields required before proceeding, trigger next button activation when complete
- [ ] **Well-being Ladder Text Updates** - Change button text to "Work forward from 5 years" / "Work backward from 20 years", move "There's no right way—only your way" to step 1

### **Medium Priority**  
- [ ] **Modal Timer Issue** - End-of-workshop modal timer needs fixing, find original prompt and compare
- [ ] **Test User Reset & Progress Display** - Progress needs to reset visually without page refresh, show "Not Started" instead of "Step 1 of X" when at step one
- [ ] **Demo Data Quality Improvement** - Make all demo data meaningful and realistic instead of random/placeholder text
- [ ] **IA Finish Workshop Modal** - Use same modal style as AST with congratulations message ("You are ready to become imaginally agile")

## 🎯 Medium Term (1-3 months)

### **Major Features**
- [ ] **Holistic Report Complete Makeover (PRIORITY)** - Use Claude API to generate meaningful report, bigger project requiring significant development
- [ ] **Workshop Completion Lock System (BIGGER PROJECT - HANDLE CAREFULLY)** - Lock all inputs when workshop finished, prevent alterations after completion, trigger holistic report generation

### **Layout & UI Improvements**
- [ ] **IA-1-1 Readability Issues** - Fonts too small, layout needs improvement, consider using cards for better organization
- [ ] **Challenges Table/Display Redesign** - First "column" should be consistent across all 3 challenges, takes up more space than needed
- [ ] **IA-3-1 Layout Improvements** - Apply same readability treatment as ia-1-1, convert 5 core capabilities from bullets to graph format (5 capability graphics available as separate files)
- [ ] **IA Teamwork Preparation Layout Issues** - Needs layout improvements similar to other IA steps, fonts too small, convert to card-style design
- [ ] **IA Neuroscience Layout Issues** - Same treatment as other IA steps, fonts too small, convert to card-style design

## 🔧 Technical Debt & Optimizations

### **Code Quality**
- [ ] **Investigate Assessment Data Storage** - Why is IA assessment data being corrupted into character-indexed format?
- [ ] **Progress State Management** - Ensure progress tracking properly syncs with actual data state

### **Performance**
- [ ] **Modal Loading Optimization** - Fix stutter/reload issues in assessment modals
- [ ] **Consistent Modal Sizing** - Prevent modals from resizing based on content

## 💡 Ideas & Research

### **Potential Features**
- [ ] **Enhanced Demo Data System** - Consider dynamic demo data generation for different user scenarios
- [ ] **Progress Visualization** - Better visual indicators for workshop completion status

---

**Last Updated:** June 28, 2025  
**Source:** Issues identified during development session  
**Priority Order:** High Priority items should be addressed first for optimal user experience