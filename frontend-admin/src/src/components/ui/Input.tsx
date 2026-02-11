import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  showPasswordToggle?: boolean;
}
export function Input({
  label,
  error,
  fullWidth = true,
  className = '',
  id,
  showPasswordToggle = false,
  type = 'text',
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || props.name || Math.random().toString(36).substr(2, 9);
  const isPasswordField = type === 'password';
  const inputType = isPasswordField && showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  return <div className={`${fullWidth ? 'w-full' : ''} mb-4`}>
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>}
      <div className="relative">
        <input 
          id={inputId} 
          type={inputType}
          className={`
            block w-full rounded-md border-gray-300 shadow-sm 
            focus:border-blue-500 focus:ring-blue-500 sm:text-sm
            disabled:bg-gray-100 disabled:text-gray-500
            border p-2
            ${isPasswordField && showPasswordToggle ? 'pr-10' : ''}
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `} 
          {...props} 
        />
        {isPasswordField && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>;
}