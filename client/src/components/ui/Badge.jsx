const Badge = ({
  children,
  variant = 'info',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return { backgroundColor: 'var(--color-baie-green)', color: 'white' };
      case 'warning':
        return { backgroundColor: 'var(--color-baie-orange)', color: 'white' };
      case 'danger':
        return { backgroundColor: 'var(--color-baie-red)', color: 'white' };
      case 'info':
        return { backgroundColor: 'var(--color-baie-navy)', color: 'white' };
      default:
        return { backgroundColor: '#6B7280', color: 'white' };
    }
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${sizes[size]} ${className}`}
      style={getVariantStyles()}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
