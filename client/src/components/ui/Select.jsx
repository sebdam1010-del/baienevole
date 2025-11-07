const Select = ({
  label,
  error,
  helperText,
  id,
  name,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  placeholder = 'Sélectionner...',
  className = '',
  children,
  ...props
}) => {
  const selectId = id || name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium mb-1"
          style={{ color: 'var(--color-baie-navy)' }}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'focus:ring-opacity-50'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        style={!error ? { borderColor: 'var(--color-baie-beige)', '--tw-ring-color': 'var(--color-baie-navy)' } : {}}
        {...props}
      >
        {/* Support both children and options prop */}
        {children ? children : (
          <>
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </>
        )}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Select;
