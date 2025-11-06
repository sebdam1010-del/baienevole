const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'text-white hover:opacity-90 focus:ring-opacity-50',
    secondary: 'bg-white border-2 hover:bg-gray-50',
    success: 'text-white hover:opacity-90 focus:ring-opacity-50',
    danger: 'text-white hover:opacity-90 focus:ring-opacity-50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: 'var(--color-baie-navy)', color: 'white' };
      case 'secondary':
        return { borderColor: 'var(--color-baie-beige)', color: 'var(--color-baie-navy)' };
      case 'success':
        return { backgroundColor: 'var(--color-baie-green)', color: 'white' };
      case 'danger':
        return { backgroundColor: 'var(--color-baie-red)', color: 'white' };
      default:
        return {};
    }
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      style={getVariantStyles()}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
