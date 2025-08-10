import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface FloatingAITriggerProps {
  currentStep?: string;
  workshopType?: 'ast' | 'ia';
  aiEnabled?: boolean;
  context?: any;
}

const FloatingAITriggerSafe: React.FC<FloatingAITriggerProps> = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simple user fetch without complex hooks
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user || data);
        }
      } catch (error) {
        console.warn('Failed to fetch user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Only show to admin users
  if (isLoading || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button className="w-16 h-16 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-lg hover:bg-purple-600 transition-colors">
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
};

export default FloatingAITriggerSafe;