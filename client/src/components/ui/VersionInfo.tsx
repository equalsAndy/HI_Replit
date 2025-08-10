import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

interface VersionInfo {
  version: string;
  build: string;
  timestamp: string;
  environment: string;
  databaseType?: string;
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
    environment: 'unknown',
    databaseType: 'unknown'
  });

  useEffect(() => {
    const fetchVersionInfo = async () => {
      try {
        console.log('🔍 VersionInfo: Fetching enhanced system info...');
        const response = await fetch('/api/system/info');
        if (response.ok) {
          const data = await response.json();
          console.log('🔍 VersionInfo: Received enhanced data:', data);
          setVersionInfo({
            version: data.version || 'N/A',
            build: data.build || '',
            timestamp: data.timestamp || '',
            environment: data.environment || 'unknown',
            databaseType: data.databaseType || 'unknown'
          });
        } else {
          console.warn('🔍 VersionInfo: Enhanced endpoint failed, trying fallback...');
          
          // Fallback to original version.json endpoint
          const fallbackResponse = await fetch('/version.json');
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            console.log('🔍 VersionInfo: Fallback data received:', fallbackData);
            setVersionInfo({
              version: fallbackData.version || 'N/A',
              build: fallbackData.build || '',
              timestamp: fallbackData.timestamp || '',
              environment: fallbackData.environment || 'unknown',
              databaseType: 'unknown' // No database info in fallback
            });
          }
        }
      } catch (error) {
        console.warn('🔍 VersionInfo: Could not fetch version info:', error);
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
      <div 
        className={className}
        style={{
          fontSize: '12px',
          color: '#6b7280',
          textAlign: 'right',
          lineHeight: '1.3'
        }}
      >
        <div style={{ fontWeight: '500', marginBottom: '2px' }}>
          Version: {versionString}
        </div>
        <div style={{ marginBottom: '2px' }}>
          Environment: {versionInfo.environment}
        </div>
        <div style={{ marginBottom: '2px' }}>
          Database: {versionInfo.databaseType}
        </div>
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