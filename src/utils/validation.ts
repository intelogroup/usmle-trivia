/**
 * Form Validation Utilities
 * Provides comprehensive validation for profile forms
 * For MedQuiz Pro - Medical Education Platform
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ProfileFormData {
  name: string;
  email?: string;
  medicalLevel?: string;
  specialties: string[];
  studyGoals?: string;
  avatar?: string;
}

/**
 * Email validation regex - RFC 5322 compliant
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Name validation - allows letters, spaces, hyphens, apostrophes
 */
const NAME_REGEX = /^[a-zA-Z\s\-']+$/;

/**
 * Validate profile form data
 */
export const validateProfileForm = (data: ProfileFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  // Name validation
  if (!data.name?.trim()) {
    errors.name = 'Name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Name must be less than 100 characters';
  } else if (!NAME_REGEX.test(data.name.trim())) {
    errors.name = 'Name can only contain letters, spaces, hyphens, and apostrophes';
  }

  // Email validation (if provided)
  if (data.email && data.email.trim()) {
    if (!EMAIL_REGEX.test(data.email.trim())) {
      errors.email = 'Please enter a valid email address';
    } else if (data.email.length > 254) {
      errors.email = 'Email address is too long';
    }
  }

  // Medical level validation (if provided)
  if (data.medicalLevel && data.medicalLevel.length > 100) {
    errors.medicalLevel = 'Medical level description is too long';
  }

  // Study goals validation (if provided)
  if (data.studyGoals && data.studyGoals.length > 200) {
    errors.studyGoals = 'Study goals description is too long';
  }

  // Specialties validation
  if (data.specialties && data.specialties.length > 10) {
    errors.specialties = 'Please select no more than 10 specialties';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Real-time field validation
 */
export const validateField = (fieldName: keyof ProfileFormData, value: any, allData?: ProfileFormData): string | null => {
  switch (fieldName) {
    case 'name':
      if (!value?.trim()) return 'Name is required';
      if (value.trim().length < 2) return 'Name must be at least 2 characters long';
      if (value.trim().length > 100) return 'Name must be less than 100 characters';
      if (!NAME_REGEX.test(value.trim())) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
      break;

    case 'email':
      if (value && value.trim()) {
        if (!EMAIL_REGEX.test(value.trim())) return 'Please enter a valid email address';
        if (value.length > 254) return 'Email address is too long';
      }
      break;

    case 'medicalLevel':
      if (value && value.length > 100) return 'Medical level description is too long';
      break;

    case 'studyGoals':
      if (value && value.length > 200) return 'Study goals description is too long';
      break;

    case 'specialties':
      if (value && Array.isArray(value) && value.length > 10) {
        return 'Please select no more than 10 specialties';
      }
      break;
  }

  return null;
};

/**
 * Sanitize string input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Escape special characters
    .replace(/[<>&"']/g, (match) => {
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#x27;'
      };
      return escapeMap[match] || match;
    })
    // Remove potentially dangerous characters
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, '');
};

/**
 * Validate and sanitize profile data
 */
export const validateAndSanitizeProfile = (data: ProfileFormData): { isValid: boolean; errors: Record<string, string>; sanitizedData: ProfileFormData } => {
  // First sanitize the data
  const sanitizedData: ProfileFormData = {
    name: sanitizeInput(data.name || ''),
    email: data.email ? sanitizeInput(data.email) : undefined,
    medicalLevel: data.medicalLevel ? sanitizeInput(data.medicalLevel) : undefined,
    studyGoals: data.studyGoals ? sanitizeInput(data.studyGoals) : undefined,
    specialties: data.specialties || [],
    avatar: data.avatar
  };

  // Then validate the sanitized data
  const validation = validateProfileForm(sanitizedData);

  return {
    isValid: validation.isValid,
    errors: validation.errors,
    sanitizedData
  };
};

/**
 * Format error message for display
 */
export const formatErrorMessage = (error: string): string => {
  return error.charAt(0).toUpperCase() + error.slice(1);
};

/**
 * Check if form has any validation errors
 */
export const hasValidationErrors = (errors: Record<string, string>): boolean => {
  return Object.keys(errors).some(key => errors[key] && errors[key].trim() !== '');
};