import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function HI_Logo({ className }: LogoProps) {
  return (
    <div className={cn('flex items-center', className)}>
      <img 
        src="/assets/hi-logo.png" 
        alt="Heliotrope Imaginal" 
        className="h-10 w-auto" 
      />
    </div>
  );
}

export function AST_Logo({ className }: LogoProps) {
  return (
    <div className={cn('flex items-center', className)}>
      <svg width="auto" height="100%" viewBox="0 0 250 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* A */}
        <path d="M10 50L0 10h10l5 30 6-30h8l6 30 5-30h10L40 50h-9l-6-28-6 28h-9z" fill="currentColor" />
        
        {/* L */}
        <path d="M60 10h10v32h18v8H60V10z" fill="currentColor" />
        
        {/* L */}
        <path d="M90 10h10v32h18v8H90V10z" fill="currentColor" />
        
        {/* S */}
        <path d="M142 40c-3 3-8 5-14 5-12 0-20-7-20-17h10c0 5 4 9 10 9 5 0 8-2 8-5 0-10-26-4-26-22 0-8 7-15 19-15 10 0 17 5 19 13h-10c-1-4-4-6-9-6-4 0-8 2-8 5 0 10 26 4 26 22 0 5-2 9-5 11z" fill="currentColor" />
        
        {/* T */}
        <path d="M150 18V10h40v8h-15v32h-10V18h-15z" fill="currentColor" />
        
        {/* A */}
        <path d="M200 50l-10-40h10l5 30 6-30h8l6 30 5-30h10l-10 40h-9l-6-28-6 28h-9z" fill="currentColor" />
        
        {/* R */}
        <path d="M240 50h-10V10h20c8 0 14 5 14 13 0 6-3 10-8 12l10 15h-12l-8-13h-6v13zm0-20h9c3 0 5-2 5-5s-2-5-5-5h-9v10z" fill="currentColor" />
      </svg>
    </div>
  );
}

export function IA_Logo({ className }: LogoProps) {
  return (
    <div className={cn('flex items-center', className)}>
      <svg width="auto" height="100%" viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* I */}
        <path d="M0 10h30v8H20v22h-10V18H0v-8z" fill="currentColor" />
        
        {/* M */}
        <path d="M35 10h10l8 22 8-22h10v40h-9V20l-9 22h-1l-8-22v30h-9V10z" fill="currentColor" />
        
        {/* A */}
        <path d="M80 50L70 10h10l5 30 6-30h8l6 30 5-30h10L110 50h-9l-6-28-6 28h-9z" fill="currentColor" />
        
        {/* G */}
        <path d="M120 35c0-10 7-17 17-17 8 0 14 4 16 12h-9c-1-3-4-5-7-5-5 0-8 4-8 10s3 10 8 10c3 0 6-2 7-5h9c-2 8-8 12-16 12-10 0-17-7-17-17z" fill="currentColor" />
        
        {/* I */}
        <path d="M160 10h30v8h-10v22h-10V18h-10v-8z" fill="currentColor" />
        
        {/* N */}
        <path d="M195 10h10v40h-10l-15-25v25h-10V10h9l16 25V10z" fill="currentColor" />
      </svg>
    </div>
  );
}