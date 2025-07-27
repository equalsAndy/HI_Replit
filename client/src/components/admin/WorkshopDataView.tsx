import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface WorkshopStepData {
  data: any;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface WorkshopDataViewProps {
  userData: {
    userInfo: {
      id: number;
      name: string;
      username: string;
      email: string;
    };
    workshopStepData: {
      ast: Record<string, WorkshopStepData>;
      ia: Record<string, WorkshopStepData>;
    };
    exportMetadata?: {
      exportedAt: string;
      totalWorkshopSteps: number;
    };
  };
  onExport?: () => void;
}

// Question hints for each workshop step
const STEP_QUESTIONS = {
  // AST Workshop Steps
  '1-1': 'Star Card Assessment - Initial quadrant ratings',
  '1-2': 'Flow Assessment - Flow state indicators',
  '2-1': 'Team Building - Team formation preferences',
  '2-2': 'Collaboration - Working style assessment',
  '3-1': 'Planning - Goal setting and priorities',
  '3-2': 'Execution - Implementation strategies',
  
  // IA Workshop Steps  
  'ia-1-1': 'Introduction - Personal background and context',
  'ia-1-2': 'Vision Setting - Future aspirations and goals',
  'ia-2-1': 'Current State - Present situation assessment',
  'ia-2-2': 'Reflection - Self-awareness exercises',
  'ia-3-1': 'Values Clarification - Core values identification',
  'ia-3-2': 'Strengths Assessment - Personal strengths inventory',
  'ia-3-3': 'Planning Process - Strategic planning approach',
  'ia-3-4': 'Visualization - Future state visualization',
  'ia-3-5': 'Action Planning - Concrete next steps',
  'ia-3-6': 'Integration - Synthesis and integration',
  'ia-4-1': 'Implementation - Execution strategies',
  'ia-4-2': 'Progress Tracking - Monitoring and adjustment',
  'ia-4-3': 'Obstacles & Solutions - Challenge identification',
  'ia-4-4': 'Support Systems - Resource identification',
  'ia-4-5': 'Reflection & Learning - Insights and learnings',
  'ia-4-6': 'Next Steps - Continued development planning'
};

export const WorkshopDataView: React.FC<WorkshopDataViewProps> = ({ 
  userData, 
  onExport 
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('ast');

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const renderStepData = (stepId: string, stepData: WorkshopStepData, workshopType: 'ast' | 'ia') => {
    const isExpanded = expandedSteps.has(stepId);
    const questionHint = STEP_QUESTIONS[stepId as keyof typeof STEP_QUESTIONS] || 'Workshop step data';
    const hasData = stepData.data && Object.keys(stepData.data).length > 0;

    return (
      <Card key={stepId} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-sm font-medium">
                Step {stepId}
              </CardTitle>
              <Badge variant={hasData ? "default" : "secondary"}>
                {hasData ? "Has Data" : "No Data"}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleStepExpansion(stepId)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            {questionHint}
          </CardDescription>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0">
            {hasData ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-medium">Created:</span> {' '}
                    {formatDistanceToNow(new Date(stepData.createdAt), { addSuffix: true })}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {' '}
                    {formatDistanceToNow(new Date(stepData.updatedAt), { addSuffix: true })}
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <div className="font-medium text-sm mb-2">Data Content:</div>
                  <div className="bg-gray-50 rounded p-3 text-xs">
                    {Object.entries(stepData.data).map(([key, value]) => (
                      <div key={key} className="mb-2 last:mb-0">
                        <span className="font-medium text-gray-700">{key}:</span> {' '}
                        <span className="text-gray-600">
                          {typeof value === 'string' ? 
                            (value.length > 100 ? `${value.substring(0, 100)}...` : value) :
                            JSON.stringify(value)
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-4 text-center">
                No data saved for this step
              </div>
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  const astSteps = Object.entries(userData.workshopStepData.ast).sort(([a], [b]) => a.localeCompare(b));
  const iaSteps = Object.entries(userData.workshopStepData.ia).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workshop Data View</h2>
          <p className="text-muted-foreground">
            {userData.userInfo.name} ({userData.userInfo.username})
          </p>
        </div>
        {onExport && (
          <Button onClick={onExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export All Data
          </Button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{astSteps.length}</div>
            <p className="text-xs text-muted-foreground">AST Steps with Data</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{iaSteps.length}</div>
            <p className="text-xs text-muted-foreground">IA Steps with Data</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {userData.exportMetadata?.totalWorkshopSteps || astSteps.length + iaSteps.length}
            </div>
            <p className="text-xs text-muted-foreground">Total Steps</p>
          </CardContent>
        </Card>
      </div>

      {/* Workshop Data Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ast">
            AST Workshop ({astSteps.length} steps)
          </TabsTrigger>
          <TabsTrigger value="ia">
            IA Workshop ({iaSteps.length} steps)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ast" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AllStarTeams (AST) Workshop Data</CardTitle>
              <CardDescription>
                Data from team collaboration and flow assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {astSteps.length > 0 ? (
                <div className="space-y-4">
                  {astSteps.map(([stepId, stepData]) => 
                    renderStepData(stepId, stepData, 'ast')
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No AST workshop data found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ia" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Imaginal Agility (IA) Workshop Data</CardTitle>
              <CardDescription>
                Data from personal development and visioning exercises
              </CardDescription>
            </CardHeader>
            <CardContent>
              {iaSteps.length > 0 ? (
                <div className="space-y-4">
                  {iaSteps.map(([stepId, stepData]) => 
                    renderStepData(stepId, stepData, 'ia')
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No IA workshop data found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Metadata */}
      {userData.exportMetadata && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Export Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Exported: {formatDistanceToNow(new Date(userData.exportMetadata.exportedAt), { addSuffix: true })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};