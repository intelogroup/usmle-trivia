import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SelectProps {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

const SelectContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  value: '',
  onValueChange: () => {},
  open: false,
  setOpen: () => {}
});

export const Select: React.FC<SelectProps> = ({
  children,
  defaultValue = '',
  value: controlledValue,
  onValueChange,
  disabled = false
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;
  
  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = () => setOpen(false);
    if (open) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [open]);

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className }) => {
  const { open, setOpen } = React.useContext(SelectContext);
  
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setOpen(!open);
      }}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2',
        'text-sm ring-offset-background placeholder:text-muted-foreground',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder, className }) => {
  const { value } = React.useContext(SelectContext);
  
  return (
    <span className={className}>
      {value || placeholder}
    </span>
  );
};

export const SelectContent: React.FC<SelectContentProps> = ({ children, className }) => {
  const { open } = React.useContext(SelectContext);
  
  if (!open) return null;
  
  return (
    <div className={cn(
      'absolute top-full left-0 z-50 w-full mt-1',
      'bg-popover text-popover-foreground',
      'rounded-md border shadow-md',
      'max-h-60 overflow-auto',
      className
    )}>
      {children}
    </div>
  );
};

export const SelectItem: React.FC<SelectItemProps> = ({ children, value, className }) => {
  const { value: selectedValue, onValueChange } = React.useContext(SelectContext);
  const isSelected = selectedValue === value;
  
  return (
    <button
      type="button"
      onClick={() => onValueChange(value)}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm',
        'outline-none focus:bg-accent focus:text-accent-foreground',
        isSelected && 'bg-accent text-accent-foreground',
        className
      )}
    >
      {children}
    </button>
  );
};