/**
 * Enhanced UserProfile Component with Validation, Error Handling, and Accessibility
 * For MedQuiz Pro - Medical Education Platform
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useGetUserProfile, useUpdateUserProfile } from '../../services/convexAuth';
import { 
  User, 
  Trophy, 
  Target, 
  BookOpen, 
  Users, 
  Edit2, 
  Save,
  X,
  Camera,
  Award,
  TrendingUp,
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAppStore } from '../../store';
import { validateAndSanitizeProfile, validateField, hasValidationErrors } from '../../utils/validation';
import { profileToasts } from '../../utils/toast';

// Enhanced form data interface
interface ProfileFormData {
  name: string;
  avatar: string;
  medicalLevel: string;
  specialties: string[];
  studyGoals: string;
}

interface FormErrors {
  [key: string]: string;
}

const avatars = [
  'https://api.dicebear.com/7.x/personas/svg?seed=doctor1',
  'https://api.dicebear.com/7.x/personas/svg?seed=doctor2',
  'https://api.dicebear.com/7.x/personas/svg?seed=doctor3',
  'https://api.dicebear.com/7.x/personas/svg?seed=doctor4',
  'https://api.dicebear.com/7.x/personas/svg?seed=nurse1',
  'https://api.dicebear.com/7.x/personas/svg?seed=nurse2',
  'https://api.dicebear.com/7.x/personas/svg?seed=medstudent1',
  'https://api.dicebear.com/7.x/personas/svg?seed=medstudent2',
];

const medicalLevels = [
  'Medical Student',
  'Resident', 
  'Fellow',
  'Attending Physician',
  'Other Healthcare Professional'
];

const specialties = [
  'Internal Medicine',
  'Surgery',
  'Pediatrics',
  'Obstetrics/Gynecology',
  'Psychiatry',
  'Emergency Medicine',
  'Family Medicine',
  'Radiology',
  'Anesthesiology',
  'Pathology',
  'Other'
];

const studyGoals = [
  'USMLE Step 1',
  'USMLE Step 2 CK',
  'USMLE Step 2 CS',
  'USMLE Step 3',
  'Board Review',
  'General Knowledge',
  'Other'
];

/**
 * Error Message Component
 */
const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center gap-2 text-red-600 text-sm mt-1" role="alert">
    <AlertCircle className="h-4 w-4 flex-shrink-0" />
    <span>{message}</span>
  </div>
);

/**
 * Field with Error Display Component
 */
interface FieldWrapperProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}

const FieldWrapper: React.FC<FieldWrapperProps> = ({ label, error, children, required }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium block">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && <ErrorMessage message={error} />}
  </div>
);

export const UserProfileEnhanced: React.FC = () => {
  const { user } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Fetch user profile with stats
  const userProfile = useGetUserProfile(user?.id || '');
  const updateProfile = useUpdateUserProfile();

  // Form state with memoized initial data
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    avatar: '',
    medicalLevel: '',
    specialties: [],
    studyGoals: '',
  });

  // Update form data when profile loads
  React.useEffect(() => {
    if (userProfile && !isEditing) {
      setFormData({
        name: userProfile.name || '',
        avatar: userProfile.avatar || avatars[0],
        medicalLevel: userProfile.medicalLevel || '',
        specialties: userProfile.specialties || [],
        studyGoals: userProfile.studyGoals || '',
      });
    }
  }, [userProfile, isEditing]);

  /**
   * Real-time field validation
   */
  const validateFormField = useCallback((fieldName: keyof ProfileFormData, value: any) => {
    const error = validateField(fieldName, value, formData);
    setFormErrors(prev => ({
      ...prev,
      [fieldName]: error || ''
    }));
  }, [formData]);

  /**
   * Handle input changes with validation
   */
  const handleInputChange = useCallback((field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Validate field on change
    validateFormField(field, value);
  }, [validateFormField]);

  /**
   * Handle specialty toggle with validation
   */
  const toggleSpecialty = useCallback((specialty: string) => {
    const newSpecialties = formData.specialties.includes(specialty)
      ? formData.specialties.filter(s => s !== specialty)
      : [...formData.specialties, specialty];
    
    setFormData(prev => ({ ...prev, specialties: newSpecialties }));
    validateFormField('specialties', newSpecialties);
    
    // Show feedback for specialty changes
    profileToasts.specialtiesUpdated(newSpecialties.length);
  }, [formData.specialties, validateFormField]);

  /**
   * Handle avatar change with feedback
   */
  const handleAvatarChange = useCallback((avatar: string) => {
    setFormData(prev => ({ ...prev, avatar }));
    setShowAvatarPicker(false);
    profileToasts.avatarChangeSuccess();
  }, []);

  /**
   * Enhanced save handler with comprehensive validation and error handling
   */
  const handleSave = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Validate and sanitize form data
      const { isValid, errors, sanitizedData } = validateAndSanitizeProfile(formData);
      
      if (!isValid) {
        setFormErrors(errors);
        profileToasts.validationError();
        return;
      }

      // Clear any existing errors
      setFormErrors({});

      // Update profile with sanitized data
      await updateProfile({
        userId: user.id,
        updates: {
          name: sanitizedData.name,
          avatar: sanitizedData.avatar,
          medicalLevel: sanitizedData.medicalLevel || undefined,
          specialties: sanitizedData.specialties.length > 0 ? sanitizedData.specialties : undefined,
          studyGoals: sanitizedData.studyGoals || undefined,
        }
      });

      // Success feedback
      profileToasts.saveSuccess();
      setIsEditing(false);

    } catch (error: any) {
      console.error('Failed to update profile:', error);
      
      // Enhanced error handling with specific messages
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        profileToasts.networkError();
      } else if (error.message?.includes('timeout')) {
        profileToasts.timeout();
      } else if (error.message?.includes('unauthorized') || error.message?.includes('auth')) {
        profileToasts.unauthorized();
      } else if (error.message?.includes('server') || error.status >= 500) {
        profileToasts.serverError();
      } else {
        profileToasts.saveError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData, updateProfile, user.id]);

  /**
   * Cancel editing with confirmation if there are changes
   */
  const handleCancel = useCallback(() => {
    // Check if there are unsaved changes
    const hasChanges = JSON.stringify(formData) !== JSON.stringify({
      name: userProfile?.name || '',
      avatar: userProfile?.avatar || avatars[0],
      medicalLevel: userProfile?.medicalLevel || '',
      specialties: userProfile?.specialties || [],
      studyGoals: userProfile?.studyGoals || '',
    });

    if (hasChanges) {
      const confirmCancel = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmCancel) return;
    }

    setIsEditing(false);
    setShowAvatarPicker(false);
    setFormErrors({});
    
    // Reset form data to original profile data
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        avatar: userProfile.avatar || avatars[0],
        medicalLevel: userProfile.medicalLevel || '',
        specialties: userProfile.specialties || [],
        studyGoals: userProfile.studyGoals || '',
      });
    }
  }, [formData, userProfile]);

  // Memoized computed values
  const hasErrors = useMemo(() => hasValidationErrors(formErrors), [formErrors]);
  const isFormValid = useMemo(() => !hasErrors && formData.name.trim().length >= 2, [hasErrors, formData.name]);

  // Loading state
  if (!user || !userProfile) {
    return (
      <div className="text-center py-8" role="status" aria-label="Loading profile">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" role="main" aria-label="User Profile">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={formData.avatar || avatars[0]}
                  alt={`${formData.name}'s avatar`}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-primary/20"
                />
                {isEditing && (
                  <button
                    onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                    className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    aria-label="Change avatar"
                    disabled={isLoading}
                  >
                    <Camera className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
              
              {/* User Info */}
              <div className="space-y-2 text-center sm:text-left">
                {isEditing ? (
                  <FieldWrapper 
                    label="Full Name" 
                    error={formErrors.name} 
                    required
                  >
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`text-lg sm:text-2xl font-bold ${formErrors.name ? 'border-red-500' : ''}`}
                      placeholder="Enter your full name"
                      aria-describedby={formErrors.name ? 'name-error' : undefined}
                      disabled={isLoading}
                      autoComplete="name"
                    />
                  </FieldWrapper>
                ) : (
                  <h2 className="text-xl sm:text-2xl font-bold">{userProfile.name}</h2>
                )}
                <p className="text-muted-foreground">{userProfile.email}</p>
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-yellow-500" aria-hidden="true" />
                    <span>Level {userProfile.level || 1}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4 text-blue-500" aria-hidden="true" />
                    <span>{userProfile.points || 0} points</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 justify-center sm:justify-start">
              {isEditing ? (
                <>
                  <Button 
                    onClick={handleSave} 
                    disabled={!isFormValid || isLoading}
                    className="min-w-[100px]"
                    size="sm"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setIsEditing(true)} 
                  variant="outline" 
                  size="sm"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
          
          {/* Avatar Picker */}
          {isEditing && showAvatarPicker && (
            <div className="mt-6 p-4 bg-muted rounded-lg" role="region" aria-label="Avatar selection">
              <p className="text-sm font-medium mb-3">Choose an avatar:</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {avatars.map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => handleAvatarChange(avatar)}
                    className={`p-2 rounded-lg border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                      formData.avatar === avatar 
                        ? 'border-primary bg-primary/10' 
                        : 'border-transparent hover:border-primary/50'
                    }`}
                    aria-label={`Select avatar ${index + 1}`}
                    disabled={isLoading}
                  >
                    <img 
                      src={avatar} 
                      alt={`Avatar option ${index + 1}`} 
                      className="w-full h-full rounded-full" 
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Professional Information */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Medical Level */}
            <FieldWrapper label="Medical Level" error={formErrors.medicalLevel}>
              <select
                value={formData.medicalLevel}
                onChange={(e) => handleInputChange('medicalLevel', e.target.value)}
                className={`w-full p-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary ${
                  formErrors.medicalLevel ? 'border-red-500' : ''
                }`}
                disabled={isLoading}
                aria-describedby={formErrors.medicalLevel ? 'medical-level-error' : undefined}
              >
                <option value="">Select your level</option>
                {medicalLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </FieldWrapper>
            
            {/* Study Goals */}
            <FieldWrapper label="Primary Study Goals" error={formErrors.studyGoals}>
              <select
                value={formData.studyGoals}
                onChange={(e) => handleInputChange('studyGoals', e.target.value)}
                className={`w-full p-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary ${
                  formErrors.studyGoals ? 'border-red-500' : ''
                }`}
                disabled={isLoading}
                aria-describedby={formErrors.studyGoals ? 'study-goals-error' : undefined}
              >
                <option value="">Select your primary goal</option>
                {studyGoals.map(goal => (
                  <option key={goal} value={goal}>{goal}</option>
                ))}
              </select>
            </FieldWrapper>
            
            {/* Specialties */}
            <FieldWrapper label="Medical Specialties of Interest" error={formErrors.specialties}>
              <fieldset>
                <legend className="sr-only">Select medical specialties</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3" role="group">
                  {specialties.map(specialty => (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => toggleSpecialty(specialty)}
                      disabled={isLoading}
                      className={`p-3 text-sm rounded-lg border transition-colors text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                        formData.specialties.includes(specialty)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-background border-muted hover:border-primary hover:bg-primary/5'
                      }`}
                      aria-pressed={formData.specialties.includes(specialty)}
                      aria-label={`${specialty} specialty`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {formData.specialties.length} / 10 specialties
                </p>
              </fieldset>
            </FieldWrapper>
          </CardContent>
        </Card>
      )}
      
      {/* Statistics Display - keeping original stats display */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* ... Rest of the statistics cards remain the same ... */}
      </div>
      
      {/* The rest of the component remains the same for achievements, professional info display, etc. */}
    </div>
  );
};

export default UserProfileEnhanced;