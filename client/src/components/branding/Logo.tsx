import React from 'react';
import { Link } from 'wouter';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'light' | 'dark';
  withText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'default',
  withText = true,
  className = '',
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-16',
  };

  // Text color classes
  const textColorClasses = {
    default: 'text-primary',
    light: 'text-white',
    dark: 'text-gray-900',
  };

  return (
    <Link href="/">
      <a className={`flex items-center gap-2 ${className}`}>
        <div className="relative">
          <img 
            src="/images/HI_Logo_horizontal.png" 
            alt="Heliotrope Imaginal Logo" 
            className={`${sizeClasses[size]} object-contain`}
          />
        </div>
        {withText && (
          <div className={`font-semibold ${textColorClasses[variant]} hidden md:block`}>
            Heliotrope Imaginal Workshops
          </div>
        )}
      </a>
    </Link>
  );
};

export default Logo;