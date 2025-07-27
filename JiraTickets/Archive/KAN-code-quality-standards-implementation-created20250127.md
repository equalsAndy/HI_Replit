# KAN - Code Quality Standards Implementation

**Issue Type:** Task  
**Project:** KAN  
**Priority:** High  
**Reporter:** Claude Code  
**Date Created:** 2025-01-27

## Summary
Implement code quality tools and standards to maintain consistent code style and catch issues early in development.

## Description
The codebase lacks automated code quality enforcement tools, making it difficult to maintain consistent standards across the dual-workshop platform.

**Current State:**
- No ESLint configuration for TypeScript/React
- No Prettier formatting enforcement
- No pre-commit hooks
- Inconsistent code styling across files
- No automated code quality checks

**Business Impact:**
- Inconsistent code quality
- Harder code reviews
- Potential bugs from style inconsistencies
- Reduced developer productivity

## Acceptance Criteria

### Phase 1: Linting Setup
- [ ] Install and configure ESLint for TypeScript and React
- [ ] Configure TypeScript-specific ESLint rules
- [ ] Add React-specific linting rules (@typescript-eslint/recommended)
- [ ] Configure workshop-specific linting rules (AST/IA separation)
- [ ] Add accessibility linting rules (eslint-plugin-jsx-a11y)

### Phase 2: Code Formatting
- [ ] Install and configure Prettier
- [ ] Set up Prettier integration with ESLint
- [ ] Define formatting rules (tabs vs spaces, line length, etc.)
- [ ] Add format scripts to package.json
- [ ] Format existing codebase

### Phase 3: Pre-commit Hooks
- [ ] Install Husky for Git hooks
- [ ] Set up lint-staged for pre-commit linting
- [ ] Configure pre-commit hook to run ESLint
- [ ] Configure pre-commit hook to run Prettier
- [ ] Add pre-commit hook to run type checking

### Phase 4: CI/CD Integration
- [ ] Add linting to CI/CD pipeline
- [ ] Add type checking to CI/CD pipeline
- [ ] Fail builds on linting errors
- [ ] Add code quality reporting

## Technical Configuration

### ESLint Configuration (.eslintrc.js):
```javascript
module.exports = {
  extends: [
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended'
  ],
  rules: {
    // Workshop separation enforcement
    'no-cross-workshop-imports': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    'react/prop-types': 'off', // Using TypeScript
    'no-console': 'warn' // Align with logging cleanup
  }
};
```

### Prettier Configuration (.prettierrc):
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### Package.json Scripts:
```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "type-check": "tsc --noEmit"
  }
}
```

## Custom Rules Needed

### Workshop Separation Rule:
```javascript
// Custom ESLint rule to prevent cross-workshop imports
'no-cross-workshop-imports': {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent imports between AST and IA workshops'
    }
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        // Check for cross-workshop imports
        // AST components shouldn't import IA components and vice versa
      }
    };
  }
}
```

## Files to Focus On:
- All TypeScript files in `client/src/`
- All TypeScript files in `server/`
- All React components in `client/src/components/`
- Workshop-specific components for separation validation

## Performance Targets
- Linting entire codebase in under 10 seconds
- Pre-commit hooks complete in under 5 seconds
- Zero linting errors in CI/CD pipeline

## Dependencies
- ESLint + TypeScript plugins
- Prettier + ESLint integration
- Husky for Git hooks
- lint-staged for selective linting

## Migration Strategy
1. Install tools without breaking existing workflow
2. Fix critical linting errors in batches
3. Enable pre-commit hooks after major issues resolved
4. Gradually increase rule strictness