// Validation utilities for workshop inputs
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates text input with minimum character requirement
 */
export function validateTextInput(value: string, fieldName: string, minLength: number = 10): ValidationError | null {
  if (!value || value.trim().length < minLength) {
    return {
      field: fieldName,
      message: "This field is required"
    };
  }
  return null;
}

/**
 * Validates multiple text fields at once
 */
export function validateTextFields(fields: Record<string, string>, minLength: number = 10): ValidationResult {
  const errors: ValidationError[] = [];
  
  Object.entries(fields).forEach(([fieldName, value]) => {
    const error = validateTextInput(value, fieldName, minLength);
    if (error) {
      errors.push(error);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates that at least one field has content (for optional multi-field forms)
 */
export function validateAtLeastOneField(fields: Record<string, string>, minLength: number = 10): ValidationResult {
  const hasContent = Object.values(fields).some(value => 
    value && value.trim().length >= minLength
  );
  
  if (!hasContent) {
    return {
      isValid: false,
      errors: [{
        field: 'general',
        message: 'Please complete at least one field to continue'
      }]
    };
  }
  
  return {
    isValid: true,
    errors: []
  };
}

/**
 * Checks if a required field is completed
 */
export function isFieldCompleted(value: string, minLength: number = 10): boolean {
  return value && value.trim().length >= minLength;
}

/**
 * Gets validation state for styling (success, error, or default)
 */
export function getValidationState(value: string, hasError: boolean, minLength: number = 10): 'success' | 'error' | 'default' {
  if (hasError) return 'error';
  if (isFieldCompleted(value, minLength)) return 'success';
  return 'default';
}