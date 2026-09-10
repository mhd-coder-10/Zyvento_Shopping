import React from 'react';

const Checkbox = ({
  label,
  name,
  checked,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={name}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={`
              w-4 h-4 border rounded
              focus:outline-none focus:ring-2 focus:ring-indigo-500
              ${error ? 'border-red-500' : 'border-gray-300'}
              ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
              text-indigo-600
            `}
            {...props}
          />
        </div>
        {label && (
          <label
            htmlFor={name}
            className={`ml-2 text-sm text-gray-700 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Checkbox;