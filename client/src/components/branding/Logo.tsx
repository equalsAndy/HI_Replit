import React from 'react';
import allStarTeamsLogo from '@/assets/all-star-teams-logo-250px.png';
import imaginalAgilityLogo from '@/assets/imaginal_agility_logo_nobkgrd.png';
import heliotropeLogo from '@/assets/HI_Logo_horizontal.png';

interface LogoProps {
  type: 'allstarteams' | 'imaginal-agility' | 'heliotrope';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ type, className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: type === 'imaginal-agility' ? 'h-8' : 'h-8',
    md: type === 'imaginal-agility' ? 'h-12' : 'h-12',
    lg: type === 'imaginal-agility' ? 'h-16' : 'h-16'
  };

  const logoConfig = {
    'allstarteams': {
      src: allStarTeamsLogo,
      alt: 'AllStarTeams'
    },
    'imaginal-agility': {
      src: imaginalAgilityLogo,
      alt: 'Imaginal Agility'
    },
    'heliotrope': {
      src: heliotropeLogo,
      alt: 'Heliotrope Imaginal'
    }
  };

  const config = logoConfig[type];

  console.log('🏷️ Logo Component Debug:', {
    type,
    size,
    currentUrl: window.location.pathname
  });

  return (
    <img 
      src={config.src} 
      alt={config.alt} 
      className={`${sizeClasses[size]} w-auto ${className}`}
    />
  );
}