import React from 'react';

interface LogoProps {
  variant?: 'default' | 'white' | 'small';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ variant = 'default', className = '' }) => {
  const getLogoColors = () => {
    switch (variant) {
      case 'white':
        return {
          primary: '#FFFFFF',
          secondary: '#C69C6D',
          text: '#FFFFFF'
        };
      case 'small':
        return {
          primary: '#1A365D',
          secondary: '#C69C6D',
          text: '#1A365D'
        };
      default:
        return {
          primary: '#1A365D',
          secondary: '#C69C6D',
          text: '#1A365D'
        };
    }
  };

  const colors = getLogoColors();
  
  if (variant === 'small') {
    return (
      <div className={`flex items-center ${className}`}>
        <svg
          width="32"
          height="32"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="100" height="100" rx="10" fill={colors.primary} />
          <path
            d="M20 20H80V80H20V20Z"
            fill={colors.primary}
            stroke={colors.secondary}
            strokeWidth="4"
          />
          <path
            d="M35 30H65V40H35V30Z"
            fill={colors.secondary}
          />
          <path
            d="M35 45H65V55H35V45Z"
            fill={colors.secondary}
          />
          <path
            d="M35 60H65V70H35V60Z"
            fill={colors.secondary}
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <svg
        width="48"
        height="48"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mr-3"
      >
        <rect width="100" height="100" rx="10" fill={colors.primary} />
        <path
          d="M20 20H80V80H20V20Z"
          fill={colors.primary}
          stroke={colors.secondary}
          strokeWidth="4"
        />
        <path
          d="M35 30H65V40H35V30Z"
          fill={colors.secondary}
        />
        <path
          d="M35 45H65V55H35V45Z"
          fill={colors.secondary}
        />
        <path
          d="M35 60H65V70H35V60Z"
          fill={colors.secondary}
        />
      </svg>
      <div>
        <h1 className="text-xl font-bold" style={{ color: colors.text }}>FIRENZE</h1>
        <p className="text-xs" style={{ color: colors.text }}>IMOBILIÁRIA</p>
      </div>
    </div>
  );
};

export default Logo;

