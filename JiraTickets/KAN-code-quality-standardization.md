# KAN - Code Quality Standardization and Tooling

**Issue Type:** Story  
**Project:** KAN (Development tasks)  
**Priority:** Medium  
**Reporter:** Claude Code  
**Date Created:** 2025-01-27  

## Summary
Implement code quality standards, linting, formatting, and development tooling for consistent codebase maintenance

## Description
The codebase lacks standardized code quality tooling including ESLint configuration, Prettier formatting, pre-commit hooks, and development guidelines. This leads to inconsistent code style, potential bugs, and reduced maintainability. We need to implement comprehensive code quality standards and automation.

## Current Code Quality Issues
- **No ESLint Configuration:** Missing TypeScript and React linting rules
- **No Prettier Setup:** Inconsistent code formatting across files
- **No Pre-commit Hooks:** Quality checks not enforced before commits
- **Missing Guidelines:** No contributing guidelines or code standards documentation
- **No IDE Configuration:** Missing shared IDE settings for team consistency

## Expected Outcome
- Consistent code style and formatting across entire codebase
- Automated code quality checks in development and CI/CD
- Reduced bugs through static analysis
- Improved developer experience with better tooling
- Clear code standards and contributing guidelines

## Acceptance Criteria
1. **Linting Configuration**
   - ESLint setup with TypeScript and React rules
   - Workshop-specific linting rules (AST/IA separation validation)
   - Custom rules for console logging restrictions
   - Integration with VSCode and other IDEs

2. **Code Formatting**
   - Prettier configuration with consistent formatting rules
   - Automatic formatting on save in IDEs
   - Pre-commit formatting enforcement
   - Integration with existing codebase without massive diffs

3. **Pre-commit Hooks**
   - Husky setup for git hooks
   - lint-staged for efficient pre-commit checks
   - TypeScript compilation check
   - Test execution for changed files

4. **Development Guidelines**
   - Contributing guidelines documentation
   - Code review checklist
   - Workshop separation coding standards
   - Component architecture guidelines

## Technical Implementation
- **ESLint:** @typescript-eslint with React and accessibility rules
- **Prettier:** Opinionated formatting with team-agreed overrides
- **Husky:** Git hooks for quality enforcement
- **lint-staged:** Efficient pre-commit processing

## ESLint Configuration
```javascript
// Proposed ESLint rules
const eslintConfig = {
  extends: [
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended'
  ],
  rules: {
    // Workshop separation rules
    'no-cross-workshop-imports': 'error',
    'prefer-workshop-specific-types': 'warn',
    
    // Performance rules
    'no-console': 'warn',
    'prefer-const': 'error',
    
    // Security rules
    'react/no-danger': 'error',
    'security/detect-object-injection': 'error'
  }
};
```

## Prettier Configuration
```javascript
// Consistent formatting rules
const prettierConfig = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false
};
```

## Workshop-Specific Rules
- **Import Restrictions:** AST components cannot import IA components
- **Naming Conventions:** Clear prefixes for workshop-specific files
- **Type Safety:** Strict typing for workshop data structures
- **Performance:** Rules against expensive operations in render loops

## Code Quality Metrics
```typescript
// Target quality metrics
const qualityTargets = {
  lintErrors: 0,           // Zero lint errors in CI
  typeErrors: 0,           // Zero TypeScript errors
  testCoverage: 70,        // Minimum test coverage percentage
  complexity: 10,          // Maximum cyclomatic complexity
  duplicateCode: 5         // Maximum duplicate code percentage
};
```

## Files Requiring Quality Updates
- All TypeScript/TSX files (gradual enforcement)
- Priority files with high complexity:
  - `client/src/hooks/use-navigation-progress.ts`
  - `server/routes/workshop-data-routes.ts`
  - `client/src/components/assessment/AssessmentModal.tsx`
  - `server/services/user-management-service.ts`

## Development Workflow Integration
1. **IDE Setup**
   - VSCode settings and extensions recommendations
   - Shared TypeScript configuration
   - Debugging configuration for both workshops

2. **Git Workflow**
   - Pre-commit: Format, lint, type check
   - Pre-push: Run tests for changed files
   - Commit message linting (conventional commits)

3. **CI/CD Integration**
   - Lint check as required CI step
   - Format check (no auto-formatting in CI)
   - Code quality reporting and trends

## Custom Linting Rules
```typescript
// Workshop separation validation
const workshopSeparationRule = {
  'no-cross-workshop-imports': {
    create(context) {
      return {
        ImportDeclaration(node) {
          // Prevent AST components from importing IA components
          // and vice versa
        }
      };
    }
  }
};
```

## Documentation Requirements
1. **CONTRIBUTING.md**
   - Code style guidelines
   - Pull request process
   - Workshop separation requirements
   - Testing requirements

2. **CODE_STANDARDS.md**
   - TypeScript best practices
   - React component patterns
   - Error handling standards
   - Performance guidelines

3. **IDE_SETUP.md**
   - Recommended extensions
   - Settings configuration
   - Debugging setup
   - Workflow tips

## Migration Strategy
1. **Phase 1:** Setup tooling without enforcement
2. **Phase 2:** Apply formatting to entire codebase
3. **Phase 3:** Enable linting with warnings
4. **Phase 4:** Enforce pre-commit hooks
5. **Phase 5:** Upgrade warnings to errors

## Environment Setup
- **Development:** Full linting and formatting with auto-fix
- **CI/CD:** Strict checking without auto-fix
- **Pre-commit:** Fast, focused checks on changed files only

## Quality Gates
```javascript
// Quality gates for CI/CD
const qualityGates = {
  linting: 'no-errors',           // Block on lint errors
  formatting: 'strict',          // Block on formatting issues  
  typeCheck: 'strict',           // Block on TypeScript errors
  complexity: 'warn-only',       // Report but don't block
  testCoverage: 'enforce-70%'     // Block if coverage drops below 70%
};
```

## Labels
- `code-quality`
- `linting`
- `formatting`
- `developer-experience`
- `standards`

## Components
- Development Tooling
- CI/CD Pipeline
- Documentation
- IDE Integration
- Git Workflow