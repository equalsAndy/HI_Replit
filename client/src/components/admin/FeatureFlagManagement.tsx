import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  ToggleLeft, 
  ToggleRight, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TestTube
} from 'lucide-react';

interface FeatureFlag {
  name: string;
  enabled: boolean;
  environment: string;
  description: string;
  aiRelated?: boolean;
}

interface FeatureFlagStatus {
  flags: Record<string, FeatureFlag>;
  environment: string;
}

interface ReportHealthCheck {
  isWorking: boolean;
  responseTime: number;
  hasRealData: boolean;
  error?: string;
}

export default function FeatureFlagManagement() {
  const [testingReport, setTestingReport] = useState(false);
  const queryClient = useQueryClient();

  // Fetch current feature flag status
  const { data: flagStatus, isLoading } = useQuery<FeatureFlagStatus>({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const response = await fetch('/api/admin/feature-flags', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch feature flags');
      return response.json();
    }
  });

  // Test holistic report health
  const { data: reportHealth, isLoading: healthLoading } = useQuery<ReportHealthCheck>({
    queryKey: ['report-health'],
    queryFn: async () => {
      const response = await fetch('/api/admin/reports/health-check', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to check report health');
      return response.json();
    },
    refetchInterval: 30000, // Check every 30 seconds
    staleTime: 25000
  });

  // Toggle feature flag mutation
  const toggleFlagMutation = useMutation({
    mutationFn: async ({ flagName, enabled }: { flagName: string; enabled: boolean }) => {
      const response = await fetch('/api/admin/feature-flags/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ flagName, enabled })
      });
      if (!response.ok) throw new Error('Failed to toggle feature flag');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    }
  });

  // Test report generation mutation
  const testReportMutation = useMutation({
    mutationFn: async () => {
      setTestingReport(true);
      const response = await fetch('/api/admin/reports/test-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ testUserId: 1 })
      });
      if (!response.ok) throw new Error('Failed to test report generation');
      return response.json();
    },
    onSuccess: (result) => {
      setTestingReport(false);
      queryClient.invalidateQueries({ queryKey: ['report-health'] });
      
      // Auto-enable reports if test passes
      if (result.isWorking && result.hasRealData) {
        toggleFlagMutation.mutate({ flagName: 'holisticReportsWorking', enabled: true });
      }
    },
    onError: () => {
      setTestingReport(false);
    }
  });

  const handleToggleFlag = (flagName: string, currentEnabled: boolean) => {
    toggleFlagMutation.mutate({ flagName, enabled: !currentEnabled });
  };

  const handleTestReports = () => {
    testReportMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Feature Flag Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading feature flags...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const aiFlags = Object.entries(flagStatus?.flags || {})
    .filter(([_, flag]) => flag.aiRelated)
    .sort(([a], [b]) => a.localeCompare(b));

  const holisticReportsFlag = flagStatus?.flags?.holisticReportsWorking;

  return (
    <div className="space-y-6">
      {/* Report System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Report System Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Health Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {healthLoading ? (
                <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
              ) : reportHealth?.isWorking ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <div>
                <h4 className="font-semibold">
                  {healthLoading ? 'Checking...' : 
                   reportHealth?.isWorking ? 'System Working' : 'System Issues Detected'}
                </h4>
                {reportHealth && !healthLoading && (
                  <p className="text-sm text-gray-600">
                    Response time: {reportHealth.responseTime}ms | 
                    Real data: {reportHealth.hasRealData ? 'Yes' : 'No'}
                    {reportHealth.error && ` | Error: ${reportHealth.error}`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleTestReports}
                disabled={testingReport || testReportMutation.isPending}
                variant="outline"
                size="sm"
              >
                {testingReport ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Reports
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Auto-enable notice */}
          {reportHealth?.isWorking && reportHealth?.hasRealData && !holisticReportsFlag?.enabled && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                ✅ <strong>System is working!</strong> Click "Test Reports" above to automatically re-enable report generation.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Feature Flags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            AI Feature Flags
            <Badge variant="outline">{flagStatus?.environment}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiFlags.map(([flagName, flag]) => (
              <div key={flagName} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{flagName}</h4>
                    <Badge variant={flag.enabled ? "default" : "secondary"}>
                      {flag.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    {flagName === 'holisticReportsWorking' && (
                      <Badge variant={reportHealth?.isWorking ? "default" : "destructive"}>
                        {reportHealth?.isWorking ? 'Healthy' : 'Issues'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{flag.description}</p>
                  <p className="text-xs text-gray-400 mt-1">Environment: {flag.environment}</p>
                </div>
                <button
                  onClick={() => handleToggleFlag(flagName, flag.enabled)}
                  disabled={toggleFlagMutation.isPending}
                  className={`
                    relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50
                    ${flag.enabled ? 'bg-green-600' : 'bg-gray-300'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out
                      ${flag.enabled ? 'translate-x-7' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
            ))}
          </div>

          {aiFlags.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No AI-related feature flags found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Status Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>System Working Properly</span>
              </div>
              <div className="flex items-center gap-2">
                <ToggleRight className="h-4 w-4 text-green-600" />
                <span>Feature Enabled</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span>System Issues Detected</span>
              </div>
              <div className="flex items-center gap-2">
                <ToggleLeft className="h-4 w-4 text-gray-400" />
                <span>Feature Disabled</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}