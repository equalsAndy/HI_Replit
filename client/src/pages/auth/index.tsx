import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function AuthIndexRedirect() {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate('/auth/login');
  }, [navigate]);
  return null;
}

