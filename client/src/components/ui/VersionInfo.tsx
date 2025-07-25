import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

interface VersionInfo {
  version: string;
  build: string;
  timestamp: string;
  environment: string;
}

interface VersionInfoProps {
  variant?: 'badge' | 'text' | 'detailed';
  className?: string;
}

export const VersionInfo: React.FC<VersionInfoProps> = ({ 
  variant = 'text', 
  className = '' 
}) => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo>({
    version: 'N/A',
    build: '',
    timestamp: '',
    environment: 'unknown'
  });

  useEffect(() => {
    const fetchVersionInfo = async () => {
      try {
        const response = await fetch('/version.json');
        if (response.ok) {
          const data = await response.json();
          setVersionInfo({
            version: data.version || 'N/A',
            build: data.build || '',
            timestamp: data.timestamp || '',
            environment: data.environment || 'unknown'
          });
        }
      } catch (error) {
        console.warn('Could not fetch version info');
      }
    };

    fetchVersionInfo();
  }, []);

  const formatDate = (timestamp: string) => {
    if (!timestamp) return '';
    try {
      return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const versionString = `v${versionInfo.version}${versionInfo.build ? '.' + versionInfo.build : ''}`;

  if (variant === 'badge') {
    return (
      <Badge variant="outline" className={className}>
        {versionString}
      </Badge>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        <div className="font-medium">Version: {versionString}</div>
        <div>Environment: {versionInfo.environment}</div>
        {versionInfo.timestamp && (
          <div>Built: {formatDate(versionInfo.timestamp)}</div>
        )}
      </div>
    );
  }

  // Default text variant
  return (
    <span className={`text-sm text-muted-foreground ${className}`}>
      {versionString}
    </span>
  );
};

export default VersionInfo;