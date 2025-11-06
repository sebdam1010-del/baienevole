const Card = ({
  children,
  title,
  className = '',
  padding = true,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md ${padding ? 'p-6' : ''} ${className}`}
      style={{ borderColor: 'var(--color-baie-beige)', borderWidth: '2px', borderStyle: 'solid' }}
      {...props}
    >
      {title && (
        <h3
          className="text-xl font-bold mb-4"
          style={{ fontFamily: 'var(--font-family-protest)', color: 'var(--color-baie-navy)' }}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;
