# KAN - Strengthen Password Security Policy

**Issue Type:** Task  
**Project:** KAN  
**Priority:** Medium  
**Reporter:** Claude Code  
**Date Created:** 2025-08-08

## Summary
Enhance password security beyond basic length validation by implementing comprehensive password strength requirements and security best practices

## Description
Current password policy only validates minimum length >= 6 characters, which is insufficient for modern security standards. This creates vulnerabilities through weak passwords, dictionary attacks, and credential stuffing. Implementation should include complexity requirements, common password detection, and strength scoring.

### Current Implementation
```typescript
// Weak validation in change-password endpoint
if (!newPassword || newPassword.length < 6) {
  return res.status(400).json({
    success: false,
    error: 'Password must be at least 6 characters long'
  });
}
```

### Security Weaknesses Identified
1. **Minimal Length**: 6 characters easily brute-forced
2. **No Complexity**: Allows simple passwords like "123456" 
3. **No Dictionary Check**: Common passwords like "password" allowed
4. **No Strength Scoring**: No guidance for users on password quality
5. **No Rate Limiting**: Password change/reset endpoints unprotected
6. **No History Check**: Users can reuse recent passwords

## Impact Assessment
- **Severity**: Medium
- **Risk**: Account compromise, credential stuffing, brute force attacks
- **Affected**: All user accounts, authentication security
- **Compliance**: Security best practices, potential GDPR security requirements

## Acceptance Criteria

### Must Have
- [ ] Minimum 8 character password length (industry standard)
- [ ] Require mix of uppercase, lowercase, numbers, and symbols
- [ ] Block common passwords (top 10,000 most common list)
- [ ] Implement password strength scoring with user feedback
- [ ] Add rate limiting to password change/reset endpoints

### Should Have
- [ ] Password history tracking (prevent reuse of last 5 passwords)
- [ ] Leaked password detection via HaveIBeenPwned API
- [ ] Password complexity meter in UI
- [ ] Configurable policy settings per user role
- [ ] Account lockout after repeated weak password attempts

### Could Have
- [ ] Integration with password managers
- [ ] Two-factor authentication enforcement for weak passwords
- [ ] Password expiration policies for admin accounts
- [ ] Security event logging for password changes
- [ ] Breach notification system integration

## Technical Implementation

### Phase 1: Enhanced Password Validation
```typescript
import zxcvbn from 'zxcvbn';
import fs from 'fs';
import path from 'path';

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  minStrengthScore: number;
  blockCommonPasswords: boolean;
  preventRecentReuse: number;
}

const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: true,
  minStrengthScore: 2, // 0-4 scale from zxcvbn
  blockCommonPasswords: true,
  preventRecentReuse: 5
};

class PasswordValidator {
  private commonPasswords: Set<string> = new Set();
  
  constructor() {
    this.loadCommonPasswords();
  }
  
  private loadCommonPasswords() {
    try {
      // Load common passwords list
      const commonPasswordsPath = path.join(__dirname, '../data/common-passwords.txt');
      const passwords = fs.readFileSync(commonPasswordsPath, 'utf8')
        .split('\n')
        .filter(p => p.trim());
      
      this.commonPasswords = new Set(passwords.map(p => p.toLowerCase()));
    } catch (error) {
      console.warn('Could not load common passwords list:', error);
    }
  }
  
  validatePassword(password: string, userInfo?: any, policy = DEFAULT_PASSWORD_POLICY): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // 1. Length check
    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    }
    
    // 2. Character composition checks
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (policy.requireSymbols && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    // 3. Common password check
    if (policy.blockCommonPasswords && this.isCommonPassword(password)) {
      errors.push('This password is too common. Please choose a more unique password');
    }
    
    // 4. User info check (prevent using name, email, etc.)
    if (userInfo && this.containsUserInfo(password, userInfo)) {
      errors.push('Password should not contain personal information');
    }
    
    // 5. Strength scoring with zxcvbn
    const strengthResult = zxcvbn(password, userInfo ? [userInfo.email, userInfo.name] : []);
    
    if (strengthResult.score < policy.minStrengthScore) {
      errors.push(`Password is too weak. ${strengthResult.feedback.warning || 'Please make it stronger'}`);
    }
    
    // Add suggestions from zxcvbn
    if (strengthResult.feedback.suggestions.length > 0) {
      warnings.push(...strengthResult.feedback.suggestions);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: strengthResult.score,
      crackTime: strengthResult.crack_times_display.offline_slow_hashing_1e4_per_second
    };
  }
  
  private isCommonPassword(password: string): boolean {
    return this.commonPasswords.has(password.toLowerCase());
  }
  
  private containsUserInfo(password: string, userInfo: any): boolean {
    const lowerPassword = password.toLowerCase();
    const userFields = [
      userInfo.name?.toLowerCase(),
      userInfo.email?.split('@')[0]?.toLowerCase(),
      userInfo.username?.toLowerCase()
    ].filter(Boolean);
    
    return userFields.some(field => 
      field && (lowerPassword.includes(field) || field.includes(lowerPassword))
    );
  }
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
  crackTime: string;
}
```

### Phase 2: Password History Tracking
```typescript
// Add to database schema
/*
CREATE TABLE password_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_password_history_user_id ON password_history(user_id);
*/

class PasswordHistoryService {
  async checkPasswordReuse(userId: number, newPassword: string, preventCount = 5): Promise<boolean> {
    try {
      const recentPasswords = await db.execute(sql`
        SELECT password_hash 
        FROM password_history 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC 
        LIMIT ${preventCount}
      `);
      
      for (const record of recentPasswords) {
        if (await bcrypt.compare(newPassword, record.password_hash)) {
          return true; // Password was recently used
        }
      }
      
      return false; // Password is not in recent history
    } catch (error) {
      console.error('Error checking password history:', error);
      return false; // Allow if check fails
    }
  }
  
  async savePasswordToHistory(userId: number, passwordHash: string): Promise<void> {
    try {
      // Save new password to history
      await db.execute(sql`
        INSERT INTO password_history (user_id, password_hash)
        VALUES (${userId}, ${passwordHash})
      `);
      
      // Clean up old history (keep only recent entries)
      await db.execute(sql`
        DELETE FROM password_history 
        WHERE user_id = ${userId}
        AND id NOT IN (
          SELECT id FROM password_history 
          WHERE user_id = ${userId}
          ORDER BY created_at DESC 
          LIMIT 10
        )
      `);
    } catch (error) {
      console.error('Error saving password history:', error);
    }
  }
}
```

### Phase 3: Rate Limiting for Password Operations
```typescript
import rateLimit from 'express-rate-limit';

// Rate limiting for password changes
export const passwordChangeLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Maximum 3 password changes per 15 minutes
  message: {
    success: false,
    error: 'Too many password change attempts. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for password reset requests
export const passwordResetRequestLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Maximum 5 reset requests per hour
  message: {
    success: false,
    error: 'Too many password reset requests. Please try again in an hour.'
  },
  keyGenerator: (req) => {
    // Rate limit by email address for reset requests
    return req.body.email || req.ip;
  }
});

// Rate limiting for login attempts with failed password
export const loginAttemptLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 failed attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: 'Too many failed login attempts. Please try again in 15 minutes.'
  }
});
```

### Phase 4: Enhanced Password Endpoints
```typescript
router.put('/change-password', 
  requireAuth,
  passwordChangeLimit,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = (req.session as any).userId;
      
      // Get user for context
      const user = await userService.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      // Validate current password
      const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentValid) {
        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }
      
      // Validate new password strength
      const passwordValidator = new PasswordValidator();
      const validation = passwordValidator.validatePassword(newPassword, user);
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Password does not meet security requirements',
          details: validation.errors,
          suggestions: validation.warnings
        });
      }
      
      // Check password history
      const historyService = new PasswordHistoryService();
      const isReused = await historyService.checkPasswordReuse(userId, newPassword);
      
      if (isReused) {
        return res.status(400).json({
          success: false,
          error: 'You cannot reuse one of your recent passwords'
        });
      }
      
      // Hash and save new password
      const saltRounds = 12; // Increased from default 10 for better security
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      await userService.updateUserPassword(userId, hashedPassword);
      await historyService.savePasswordToHistory(userId, hashedPassword);
      
      res.json({
        success: true,
        message: 'Password updated successfully',
        passwordStrength: {
          score: validation.score,
          crackTime: validation.crackTime
        }
      });
      
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to change password'
      });
    }
  }
);
```

## Frontend Integration

### Phase 5: Password Strength Indicator
```typescript
// React component for password strength indicator
interface PasswordStrengthProps {
  password: string;
  userInfo?: any;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password, userInfo }) => {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  
  useEffect(() => {
    if (password) {
      // Call backend validation endpoint
      validatePassword(password, userInfo).then(setValidation);
    }
  }, [password, userInfo]);
  
  if (!validation) return null;
  
  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0: return 'text-red-600';
      case 1: return 'text-orange-600';
      case 2: return 'text-yellow-600';
      case 3: return 'text-blue-600';
      case 4: return 'text-green-600';
      default: return 'text-gray-600';
    }
  };
  
  const getStrengthText = (score: number) => {
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return labels[score] || 'Unknown';
  };
  
  return (
    <div className="password-strength">
      <div className={`text-sm ${getStrengthColor(validation.score)}`}>
        Password Strength: {getStrengthText(validation.score)}
      </div>
      
      {validation.crackTime && (
        <div className="text-xs text-gray-600">
          Time to crack: {validation.crackTime}
        </div>
      )}
      
      {validation.errors.length > 0 && (
        <ul className="text-xs text-red-600 mt-1">
          {validation.errors.map((error, index) => (
            <li key={index}>• {error}</li>
          ))}
        </ul>
      )}
      
      {validation.warnings.length > 0 && (
        <ul className="text-xs text-yellow-600 mt-1">
          {validation.warnings.map((warning, index) => (
            <li key={index}>• {warning}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

## Files Requiring Changes

### Backend Implementation
- `server/utils/password-validation.ts` - New password validation utilities
- `server/services/password-history-service.ts` - Password history tracking
- `server/routes/auth-routes.ts` - Enhanced password endpoints
- `server/middleware/rate-limiting.ts` - Password-specific rate limits

### Database Changes
- Add password history table migration
- Update password change tracking

### Frontend Updates
- `client/src/components/auth/PasswordStrength.tsx` - New component
- Update password change forms with strength indicator
- Enhanced user feedback for password requirements

### Configuration
- `server/data/common-passwords.txt` - Common passwords list
- Environment variables for password policy configuration

## Testing Strategy

### Security Testing
```typescript
describe('Password Security', () => {
  it('should reject common passwords', () => {
    const validator = new PasswordValidator();
    const result = validator.validatePassword('password123');
    expect(result.isValid).toBe(false);
  });
  
  it('should require complexity', () => {
    const validator = new PasswordValidator();
    const result = validator.validatePassword('simple');
    expect(result.errors).toContainEqual(expect.stringContaining('uppercase'));
  });
  
  it('should prevent password reuse', async () => {
    const service = new PasswordHistoryService();
    const isReused = await service.checkPasswordReuse(1, 'previousPassword');
    expect(isReused).toBe(true);
  });
});
```

### Integration Testing
- [ ] Test complete password change workflow
- [ ] Verify rate limiting works correctly
- [ ] Test password strength UI feedback
- [ ] Validate all policy enforcement

## Performance Considerations

### Password Hashing
- Increased bcrypt rounds (12) will be slower but more secure
- Consider async hashing for better user experience
- Monitor server CPU usage during password operations

### Common Password Lookup
- Use efficient Set data structure for O(1) lookups
- Consider caching common passwords in memory
- Lazy load common passwords list on startup

## Risk Assessment

### High Risk - Weak Implementation
- Users still able to set weak passwords
- Password reuse not properly prevented
- Rate limiting bypassed

### Medium Risk - User Experience
- Complex requirements may frustrate users
- Password strength feedback may be confusing
- Performance impact from validation

### Low Risk - Maintenance
- Common password list needs regular updates
- Policy requirements may need adjustment

## Success Metrics
- [ ] Average password strength score increases
- [ ] Reduction in account compromise incidents
- [ ] User compliance with password policy
- [ ] No successful brute force attacks

## Dependencies
- `zxcvbn` - Password strength estimation
- `express-rate-limit` - Rate limiting middleware
- Common passwords dataset (SecLists or similar)

## Timeline Estimate
- **Password Validation Logic**: 6 hours
- **History Tracking System**: 4 hours
- **Rate Limiting Implementation**: 3 hours
- **Frontend Integration**: 5 hours
- **Testing and Validation**: 4 hours
- **Total**: 22 hours (3 development days)

---

**Related Issues:**
- User authentication security
- Account security hardening
- Login system improvements

**Labels:** security, passwords, authentication, user-experience, validation