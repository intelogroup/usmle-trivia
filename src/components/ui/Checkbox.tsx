import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked = false,
  onCheckedChange,
  disabled = false,
  className
}) => {
  const handleClick = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  return (
    <button
      id={id}
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-primary text-primary-foreground' : 'bg-background',
        'hover:bg-accent hover:text-accent-foreground',
        className
      )}
    >
      {checked && (
        <Check className="h-3 w-3 text-current" />
      )}
    </button>
  );
};