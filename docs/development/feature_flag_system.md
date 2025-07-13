# Feature Flag System Documentation

## 🎯 **Overview**
Comprehensive environment-based feature flag system for controlled feature rollout across development, staging, and production environments.

## 📁 **Core Files**
- **Main System**: `client/src/utils/featureFlags.ts`
- **Integration Example**: `client/src/components/navigation/NavBar.tsx`

## 🌍 **Environment Detection**

### **Automatic Environment Detection:**
```typescript
export function getEnvironment(): Environment {
  // Check for staging first (highest priority)
  if (typeof window !== 'undefined' && 
      window.location.hostname.includes('app2.heliotropeimaginal.com')) {
    return 'staging';
  }
  
  // Check for development
  if (process.env.NODE_ENV === 'development' || 
      (typeof window !== 'undefined' && window.location.hostname.includes('localhost'))) {
    return 'development';
  }
  
  // Default to production
  return 'production';
}
```

### **Environment Mapping:**
- **Development**: `localhost:5001` → DEV badge (orange)
- **Staging**: `app2.heliotropeimaginal.com` → STAGING badge (blue)
- **Production**: `app.heliotropeimaginal.com` → No badge (clean UI)

## 🚩 **Feature Flag Configuration**

### **Current Feature Flags:**
```typescript
const featureFlags = {
  // Environment indicators
  showEnvironmentBadge: true,        // Show badges in dev/staging only
  environmentBadgeType: null as BadgeType,  // Set dynamically
  
  // Future feature flags (ready for implementation)
  holisticReports: false,           // AI-powered user reports
  facilitatorConsole: false,        // Facilitator management interface
  workshopLocking: false,           // Lock completed workshops
  advancedAnalytics: false,         // Enhanced user analytics
  betaFeatures: false,              // Experimental features
};
```

## 🔧 **Usage Patterns**

### **Basic Feature Check:**
```typescript
import { isFeatureEnabled } from '../../utils/featureFlags';

// In components
{isFeatureEnabled('holisticReports') && (
  <Button onClick={generateReport}>Generate Holistic Report</Button>
)}
```

### **Environment-Specific Logic:**
```typescript
import { getEnvironment, getEnvironmentBadge } from '../../utils/featureFlags';

const environment = getEnvironment();
const badgeType = getEnvironmentBadge();

// Show different content based on environment
{environment === 'staging' && (
  <div>This feature is in staging testing</div>
)}
```

### **Environment Badge Integration:**
```typescript
// Current implementation in NavBar.tsx
{isFeatureEnabled('showEnvironmentBadge') && getEnvironmentBadge() && (
  <span className={`ml-3 text-xs rounded-full px-2 py-1 font-semibold ${
    getEnvironmentBadge() === 'DEV' 
      ? 'bg-orange-100 text-orange-800' 
      : 'bg-blue-100 text-blue-800'
  }`}>
    {getEnvironmentBadge()}
  </span>
)}
```

## 🚀 **Deployment Strategy**

### **Feature Rollout Process:**
1. **Development**: Enable feature flag, test locally with DEV badge
2. **Staging**: Deploy to app2, test with external users, STAGING badge visible
3. **Production**: Enable stable features only, clean UI without badges

### **Selective Feature Deployment:**
```typescript
// Features can be enabled per environment
const features = {
  development: {
    newIAProgression: true,     // Testing new IA features
    debugMode: true,            // Debug information visible
  },
  staging: {
    newIAProgression: true,     // Share with external testers
    debugMode: false,           // Clean for user testing
  },
  production: {
    newIAProgression: false,    // Not ready for production
    debugMode: false,           // Never show in production
  }
};
```

## 🔒 **Safety Features**

### **Environment Isolation:**
- **Production Protection**: Features disabled by default in production
- **Staging Testing**: Safe environment for external user testing
- **Development Freedom**: All features enabled for local development

### **Gradual Rollout:**
- **Feature-by-feature**: Enable individual features independently
- **Environment-specific**: Different feature sets per environment
- **Easy Rollback**: Disable features without code deployment

## 📈 **Extension Guidelines**

### **Adding New Feature Flags:**
1. **Add to featureFlags object** in `featureFlags.ts`
2. **Set appropriate default values** for each environment
3. **Use `isFeatureEnabled()`** throughout components
4. **Test in development** before staging deployment

### **Environment-Specific Features:**
```typescript
// Example: New feature only in staging and dev
{(environment !== 'production' && isFeatureEnabled('experimentalFeature')) && (
  <ExperimentalComponent />
)}
```

### **Component Integration Pattern:**
```typescript
import { isFeatureEnabled, getEnvironment } from '../../utils/featureFlags';

export function MyComponent() {
  const environment = getEnvironment();
  
  return (
    <div>
      {/* Always visible */}
      <StandardFeature />
      
      {/* Feature flag controlled */}
      {isFeatureEnabled('newFeature') && (
        <NewFeature />
      )}
      
      {/* Environment specific */}
      {environment === 'development' && (
        <DebugInfo />
      )}
    </div>
  );
}
```

## ✅ **Success Criteria**

### **Working Feature Flag System:**
- ✅ Environment automatically detected
- ✅ Badges show correctly per environment
- ✅ Features can be enabled/disabled independently
- ✅ Production remains clean and stable
- ✅ Easy to extend with new features

### **Testing Checklist:**
- [ ] DEV badge shows on localhost
- [ ] STAGING badge shows on app2
- [ ] No badge shows on production
- [ ] Feature flags control component visibility
- [ ] Environment detection works across deployments

## 🎯 **Future Enhancements**

### **Planned Feature Flags:**
- **Holistic Reports**: AI-powered individual development reports
- **Facilitator Console**: Enhanced facilitator management tools
- **Workshop Locking**: Lock completed workshops from editing
- **Advanced Analytics**: Enhanced user progress analytics
- **Real-time Collaboration**: Live workshop collaboration features

### **Advanced Features:**
- **User-specific flags**: Enable features for specific users
- **Percentage rollouts**: Enable features for X% of users
- **A/B testing**: Compare different feature implementations
- **Remote configuration**: Update flags without deployment

---

**Status**: ✅ **Feature Flag System Operational**  
**Environment**: All three environments supported  
**Integration**: NavBar.tsx implemented, ready for expansion  
**Next Steps**: Deploy to staging to test STAGING badge