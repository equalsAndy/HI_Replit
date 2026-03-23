import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  CheckCircle,
  XCircle,
  RefreshCw,
  Key,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface AIStatus {
  aiProvider: {
    global: string;
    ia: string;
    coaching: string;
    reports: string;
  };
  keys: {
    claude: boolean;
    openai: boolean;
    openaiIA: boolean;
  };
  providerUsage: {
    claude: string;
    openai: string;
    openaiIA: string;
  };
  timestamp: string;
}

export default function AIManagement() {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const { data: status, isLoading, refetch } = useQuery<AIStatus>({
    queryKey: ['/api/talia-status/all'],
    refetchInterval: false, // No auto-polling — manual refresh only
  });

  const handleRefresh = async () => {
    await refetch();
    setLastRefresh(new Date());
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Checking AI status...</span>
        </div>
      </div>
    );
  }

  const keyEntries = [
    {
      label: 'Claude API Key',
      envVar: 'CLAUDE_API_KEY',
      available: status?.keys?.claude ?? false,
      usage: status?.providerUsage?.claude ?? 'IA exercises',
      color: 'amber',
    },
    {
      label: 'OpenAI API Key',
      envVar: 'OPENAI_API_KEY',
      available: status?.keys?.openai ?? false,
      usage: status?.providerUsage?.openai ?? 'AST reports',
      color: 'blue',
    },
    {
      label: 'OpenAI IA Key',
      envVar: 'OPENAI_KEY_IA',
      available: status?.keys?.openaiIA ?? false,
      usage: status?.providerUsage?.openaiIA ?? 'DALL-E image generation',
      color: 'purple',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="h-6 w-6" />
            AI Provider Status
          </h1>
          <p className="text-gray-600 mt-1">
            API key availability and provider configuration
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* API Key Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {keyEntries.map((entry) => (
          <Card key={entry.envVar}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-600">{entry.label}</p>
                <Key className={`h-5 w-5 ${entry.available ? 'text-green-600' : 'text-gray-300'}`} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                {entry.available ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-600">Configured</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="font-medium text-red-500">Not Set</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{entry.usage}</p>
              <p className="text-xs text-gray-400 font-mono mt-1">{entry.envVar}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Provider Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Provider Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {status?.aiProvider &&
              Object.entries(status.aiProvider).map(([feature, provider]) => (
                <div key={feature} className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    {feature}
                  </span>
                  <Badge
                    variant={provider === 'claude' ? 'default' : 'outline'}
                    className={provider === 'claude' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                  >
                    {provider === 'claude' ? 'Claude' : 'OpenAI'}
                  </Badge>
                </div>
              ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Providers are configured via AI_PROVIDER and AI_PROVIDER_* environment variables in root .env
          </p>
        </CardContent>
      </Card>

      {/* Last checked */}
      <div className="text-xs text-gray-400 text-right">
        Last checked: {lastRefresh.toLocaleTimeString()}
        {status?.timestamp && ` | Server: ${new Date(status.timestamp).toLocaleTimeString()}`}
      </div>
    </div>
  );
}
