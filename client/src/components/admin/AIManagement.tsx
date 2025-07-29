import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Activity, 
  AlertTriangle, 
  Users, 
  DollarSign, 
  Clock, 
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  Crown
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AIConfiguration {
  id: string;
  feature_name: string;
  enabled: boolean;
  rate_limit_per_hour: number;
  rate_limit_per_day: number;
  max_tokens: number;
  timeout_ms: number;
  created_at: string;
  updated_at: string;
}

interface AIUsageStats {
  statistics: any[];
  currentHour: any[];
  totals: {
    total_calls_24h: number;
    total_tokens_24h: number;
    total_cost_24h: number;
    active_users_24h: number;
  };
}

interface BetaTester {
  id: number;
  username: string;
  name: string;
  email: string;
  is_beta_tester: boolean;
  beta_tester_granted_at: string;
  granted_by_username: string;
}

export default function AIManagement() {
  const [selectedFeature, setSelectedFeature] = useState<string>('global');
  const queryClient = useQueryClient();

  // Fetch AI configurations
  const { data: configurations, isLoading: configLoading } = useQuery<{success: boolean; configurations: AIConfiguration[]}>({
    queryKey: ['/api/admin/ai/config'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch usage statistics
  const { data: usageStats, isLoading: statsLoading } = useQuery<AIUsageStats>({
    queryKey: ['/api/admin/ai/usage/stats'],
    refetchInterval: 10000, // Refresh every 10 seconds for real-time monitoring
  });

  // Fetch beta testers
  const { data: betaTesters, isLoading: betaLoading } = useQuery<{success: boolean; betaTesters: BetaTester[]}>({
    queryKey: ['/api/admin/ai/beta-testers'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: async ({ featureName, updates }: { featureName: string; updates: Partial<AIConfiguration> }) => {
      const response = await fetch(`/api/admin/ai/config/${featureName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update configuration');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai/config'] });
    },
  });

  // Emergency disable mutation
  const emergencyDisableMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/ai/emergency-disable', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to disable AI');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai/config'] });
    },
  });

  // Beta tester toggle mutation
  const toggleBetaTesterMutation = useMutation({
    mutationFn: async ({ userId, grant }: { userId: number; grant: boolean }) => {
      const response = await fetch(`/api/admin/ai/beta-testers/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ grant }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update beta tester status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai/beta-testers'] });
    },
  });

  const handleToggleFeature = (featureName: string, enabled: boolean) => {
    updateConfigMutation.mutate({
      featureName,
      updates: { enabled }
    });
  };

  const handleEmergencyDisable = () => {
    if (confirm('⚠️ This will disable ALL AI features immediately. Are you sure?')) {
      emergencyDisableMutation.mutate();
    }
  };

  const selectedConfig = configurations?.configurations?.find(c => c.feature_name === selectedFeature);

  const getFeatureBadgeColor = (featureName: string) => {
    const config = configurations?.configurations?.find(c => c.feature_name === featureName);
    return config?.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(amount);
  };

  if (configLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading AI Management...</span>
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
            AI Management
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor and control AI features, usage, and access across the platform
          </p>
        </div>
        <Button
          onClick={handleEmergencyDisable}
          variant="destructive"
          disabled={emergencyDisableMutation.isPending}
          className="flex items-center gap-2"
        >
          <AlertTriangle className="h-4 w-4" />
          Emergency Disable
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">24h API Calls</p>
                <p className="text-2xl font-bold">{usageStats?.totals?.total_calls_24h || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tokens Used</p>
                <p className="text-2xl font-bold">{usageStats?.totals?.total_tokens_24h?.toLocaleString() || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estimated Cost</p>
                <p className="text-2xl font-bold">{formatCurrency(usageStats?.totals?.total_cost_24h || 0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{usageStats?.totals?.active_users_24h || 0}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            AI Feature Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {configurations?.configurations?.map((config) => (
              <div key={config.feature_name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium capitalize">{config.feature_name.replace('_', ' ')}</h3>
                    <Badge className={`text-xs ${getFeatureBadgeColor(config.feature_name)}`}>
                      {config.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <Switch
                    checked={config.enabled}
                    onCheckedChange={(enabled) => handleToggleFeature(config.feature_name, enabled)}
                    disabled={updateConfigMutation.isPending}
                  />
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Rate: {config.rate_limit_per_hour}/hour</div>
                  <div>Daily: {config.rate_limit_per_day}/day</div>
                  <div>Max Tokens: {config.max_tokens}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Hour Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Current Hour Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {usageStats?.currentHour?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {usageStats.currentHour.map((stat: any) => (
                <div key={stat.feature_name} className="border rounded-lg p-4">
                  <h4 className="font-medium capitalize mb-2">{stat.feature_name.replace('_', ' ')}</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Calls:</span>
                      <span className="font-medium">{stat.calls_this_hour}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tokens:</span>
                      <span className="font-medium">{stat.tokens_this_hour?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success:</span>
                      <span className="font-medium">{stat.successful_calls}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost:</span>
                      <span className="font-medium">{formatCurrency(stat.cost_this_hour || 0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No AI activity in the current hour</p>
          )}
        </CardContent>
      </Card>

      {/* Beta Testers Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Beta Testers ({betaTesters?.betaTesters?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {betaLoading ? (
            <div className="text-center py-4">
              <RefreshCw className="h-5 w-5 animate-spin mx-auto" />
            </div>
          ) : betaTesters?.betaTesters?.length > 0 ? (
            <div className="space-y-2">
              {betaTesters.betaTesters.map((tester) => (
                <div key={tester.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{tester.name || tester.username}</span>
                      <Badge variant="secondary">{tester.username}</Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Granted: {new Date(tester.beta_tester_granted_at).toLocaleDateString()} by {tester.granted_by_username}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleBetaTesterMutation.mutate({ userId: tester.id, grant: false })}
                    disabled={toggleBetaTesterMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No beta testers currently active</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}