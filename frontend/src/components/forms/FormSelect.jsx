import React from 'react';

const FormSelect = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options, 
  error, 
  required = false,
  placeholder = 'Select an option',
  disabled = false
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`input-field ${error ? 'border-red-500' : ''}`}
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
};

export default FormSelect;