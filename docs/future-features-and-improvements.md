# Future Features & Improvements Backlog

## 🎯 Ongoing Development Items

*This document tracks features, improvements, and technical debt identified during development.*

---

## 🔧 **Current Issues Being Resolved**

### **Logo Sizing Consistency** (In Progress)
**Issue**: IA and AST logos have inconsistent sizing due to different aspect ratios
- **Root Cause**: Height-based sizing (`h-12`) doesn't account for different logo aspect ratios
- **IA Logo**: 744:187 ratio → appears too narrow at fixed height
- **AST Logo**: 250:50 ratio → looks better at same fixed height
- **Solution**: Switch to width-based responsive sizing with `w-48 h-auto`
- **Status**: Routing fixed ✅, sizing fix in progress
- **Files**: `Logo.tsx`, `UserHomeNavigationWithStarCard.tsx`

---

## 🚀 **Technical Improvements Identified**

### **Environment Consistency Patterns**
**Need**: Establish patterns for assets that work in both dev and deployed environments
- **Context**: Logo path issues revealed dev vs production inconsistencies
- **Solution Implemented**: Logo component with proper Vite asset handling
- **Future**: Document best practices for asset management

### **Workshop Route Architecture** 
**Improvement**: Better separation of workshop-specific routing
- **Current**: Fixed routing confusion between AST and IA workshops
- **Future**: Consider more explicit route separation patterns
- **Benefit**: Easier maintenance and clearer workshop boundaries

### **Component State Management**
**Pattern**: Improve prop flow for workshop detection
- **Current**: `currentApp` → `isImaginalAgility` → Logo type
- **Improvement**: More direct workshop context or state management
- **Benefit**: Reduce prop drilling and improve reliability

---

## 📋 **Development Workflow Enhancements**

### **Debugging Patterns**
**Success**: Console logging approach effectively identified root causes
- **Pattern**: Add temporary debug logs at each step in complex chains
- **Tools**: Route detection, prop flow, component state tracking
- **Future**: Create debugging utility functions for common scenarios

### **Assistant Collaboration Workflow**
**Refined**: Better decision framework for Claude vs Replit Agent
- **Claude**: Simple 1-2 file changes, direct analysis
- **Replit Agent**: Complex multi-file changes, new features
- **Success**: Logo troubl