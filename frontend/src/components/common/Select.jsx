import React from 'react';

const Select = React.forwardRef(({ 
  label, 
  error, 
  options = [], 
  className = '',
  required = false,
  placeholder = 'Select an option',
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={`input-field ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
        required={required}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;