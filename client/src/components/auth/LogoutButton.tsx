import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth0 } from '@auth0/auth0-react';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  fullWidth?: boolean;
}

export function LogoutButton({ 
  variant = 'outline', 
  size = 'sm', 
  className = 'rounded-md bg-white text-yellow-600 hover:bg-yellow-100',
  fullWidth = false
}: LogoutButtonProps) {
  const { logout } = useAuth0();

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`${className} ${fullWidth ? 'w-full' : ''}`}
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4 mr-1" />
      <span className="hidden md:inline">Logout</span>
    </Button>
  );
}

export default LogoutButton;
