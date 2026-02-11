import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface ComboboxProps {
  label: string;
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export function Combobox({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select or type...',
  required = false,
  error,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update input value when external value changes
  useEffect(() => {
    const selectedOption = options.find(opt => opt.value === value);
    if (selectedOption) {
      setInputValue(selectedOption.label);
    } else if (value) {
      setInputValue(value);
    } else {
      setInputValue('');
    }
  }, [value, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search query
  const filteredOptions = options.filter(option => {
    const query = searchQuery.toLowerCase();
    return (
      option.label.toLowerCase().includes(query) ||
      option.value.toLowerCase().includes(query) ||
      (option.sublabel && option.sublabel.toLowerCase().includes(query))
    );
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSearchQuery(newValue);
    setIsOpen(true);
    
    // Check if the input matches any option
    const matchingOption = options.find(
      opt => opt.value.toLowerCase() === newValue.toLowerCase() ||
             opt.label.toLowerCase() === newValue.toLowerCase()
    );
    
    if (matchingOption) {
      onChange(matchingOption.value);
    } else {
      // Don't allow non-registered emails
      onChange('');
    }
  };

  const handleSelectOption = (option: ComboboxOption) => {
    setInputValue(option.label);
    onChange(option.value);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setSearchQuery(inputValue);
  };

  const handleInputBlur = () => {
    // Delay to allow option click to register
    setTimeout(() => {
      // Validate that the input value matches a registered email
      const matchingOption = options.find(
        opt => opt.value.toLowerCase() === inputValue.toLowerCase() ||
               opt.label.toLowerCase() === inputValue.toLowerCase()
      );
      
      if (!matchingOption && inputValue) {
        // If no match found, clear the invalid input
        setInputValue('');
        onChange('');
      }
    }, 200);
  };

  return (
    <div className="w-full mb-4" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          required={required}
          className={`
            block w-full rounded-md shadow-sm sm:text-sm pr-20
            border ${error ? 'border-red-300' : 'border-gray-300'}
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            p-2
          `}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                No registered users or admins found
              </div>
            ) : (
              <ul className="py-1">
                {filteredOptions.map((option) => (
                  <li
                    key={option.value}
                    onClick={() => handleSelectOption(option)}
                    className={`
                      px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors
                      ${value === option.value ? 'bg-blue-100' : ''}
                    `}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {option.label}
                    </div>
                    {option.sublabel && (
                      <div className="text-xs text-gray-500">
                        {option.sublabel}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {!error && (
        <p className="mt-1 text-xs text-gray-500">
          Only registered users and admins can receive emails
        </p>
      )}
    </div>
  );
}
