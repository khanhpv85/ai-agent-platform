import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select options',
  disabled = false,
  required = false,
  error,
  helperText,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleOption = (optionValue: string) => {
    if (disabled) return;
    
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    
    onChange(newValue);
  };

  const handleRemoveOption = (optionValue: string) => {
    if (disabled) return;
    onChange(value.filter(v => v !== optionValue));
  };

  const selectedOptions = options.filter(option => value.includes(option.value));

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div
          className={`
            block w-full rounded-md border shadow-sm
            focus:border-primary-500 focus:ring-primary-500 sm:text-sm
            ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900 cursor-pointer'}
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}
          `}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="p-2 min-h-[38px] flex flex-wrap gap-1">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {option.label}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveOption(option.value);
                      }}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
        
        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <div
                key={option.value}
                className={`
                  px-3 py-2 cursor-pointer hover:bg-gray-100
                  ${value.includes(option.value) ? 'bg-primary-50 text-primary-900' : 'text-gray-900'}
                  ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => !option.disabled && handleToggleOption(option.value)}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={value.includes(option.value)}
                    readOnly
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  {option.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default MultiSelect;
