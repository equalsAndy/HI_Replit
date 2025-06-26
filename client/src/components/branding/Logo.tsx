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
    sm: 'w-32 h-auto',     // 128px width, auto height
    md: 'w-48 h-auto',     // 192px width, auto height
    lg: 'w-60 h-auto'      // 240px width, auto height
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
      className={`${sizeClasses[size]} ${className}`}
    />
  );
}