import React from 'react';
import astLogo from '../../assets/all-star-teams-logo-250px.png';
import iaLogo from '../../assets/imaginal_agility_logo_nobkgrd.png';

interface AppLogoProps {
  appName?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AppLogo({ appName = 'allstarteams', size = 'md', className = '' }: AppLogoProps) {
  const heightClass = size === 'sm' ? 'h-6' : size === 'md' ? 'h-8' : 'h-10';
  const logoSrc = appName.includes('imaginal') ? iaLogo : astLogo;
  const altText = appName.includes('imaginal') ? 'Imaginal Agility' : 'AllStarTeams';
  const textClass = appName.includes('imaginal') ? 'text-purple-700' : 'text-indigo-700';
  
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={logoSrc} 
        alt={altText} 
        className={`${heightClass} w-auto`}
        onError={(e) => {
          // Fallback to text if image doesn't load
          const target = e.currentTarget as HTMLImageElement;
          target.style.display = 'none';
          // Use text fallback
          const textNode = document.createElement('div');
          textNode.className = `font-bold ${textClass}`;
          textNode.innerText = altText;
          
          if (target.parentElement) {
            target.parentElement.appendChild(textNode);
          }
        }}
      />
    </div>
  );
}