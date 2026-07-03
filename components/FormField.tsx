'use client';

import { UseFormRegister } from 'react-hook-form';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  register?: UseFormRegister<any>;
  value?: string | string[];
  onArrayChange?: (index: number, value: string) => void;
  onAddArrayItem?: () => void;
  onRemoveArrayItem?: (index: number) => void;
  required?: boolean;
  rows?: number;
  error?: string;
}

const FormField = ({
  label,
  name,
  type = 'text',
  placeholder,
  register,
  value,
  onArrayChange,
  onAddArrayItem,
  onRemoveArrayItem,
  required = true,
  rows = 4,
  error,
}: FormFieldProps) => {
  const isTextarea = type === 'textarea';
  const isSelect = type === 'select';
  const isArray = type === 'array';

  if (isArray && value && Array.isArray(value)) {
    return (
      <div className="form-field">
        <label>
          {label}
          {required && <span className="required">*</span>}
        </label>

        <div className="array-field">
          {value.map((item, index) => (
            <div key={index} className="array-item">
              <input
                type="text"
                placeholder={`${placeholder} ${index + 1}`}
                value={item}
                onChange={(e) => onArrayChange?.(index, e.target.value)}
                required={required}
              />
              {value.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveArrayItem?.(index)}
                  className="remove-btn"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={onAddArrayItem}
            className="add-btn"
          >
            Add {label}
          </button>
        </div>

        {error && <span className="error">{error}</span>}
      </div>
    );
  }

  return (
    <div className="form-field">
      <label htmlFor={name}>
        {label}
        {required && <span className="required">*</span>}
      </label>

      {!isTextarea && !isSelect && (
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          {...(register ? register(name, { required }) : {})}
        />
      )}

      {isTextarea && (
        <textarea
          id={name}
          placeholder={placeholder}
          rows={rows}
          {...(register ? register(name, { required }) : {})}
        />
      )}

      {isSelect && (
        <select
          id={name}
          {...(register ? register(name, { required }) : {})}
        >
          <option value="">Select {label}</option>
          <option value="Online">Online</option>
          <option value="Offline">Offline</option>
          <option value="Hybrid">Hybrid</option>
        </select>
      )}

      {error && <span className="error">{error}</span>}
    </div>
  );
};

export default FormField;