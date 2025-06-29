# Facilitator Console & Cohort Management System

## 🎯 Overview
A comprehensive facilitator management system that allows facilitators to create and manage cohorts, generate limited invites, and oversee their assigned users while maintaining appropriate permission boundaries.

## 📊 System Architecture

### **Core Concepts**
- **Cohorts**: Groups of users managed by a facilitator with specific workshop access
- **Independent Users**: Admin-created users not assigned to any cohort
- **Workshop Access**: Cohort-based permissions for AST, IA, or both workshops
- **Team Features**: Menu items and features only available to cohort members

### **User Types & Permissions**
| Role | Can Create | Cohort Access | Workshop Access |
|------|------------|---------------|-----------------|
| Admin | All roles | All cohorts | All workshops |
| Facilitator | Participant, Student | Own cohorts only | Cohort-defined |
| Participant/Student | None | Assigned cohort | Cohort-defined |

## 🗄️ Database Schema

### **New Tables Required**

#### **Cohorts Table**
```sql
CREATE TABLE cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  facilitator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ast_access BOOLEAN DEFAULT false,
  ia_access BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **User-Cohort Relationship**
```sql
-- Option A: Add to existing users table
ALTER TABLE users ADD COLUMN cohort_id UUID REFERENCES cohorts(id) ON DELETE SET NULL;

-- Option B: Separate junction table (if many-to-many needed in future)
CREATE TABLE user_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, cohort_id)
);
```

### **Migration Strategy**
- All existing users remain independent (cohort_id = NULL)
- Preserve all current admin functionality
- No breaking changes to existing user flows

## 🔧 Backend Implementation

### **New API Endpoints**

#### **Cohort Management**
```
GET    /api/facilitator/cohorts           # List facilitator's cohorts
POST   /api/facilitator/cohorts           # Create new cohort
PUT    /api/facilitator/cohorts/:id       # Update cohort
DELETE /api/facilitator/cohorts/:id       # Delete cohort (if empty)
GET    /api/facilitator/cohorts/:id/users # List cohort members
```

#### **Limited Invite Creation**
```
POST   /api/facilitator/invites           # Create participant/student invites only
GET    /api/facilitator/invites           # List facilitator's created invites
```

#### **User Management**
```
GET    /api/facilitator/users             # List users in facilitator's cohorts
PUT    /api/facilitator/users/:id/cohort  # Move user between facilitator's cohorts
```

### **Permission Middleware**
- **Facilitator Scope**: Queries limited to facilitator's own cohorts
- **Role Restrictions**: Facilitators cannot create admin/facilitator invites
- **Cohort Boundaries**: Facilitators cannot access users outside their cohorts

## 🖥️ Frontend Implementation

### **Facilitator Console Components**

#### **Dashboard Overview**
- Cohort summary cards with member counts
- Recent activity feed
- Quick actions (create cohort, generate invite)

#### **Cohort Management**
- **Create Cohort**: Name, description, workshop access toggles
- **Edit Cohort**: Update settings, workshop permissions
- **Member Roster**: List users with basic info and progress
- **Invite Generation**: Create participant/student invites for cohort

#### **Limited Invite Interface**
- Role selection: Participant, Student only
- Automatic cohort assignment to new users
- Invite code generation and tracking

### **Navigation & Access Control**

#### **Menu Visibility Logic**
```typescript
// Pseudo-code for navigation filtering
const showTeamFeatures = user.cohort_id !== null;
const menuItems = baseMenuItems.filter(item => {
  if (item.requiresCohort && !showTeamFeatures) return false;
  if (item.workshop === 'ast' && !userHasASTAccess) return false;
  if (item.workshop === 'ia' && !userHasIAAccess) return false;
  return true;
});
```

#### **Workshop Access Control**
- Cohort members: Access based on cohort.ast_access, cohort.ia_access
- Independent users: Full access to both workshops
- Team-specific features hidden for independent users

## 🔄 User Experience Flows

### **Facilitator Workflow**
1. **Login** → Facilitator Console (not admin dashboard)
2. **Create Cohort** → Set workshop permissions
3. **Generate Invites** → Participant/Student only, auto-assigned to cohort
4. **Manage Members** → View progress, move between facilitator's cohorts
5. **Monitor Activity** → Cohort-scoped reporting and progress

### **Cohort Member Workflow**
1. **Register** via facilitator invite → Auto-assigned to cohort
2. **Access Workshops** → Based on cohort permissions
3. **See Team Features** → Team workshop menus visible
4. **Progress Tracking** → Facilitator can view progress

### **Independent User Workflow**
1. **Register** via admin invite → No cohort assignment
2. **Full Workshop Access** → Both AST and IA available
3. **Individual Experience** → No team features, self-directed
4. **Admin Oversight** → Admin manages directly

## 🧪 Testing Requirements

### **Permission Testing**
- [ ] Facilitators cannot access other facilitators' cohorts
- [ ] Facilitators cannot create admin/facilitator invites
- [ ] Cohort members only see appropriate workshops
- [ ] Independent users maintain full access

### **Data Integrity**
- [ ] Deleting facilitator handles cohort ownership
- [ ] Removing cohort properly handles member assignments
- [ ] User role changes respect cohort boundaries

### **User Experience**
- [ ] Smooth onboarding for cohort vs independent users
- [ ] Proper menu visibility based on cohort membership
- [ ] Clear distinction between facilitator and admin interfaces

## 📋 Implementation Phases

### **Phase 1: Foundation (High Priority)**
1. Database schema and migrations
2. Backend API endpoints with permission middleware
3. Basic facilitator authentication and routing

### **Phase 2: Core Features (High Priority)**
1. Cohort CRUD operations
2. Limited invite creation system
3. User-cohort assignment logic

### **Phase 3: Console Interface (Medium Priority)**
1. Facilitator dashboard components
2. Cohort management UI
3. Member roster and basic reporting

### **Phase 4: Access Control (Medium Priority)**
1. Navigation filtering logic
2. Workshop access control
3. Team feature visibility

### **Phase 5: Polish & Testing (Low Priority)**
1. Comprehensive permission testing
2. User experience refinements
3. Performance optimization for large cohorts

## 🚨 Considerations & Constraints

### **Security**
- Strict facilitator scope enforcement
- Prevent privilege escalation attempts
- Audit trail for facilitator actions

### **Scalability**
- Efficient queries for large cohorts
- Pagination for member lists
- Caching for permission checks

### **Usability**
- Clear distinction between facilitator and admin interfaces
- Intuitive cohort management workflow
- Helpful error messages for permission boundaries

---

**Status**: Specification Complete - Ready for Implementation Planning
**Complexity**: High - Multi-component system with security implications
**Dependencies**: Existing user/role system, invite system, navigation framework