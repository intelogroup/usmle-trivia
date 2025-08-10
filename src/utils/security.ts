/**
 * Security Utilities for XSS Prevention and Input Sanitization
 * For MedQuiz Pro - Medical Education Platform
 */

/**
 * HTML entity encoding map
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

/**
 * Escape HTML entities to prevent XSS
 */
export const escapeHtml = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input.replace(/[&<>"'`=/]/g, (match) => HTML_ENTITIES[match] || match);
};

/**
 * Remove HTML tags from input
 */
export const stripHtmlTags = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[a-zA-Z0-9#]+;/g, ''); // Remove HTML entities
};

/**
 * Comprehensive input sanitization for user profile data
 */
export const sanitizeProfileInput = (input: string, options: {
  maxLength?: number;
  allowedChars?: RegExp;
  preserveSpaces?: boolean;
  preserveBasicFormatting?: boolean;
} = {}): string => {
  if (!input || typeof input !== 'string') return '';
  
  const {
    maxLength = 1000,
    allowedChars,
    preserveSpaces = true,
    preserveBasicFormatting = false
  } = options;
  
  let sanitized = input;
  
  // 1. Trim whitespace
  sanitized = sanitized.trim();
  
  // 2. Remove or escape HTML
  if (preserveBasicFormatting) {
    // Allow basic formatting but escape dangerous tags
    sanitized = sanitized.replace(/<(?!\/?(b|i|em|strong|br)\b)[^>]*>/gi, '');
  } else {
    sanitized = stripHtmlTags(sanitized);
  }
  
  // 3. Escape remaining HTML entities
  sanitized = escapeHtml(sanitized);
  
  // 4. Remove control characters and potentially dangerous Unicode
  sanitized = sanitized.replace(/[\u0000-\u001f\u007f-\u009f]/g, '');
  
  // 5. Apply character restrictions
  if (allowedChars) {
    sanitized = sanitized.replace(new RegExp(`[^${allowedChars.source}]`, 'g'), '');
  }
  
  // 6. Normalize spaces
  if (preserveSpaces) {
    sanitized = sanitized.replace(/\s+/g, ' '); // Normalize multiple spaces
  } else {
    sanitized = sanitized.replace(/\s/g, ''); // Remove all spaces
  }
  
  // 7. Truncate to maximum length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};

/**
 * Sanitize user name with specific rules for names
 */
export const sanitizeUserName = (name: string): string => {
  return sanitizeProfileInput(name, {
    maxLength: 100,
    allowedChars: /a-zA-Z\s\-'\./, // Letters, spaces, hyphens, apostrophes, dots
    preserveSpaces: true
  });
};

/**
 * Sanitize email address
 */
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[^\w@.-]/g, '') // Only allow word chars, @, dots, and hyphens
    .substring(0, 254); // RFC 5321 limit
};

/**
 * Sanitize medical specialty or study goal
 */
export const sanitizeMedicalField = (field: string): string => {
  return sanitizeProfileInput(field, {
    maxLength: 200,
    allowedChars: /a-zA-Z0-9\s\-'\.\/\(\)/, // Allow medical terminology characters
    preserveSpaces: true
  });
};

/**
 * Validate and sanitize URL (for avatars, etc.)
 */
export const sanitizeUrl = (url: string, allowedDomains?: string[]): string => {
  if (!url || typeof url !== 'string') return '';
  
  try {
    const parsedUrl = new URL(url);
    
    // Only allow HTTPS
    if (parsedUrl.protocol !== 'https:') {
      throw new Error('Only HTTPS URLs are allowed');
    }
    
    // Check allowed domains if specified
    if (allowedDomains && allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some(domain => 
        parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
      );
      
      if (!isAllowed) {
        throw new Error('Domain not allowed');
      }
    }
    
    return parsedUrl.toString();
  } catch (error) {
    console.warn('Invalid URL provided:', url, error);
    return '';
  }
};

/**
 * Content Security Policy (CSP) nonce generator
 */
export const generateCSPNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
};

/**
 * Validate file upload security
 */
export const validateFileUpload = (file: File, options: {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
} = {}): { isValid: boolean; error?: string } => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  } = options;
  
  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
    };
  }
  
  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed`
    };
  }
  
  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `File extension ${extension} is not allowed`
    };
  }
  
  // Additional security checks could be added here:
  // - Check file headers/magic numbers
  // - Virus scanning integration
  // - Image metadata stripping
  
  return { isValid: true };
};

/**
 * Secure localStorage wrapper with encryption (basic)
 */
export class SecureStorage {
  private static encrypt(data: string): string {
    // In a production environment, use proper encryption
    // This is a basic obfuscation for demonstration
    return btoa(data);
  }
  
  private static decrypt(data: string): string {
    try {
      return atob(data);
    } catch (error) {
      console.warn('Failed to decrypt storage data:', error);
      return '';
    }
  }
  
  static setItem(key: string, value: any): void {
    try {
      const serialized = JSON.stringify(value);
      const encrypted = this.encrypt(serialized);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.warn('Failed to store item securely:', error);
    }
  }
  
  static getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return defaultValue || null;
      
      const decrypted = this.decrypt(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.warn('Failed to retrieve item securely:', error);
      return defaultValue || null;
    }
  }
  
  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }
  
  static clear(): void {
    localStorage.clear();
  }
}

/**
 * Rate limiting utility for preventing abuse
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    
    // Update attempts array
    this.attempts.set(key, recentAttempts);
    
    return recentAttempts.length < this.maxAttempts;
  }
  
  recordAttempt(key: string): void {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    attempts.push(now);
    this.attempts.set(key, attempts);
  }
  
  getRemainingAttempts(key: string): number {
    const attempts = this.attempts.get(key) || [];
    const now = Date.now();
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxAttempts - recentAttempts.length);
  }
  
  getTimeUntilReset(key: string): number {
    const attempts = this.attempts.get(key) || [];
    if (attempts.length === 0) return 0;
    
    const oldestRecentAttempt = Math.min(...attempts);
    const resetTime = oldestRecentAttempt + this.windowMs;
    return Math.max(0, resetTime - Date.now());
  }
}

// Global rate limiter for profile operations
export const profileRateLimiter = new RateLimiter(10, 60 * 1000); // 10 attempts per minute

/**
 * Security headers validation for responses
 */
export const validateSecurityHeaders = (response: Response): boolean => {
  const requiredHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection'
  ];
  
  const missingHeaders = requiredHeaders.filter(header => !response.headers.has(header));
  
  if (missingHeaders.length > 0) {
    console.warn('Missing security headers:', missingHeaders);
    return false;
  }
  
  return true;
};

/**
 * Profile-specific security utilities
 */
export const profileSecurity = {
  /**
   * Sanitize complete profile data
   */
  sanitizeProfileData: (data: any) => ({
    name: data.name ? sanitizeUserName(data.name) : '',
    email: data.email ? sanitizeEmail(data.email) : undefined,
    medicalLevel: data.medicalLevel ? sanitizeMedicalField(data.medicalLevel) : undefined,
    studyGoals: data.studyGoals ? sanitizeMedicalField(data.studyGoals) : undefined,
    specialties: Array.isArray(data.specialties) 
      ? data.specialties.map((s: string) => sanitizeMedicalField(s)).filter(Boolean)
      : [],
    avatar: data.avatar ? sanitizeUrl(data.avatar, ['api.dicebear.com']) : undefined
  }),
  
  /**
   * Validate profile data for security
   */
  validateProfileSecurity: (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Check for suspicious patterns
    if (data.name && /<script|javascript:|data:/i.test(data.name)) {
      errors.push('Name contains potentially malicious content');
    }
    
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Email format is invalid');
    }
    
    // Check for excessive length (potential DoS)
    const maxLengths = {
      name: 100,
      email: 254,
      medicalLevel: 200,
      studyGoals: 200
    };
    
    Object.entries(maxLengths).forEach(([field, maxLength]) => {
      if (data[field] && data[field].length > maxLength) {
        errors.push(`${field} exceeds maximum length of ${maxLength} characters`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};