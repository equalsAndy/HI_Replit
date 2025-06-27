
# Test User Code Examples

## CURRENT PATTERNS FOUND

### Test User Detection Examples

**Pattern 1: Database-First Detection (Secure)**
```typescript
// From: client/src/components/test-users/TestUserBanner.tsx
const { data: userData, isLoading } = useQuery<{
  success: boolean;
  user: {
    id: number;
    isTestUser?: boolean;
  }
}>({
  queryKey: ['/api/user/profile'],
});

const isTestUser = user?.isTestUser;
```

**Pattern 2: Username Pattern Fallback (Less Secure)**
```typescript
// From: client/src/components/test-users/TestUserBanner.tsx
const isTestUser = user?.isTestUser || 
  /^(admin|participant|participant\d+|facilitator|facilitator\d+|user\d+|bobby|jbaez|test)$/i.test(user?.username || '') ||
  user?.username?.toLowerCase().includes('test');
```

**Pattern 3: Server-Side Detection**
```typescript
// From: server/services/user-management-service.ts
async getAllTestUsers() {
  const result = await db.select()
    .from(users)
    .where(eq(users.isTestUser, true));
}
```

### Test Button Implementation Examples

**Pattern 1: Admin-Only Test Controls**
```typescript
// From: client/src/components/admin/UserManagement.tsx
<Switch 
  checked={selectedUser?.isTestUser || false}
  onCheckedChange={() => selectedUser && handleToggleTestUser(selectedUser.id)}
  aria-label="Toggle test user status"
  className="data-[state=checked]:bg-amber-500"
/>
```

**Pattern 2: Self-Service Test Reset**
```typescript
// From: client/src/components/test-users/TestUserBanner.tsx
<Button
  variant="outline"
  size="sm"
  className="bg-white text-red-600 border-red-200 hover:bg-red-50 flex items-center"
  onClick={handleResetUserData}
>
  <RefreshCw className="h-4 w-4 mr-1" />
  <span>Reset Data</span>
</Button>
```

**Pattern 3: Test User Picker**
```typescript
// From: client/src/components/test-users/TestUserPicker.tsx
const loginAsUser = async (userId: number) => {
  const response = await apiRequest('POST', '/api/auth/login', {
    username: `user${userId}`,
    password: 'password123'
  });
  
  if (response.ok) {
    window.location.href = '/user-home';
  }
};
```

### Test Data Addition Examples

**Pattern 1: Complete Workshop Data Generation**
```typescript
// From: client/src/components/admin/UserUploader.tsx
const generateTestUserData = (userNumber: number) => {
  return {
    userInfo: {
      username: `testuser${userNumber}`,
      name: `Test User ${userNumber}`,
      isTestUser: true
    },
    navigationProgress: {
      completedSteps: ["1-1", "2-1", "2-2", "2-3", "2-4"],
      currentStepId: "5-1",
      appType: "ast"
    },
    assessments: {
      starCard: {
        thinking: 25 + Math.random() * 20,
        feeling: 15 + Math.random() * 20,
        acting: 20 + Math.random() * 20,
        planning: 25 + Math.random() * 20
      }
    }
  };
};
```

**Pattern 2: API-Based Data Reset**
```typescript
// From: server/services/user-management-service.ts
async deleteUserData(userId: number) {
  // Delete star card data
  await db.execute(sql`DELETE FROM star_cards WHERE user_id = ${userId}`);
  
  // Delete flow attributes
  await db.execute(sql`DELETE FROM flow_attributes WHERE user_id = ${userId}`);
  
  // Delete user assessments
  await db.execute(sql`DELETE FROM user_assessments WHERE user_id = ${userId}`);
  
  // Delete navigation progress
  await db.execute(sql`DELETE FROM navigation_progress WHERE user_id = ${userId}`);
}
```

**Pattern 3: Hardcoded Test Data Fallback**
```typescript
// From: client/src/components/starcard/StarCardWithFetch.tsx
// Create hardcoded test data as absolute last resort
const testStarCard = {
  thinking: 25,
  feeling: 20,
  acting: 30,
  planning: 25,
  userId: currentUser?.id || 0,
  createdAt: new Date().toISOString()
};
```

### Security Pattern Examples

**Pattern 1: Server-Side Authorization (Best Practice)**
```typescript
// From: server/routes/admin-routes.ts
router.delete('/users/:id/data', requireAuth, isAdmin, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  const result = await userManagementService.deleteUserData(id);
  
  if (!result.success) {
    return res.status(400).json({ message: result.error });
  }
});
```

**Pattern 2: Client-Side Guards (Acceptable)**
```typescript
// From: client/src/components/profile/ResetDataButton.tsx
const isTestUser = user?.isTestUser || false;

if (!isTestUser) {
  return null; // Don't render for non-test users
}
```

**Pattern 3: Mixed Client/Server Validation (Current Standard)**
```typescript
// Client-side check first
if (!user?.isTestUser) {
  toast.error("Only test users can reset data");
  return;
}

// Server-side validation in API
const handleResetData = async () => {
  const response = await fetch('/api/test-users/reset-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.id })
  });
};
```

## PATTERN ANALYSIS

### Consistent Patterns (Working Well)

1. **Database-First Test User Detection**: Using `isTestUser` field is reliable and secure
2. **Admin Role Requirements**: Destructive operations properly require admin authentication
3. **Conditional UI Rendering**: Test features hidden from non-test users consistently
4. **Standard API Response Format**: Consistent success/error response structure

**Example of Good Pattern**:
```typescript
// Secure, consistent, maintainable
const isTestUser = user?.isTestUser === true;
if (!isTestUser) return null;

// Render test features only for verified test users
return <TestUserControls />;
```

### Inconsistent Patterns (Need Standardization)

1. **Mixed Security Approaches**: Some use role-based, others use test-user-based permissions
2. **Variable Error Handling**: Different components handle unauthorized access differently  
3. **Inconsistent API Patterns**: Some endpoints validate test user status, others don't
4. **UI Styling Variations**: Test user indicators have different visual treatments

**Example of Inconsistent Pattern**:
```typescript
// Component A: Uses role check
if (user?.role !== 'admin') return null;

// Component B: Uses test user check  
if (!user?.isTestUser) return null;

// Component C: Uses username pattern
if (!/test/i.test(user?.username)) return null;
```

### Best Practices Found (Examples to Replicate)

1. **Comprehensive Data Reset**: `deleteUserData()` function covers all user-related tables
2. **User Feedback**: Clear toast messages for test actions
3. **Error Boundaries**: Proper error handling with graceful fallbacks
4. **Type Safety**: Strong TypeScript typing for test user operations

**Example of Best Practice**:
```typescript
// Comprehensive, type-safe, user-friendly
const resetUserData = async (userId: number): Promise<{
  success: boolean;
  message: string;
  deletedData?: any;
}> => {
  try {
    const result = await userManagementService.deleteUserData(userId);
    
    if (result.success) {
      toast.success("Test data reset successfully");
    } else {
      toast.error(result.error || "Reset failed");
    }
    
    return result;
  } catch (error) {
    const message = "Failed to reset test data";
    toast.error(message);
    return { success: false, message };
  }
};
```

### Anti-Patterns Found (Examples to Avoid)

1. **Client-Only Security**: Relying solely on client-side checks for security
2. **Username Pattern Matching**: Using regex patterns for security decisions
3. **Silent Failures**: Functions that fail without user notification
4. **Hardcoded User Lists**: Maintaining static lists of test usernames

**Example of Anti-Pattern (Avoid)**:
```typescript
// AVOID: Client-only security, no server validation
const resetData = () => {
  if (!username.includes('test')) return; // Easily bypassed
  
  // Direct database manipulation without server validation
  localStorage.clear(); // Not comprehensive
  
  // No user feedback on success/failure
};
```

**Better Alternative**:
```typescript
// BETTER: Server-validated, comprehensive, user-friendly
const resetData = async () => {
  if (!user?.isTestUser) {
    toast.error("Only test users can reset data");
    return;
  }
  
  try {
    const response = await fetch('/api/test-users/reset', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const result = await response.json();
    
    if (result.success) {
      toast.success("Data reset successfully");
      // Refresh UI state
    } else {
      toast.error(result.error);
    }
  } catch (error) {
    toast.error("Reset failed");
  }
};
```
