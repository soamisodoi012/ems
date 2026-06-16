import React from 'react';

const FormTextarea = ({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  required = false,
  placeholder = '',
  rows = 4,
  disabled = false
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`input-field ${error ? 'border-red-500' : ''}`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FormTextarea;