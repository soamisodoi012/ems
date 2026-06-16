import React from 'react';

const FormInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  type = 'text',
  required = false,
  placeholder = '',
  disabled = false
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`input-field ${error ? 'border-red-500' : ''}`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FormInput;