import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ 
  password, 
  showRequirements = true 
}) => {
  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
    { label: 'One special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const strength = requirements.filter(req => req.met).length;
  
  const getStrengthLabel = () => {
    if (strength === 0) return '';
    if (strength <= 2) return 'Weak';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (strength === 0) return 'bg-gray-200';
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Password strength</span>
          <span className={`font-medium ${
            strength <= 2 ? 'text-red-600' : 
            strength <= 4 ? 'text-yellow-600' : 
            'text-green-600'
          }`}>
            {getStrengthLabel()}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements list */}
      {showRequirements && (
        <div className="space-y-1">
          {requirements.map((req, index) => (
            <div 
              key={index} 
              className={`flex items-center gap-2 text-xs transition-all duration-200 ${
                req.met ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              {req.met ? (
                <Check className="w-3 h-3" />
              ) : (
                <X className="w-3 h-3" />
              )}
              <span>{req.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};