import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Activity, 
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface ConnectionStatus {
  openai: boolean;
  reflection_talia: boolean;
  report_talia: boolean;
  response_time: number;
}

export default function AIManagement() {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch OpenAI connection status
  const { data: status, isLoading, refetch } = useQuery<ConnectionStatus>({
    queryKey: ['/api/talia-status/all'],
    refetchInterval: 30000, // Refresh every 30 seconds
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
          <span>Checking AI connections...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="h-6 w-6" />
            OpenAI Overview
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor OpenAI connectivity and AI system status
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Status
        </Button>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">OpenAI API</p>
                <div className="flex items-center gap-2 mt-1">
                  {status?.openai ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-600">Connected</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-600">Disconnected</span>
                    </>
                  )}
                </div>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reflection Assistant</p>
                <div className="flex items-center gap-2 mt-1">
                  {status?.reflection_talia ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-600">Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-600">Inactive</span>
                    </>
                  )}
                </div>
              </div>
              <Bot className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Report Generator</p>
                <div className="flex items-center gap-2 mt-1">
                  {status?.report_talia ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-600">Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-600">Inactive</span>
                    </>
                  )}
                </div>
              </div>
              <Bot className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Response Time</span>
              <Badge variant={status?.response_time && status.response_time < 2000 ? "default" : "destructive"}>
                {status?.response_time ? `${status.response_time}ms` : 'Unknown'}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Last Checked</span>
              <span className="text-sm text-gray-600">
                {lastRefresh.toLocaleTimeString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">AI Provider</span>
              <Badge variant="outline">OpenAI</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 justify-start"
              onClick={() => window.open('/api/talia-status/all', '_blank')}
            >
              <div className="text-left">
                <div className="font-medium">View Detailed Status</div>
                <div className="text-sm text-gray-600">Open full status endpoint</div>
              </div>
              <ExternalLink className="h-4 w-4 ml-auto" />
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 justify-start"
              onClick={handleRefresh}
            >
              <div className="text-left">
                <div className="font-medium">Force Refresh</div>
                <div className="text-sm text-gray-600">Update all connection status</div>
              </div>
              <RefreshCw className="h-4 w-4 ml-auto" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}