import React, { useState, useEffect } from 'react';
import { useReportTaliaContext } from '../../contexts/ReportTaliaContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/Button';
import { Switch } from '../ui/switch';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';  
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Alert, AlertDescription } from '../ui/Alert';
import { 
  Users, 
  Settings, 
  Eye,
  Edit,
  Save,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Brain,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Download,
  FileText,
  MessageCircle
} from 'lucide-react';

interface TaliaPersona {
  id: string;
  name: string;
  role: string;
  description: string;
  dataAccess: string[];
  trainingDocuments: string[];
  trainingDocumentNames?: string[];
  requiredDocuments?: string[];
  requiredDocumentNames?: string[];
  tokenLimit: number;
  enabled: boolean;
  environments: string[];
  behavior: {
    tone: string;
    nameUsage: 'first' | 'full' | 'formal';
    maxResponseLength: number;
    helpStyle: 'guide' | 'write' | 'analyze';
  };
  reflectionAreas?: string[];
}

interface ReflectionArea {
  id: string;
  name: string;
  description: string;
  workshopStep: string;
  enabled: boolean;
  fallbackText?: string;
}

interface TrainingDocument {
  id: string;
  title: string;
  document_type: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
  file_size: number;
  original_filename: string;
  chunk_count: number;
  processing_status: 'processed' | 'pending';
  assignedToPersonas: string[];
  isProcessed: boolean;
  lastUpdated: string;
}

interface CompletedUser {
  id: number;
  username: string;
  name: string;
  email: string;
  ast_completed_at: string;
  created_at: string;
}

interface TrainingData {
  guidelines: string[];
  examples: string[];
  trainingSessions: any[];
  lastUpdated: string | null;
  enabled?: boolean;
}

// Training Data Editor Component
function TrainingDataEditor({ personaId }: { personaId: string }): JSX.Element {
  const [trainingData, setTrainingData] = useState<TrainingData>({
    guidelines: [],
    examples: [],
    trainingSessions: [],
    lastUpdated: null,
    enabled: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [newGuideline, setNewGuideline] = useState('');
  const [newExample, setNewExample] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalTrainingData, setOriginalTrainingData] = useState<TrainingData>({
    guidelines: [],
    examples: [],
    trainingSessions: [],
    lastUpdated: null,
    enabled: true
  });

  // Fetch training data for the persona
  useEffect(() => {
    const fetchTrainingData = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Map persona IDs to match training data file structure
        const trainingPersonaId = personaId === 'ast_reflection' ? 'talia_coach' : personaId;
        
        const response = await fetch(`/api/admin/ai/training-data/${trainingPersonaId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch training data');
        }
        
        const data = await response.json();
        
        // Use the actual saved guidelines and examples from the training data
        // Don't extract from sessions - respect what the user has saved
        const processedData = {
          guidelines: data.trainingData.guidelines || [],
          examples: data.trainingData.examples || [],
          trainingSessions: data.trainingData.trainingSessions || [],
          lastUpdated: data.trainingData.lastUpdated,
          enabled: data.trainingData.enabled !== false // Default to true if not set
        };
        
        setTrainingData(processedData);
        setOriginalTrainingData(processedData);
        setHasUnsavedChanges(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load training data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainingData();
  }, [personaId]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      setSuccessMessage('');
      
      // Map persona IDs to match training data file structure
      const trainingPersonaId = personaId === 'ast_reflection' ? 'talia_coach' : personaId;
      
      const response = await fetch(`/api/admin/ai/training-data/${trainingPersonaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          guidelines: trainingData.guidelines,
          examples: trainingData.examples
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save training data');
      }
      
      const result = await response.json();
      setSuccessMessage(`Training data saved successfully! ${result.guidelinesCount} guidelines, ${result.examplesCount} examples.`);
      
      // Update lastUpdated and clear unsaved changes
      const updatedData = {
        ...trainingData,
        lastUpdated: new Date().toISOString()
      };
      setTrainingData(updatedData);
      setOriginalTrainingData(updatedData);
      setHasUnsavedChanges(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save training data');
    } finally {
      setIsSaving(false);
    }
  };

  const addGuideline = () => {
    if (newGuideline.trim()) {
      setTrainingData(prev => ({
        ...prev,
        guidelines: [...prev.guidelines, newGuideline.trim()]
      }));
      setNewGuideline('');
      setHasUnsavedChanges(true);
    }
  };

  const removeGuideline = (index: number) => {
    setTrainingData(prev => ({
      ...prev,
      guidelines: prev.guidelines.filter((_, i) => i !== index)
    }));
    setHasUnsavedChanges(true);
  };

  const addExample = () => {
    if (newExample.trim()) {
      setTrainingData(prev => ({
        ...prev,
        examples: [...prev.examples, newExample.trim()]
      }));
      setNewExample('');
      setHasUnsavedChanges(true);
    }
  };

  const removeExample = (index: number) => {
    setTrainingData(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
    setHasUnsavedChanges(true);
  };

  const handleToggleTraining = async (enabled: boolean) => {
    try {
      setError('');
      
      // Map persona IDs to match training data file structure
      const trainingPersonaId = personaId === 'ast_reflection' ? 'talia_coach' : personaId;
      
      const response = await fetch(`/api/admin/ai/training-data/${trainingPersonaId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ enabled })
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle training data');
      }
      
      const result = await response.json();
      setTrainingData(prev => ({
        ...prev,
        enabled: enabled,
        lastUpdated: new Date().toISOString()
      }));
      
      setSuccessMessage(`Training data ${enabled ? 'enabled' : 'disabled'} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle training data');
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
          <span>Loading training data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg space-y-4">
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}
      
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {hasUnsavedChanges && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Unsaved Changes:</strong> You have made changes that haven't been saved yet. 
            Click "Save Unsaved Changes" to persist your modifications.
          </AlertDescription>
        </Alert>
      )}

      {/* Training Toggle */}
      <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${trainingData.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div>
            <h4 className="font-medium text-sm">
              Training Data {trainingData.enabled ? 'Enabled' : 'Disabled'}
            </h4>
            <p className="text-xs text-gray-600">
              {trainingData.enabled 
                ? 'Training guidelines and examples are being applied to conversations' 
                : 'Training data is disabled - using default behavior only'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {trainingData.enabled ? 'ON' : 'OFF'}
          </span>
          <Switch
            checked={trainingData.enabled || false}
            onCheckedChange={handleToggleTraining}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Guidelines */}
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            Training Guidelines
            <Badge variant="secondary">{trainingData.guidelines.length}</Badge>
            <Badge variant="outline" className="text-xs text-blue-600">
              From Training Sessions
            </Badge>
          </h4>
          {trainingData.guidelines.length === 0 ? (
            <div className="p-4 bg-gray-50 rounded text-sm text-gray-600 text-center">
              No meaningful training guidelines extracted yet. 
              <br />Use the TRAIN command in chat or add guidelines manually below.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {trainingData.guidelines.map((guideline, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded text-sm">
                  <span className="flex-1">{guideline}</span>
                  <button
                    onClick={() => removeGuideline(index)}
                    className="text-red-500 hover:text-red-700 flex-shrink-0 mt-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-2 flex gap-2">
            <Input
              placeholder="Add new guideline..."
              value={newGuideline}
              onChange={(e) => setNewGuideline(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addGuideline()}
              className="text-sm"
            />
            <Button size="sm" onClick={addGuideline}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Examples */}
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            Training Examples
            <Badge variant="secondary">{trainingData.examples.length}</Badge>
            <Badge variant="outline" className="text-xs text-green-600">
              User Feedback
            </Badge>
          </h4>
          {trainingData.examples.length === 0 ? (
            <div className="p-4 bg-gray-50 rounded text-sm text-gray-600 text-center">
              No training examples found yet.
              <br />Training examples come from actual user feedback during training sessions.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {trainingData.examples.map((example, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded text-sm">
                  <span className="flex-1">
                    {example.length > 150 ? (
                      <span>
                        {example.substring(0, 150)}...
                        <button 
                          className="text-blue-600 hover:text-blue-800 ml-1"
                          onClick={() => alert(example)}
                        >
                          [show more]
                        </button>
                      </span>
                    ) : example}
                  </span>
                  <button
                    onClick={() => removeExample(index)}
                    className="text-red-500 hover:text-red-700 flex-shrink-0 mt-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-2 flex gap-2">
            <Input
              placeholder="Add new example..."
              value={newExample}
              onChange={(e) => setNewExample(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addExample()}
              className="text-sm"
            />
            <Button size="sm" onClick={addExample}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-gray-600">
          {trainingData.lastUpdated && (
            <span>Last updated: {new Date(trainingData.lastUpdated).toLocaleString()}</span>
          )}
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className={`${hasUnsavedChanges 
            ? 'bg-orange-600 hover:bg-orange-700 animate-pulse' 
            : 'bg-purple-600 hover:bg-purple-700'}`}
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {hasUnsavedChanges ? 'Save Unsaved Changes' : 'Save Training Data'}
            </>
          )}
        </Button>
      </div>

      <Alert>
        <Brain className="h-4 w-4" />
        <AlertDescription>
          <strong>Direct Training Editor:</strong> Add, edit, or remove training guidelines and examples. 
          Changes will be immediately applied to future conversations with this persona.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Report Talia Features Component
function ReportTaliaFeatures(): JSX.Element {
  const { 
    selectedUserId, 
    setSelectedUserId, 
    completedUsers, 
    setCompletedUsers,
    setIsAdminContext 
  } = useReportTaliaContext();
  
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [reportType, setReportType] = useState<'personal' | 'professional'>('personal');

  // Set admin context on mount
  useEffect(() => {
    setIsAdminContext(true);
    return () => setIsAdminContext(false); // Clean up on unmount
  }, [setIsAdminContext]);

  // Fetch completed users on component mount
  useEffect(() => {
    const fetchCompletedUsers = async () => {
      try {
        console.log('🔧 Fetching completed users...');
        const response = await fetch('/api/admin/ai/report-talia/completed-users', {
          credentials: 'include'
        });
        
        console.log('🔧 Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('🔧 Received data:', data);
          setCompletedUsers(data.users || []);
        } else {
          console.error('🔧 Response not ok:', response.status, await response.text());
        }
      } catch (error) {
        console.error('🔧 Error fetching completed users:', error);
      }
    };

    fetchCompletedUsers();
  }, []);

  const handleGenerateReport = async () => {
    if (!selectedUserId) return;
    
    setIsGeneratingReport(true);
    try {
      const response = await fetch('/api/admin/ai/report-talia/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          userId: selectedUserId,
          reportType: reportType
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setGeneratedReport(data.report);
      } else {
        const error = await response.json();
        console.error('Report generation failed:', error);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };


  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Report Talia Features
      </h3>
      
      <div className="space-y-4">
        {/* User Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select AST Completed User
          </label>
          <Select onValueChange={(value) => setSelectedUserId(parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a user who has completed AST..." />
            </SelectTrigger>
            <SelectContent>
              {completedUsers.map((user) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.name} ({user.username}) - Completed {new Date(user.ast_completed_at).toLocaleDateString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            {completedUsers.length} users have completed the AST workshop
          </p>
        </div>

        {/* Report Type Selection */}
        {selectedUserId && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={(value: 'personal' | 'professional') => setReportType(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">
                    <div className="flex flex-col">
                      <span className="font-medium">Personal Development Report</span>
                      <span className="text-xs text-gray-500">Intimate, personal growth focused</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="professional">
                    <div className="flex flex-col">
                      <span className="font-medium">Professional Development Report</span>
                      <span className="text-xs text-gray-500">Business/career focused, suitable for sharing</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Generate Report */}
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateReport}
                disabled={!selectedUserId || isGeneratingReport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isGeneratingReport ? 'Generating...' : `Generate ${reportType === 'personal' ? 'Personal' : 'Professional'} Report`}
              </Button>
            </div>
          </div>
        )}

        {/* Info about chat functionality */}
        {selectedUserId && (
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-blue-600" />
              <span><strong>Chat with Report Talia:</strong> Use the floating Talia button at the bottom-right of your screen to chat about {completedUsers.find(u => u.id === selectedUserId)?.name}'s development.</span>
            </div>
          </div>
        )}

        {/* Generated Report Display */}
        {generatedReport && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{generatedReport.reportType === 'personal' ? 'Personal Development' : 'Professional Development'} Report Generated:</strong> {generatedReport.filename}
                <br />
                <span className="text-xs text-gray-600">
                  {generatedReport.hasStarCard ? '✅ Includes StarCard image' : '⚠️ No StarCard available'}
                  {' | '}Generated for: {generatedReport.targetUser.name}
                </span>
              </AlertDescription>
            </Alert>
            
            {/* Report Content Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generated Report Content
                </CardTitle>
                <CardDescription>
                  {generatedReport.reportType === 'personal' ? 'Personal development report - intimate and growth-focused' : 'Professional development report - suitable for workplace sharing'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="max-h-96 overflow-y-auto border rounded-lg p-4 bg-white"
                  dangerouslySetInnerHTML={{ __html: generatedReport.content }}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Use the floating Talia button at bottom-right for chat */}
      </div>
    </div>
  );
}

export default function PersonaManagement() {
  const reportTaliaContext = useReportTaliaContext();
  const [selectedPersona, setSelectedPersona] = useState<string>('star_report');
  const [editingMode, setEditingMode] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['coaching_guide', 'report_template']));
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, string[]>>({});
  const [currentEnvironment, setCurrentEnvironment] = useState<string>('development');
  const [trainingText, setTrainingText] = useState('');
  const [isSubmittingTraining, setIsSubmittingTraining] = useState(false);
  const [showInactiveDocuments, setShowInactiveDocuments] = useState(false);
  const queryClient = useQueryClient();
  
  // Sync selected persona with ReportTalia context for floating button
  useEffect(() => {
    reportTaliaContext.setSelectedPersona(selectedPersona);
  }, [selectedPersona, reportTaliaContext]);

  // Fetch personas
  const { data: personasData, isLoading: personasLoading, refetch: refetchPersonas, error: personasError } = useQuery<{success: boolean; personas: TaliaPersona[]; environment: string}>({
    queryKey: ['/api/admin/ai/personas'],
    queryFn: async () => {
      console.log('🔧 Making GET request to /api/admin/ai/personas');
      const response = await fetch('/api/admin/ai/personas', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🔧 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔧 GET request failed:', response.status, errorText);
        throw new Error(`Failed to fetch personas: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('🔧 GET response data:', data);
      return data;
    },
    refetchInterval: 5000, // More frequent updates for real-time feel
    retry: 1,
  });

  // Update environment when personas data changes
  React.useEffect(() => {
    if (personasData?.environment) {
      setCurrentEnvironment(personasData.environment);
    }
  }, [personasData?.environment]);

  // Clear pending changes when switching personas
  React.useEffect(() => {
    if (selectedPersona) {
      // If switching to a persona with no pending changes, reset unsaved flag
      const hasPendingForThisPersona = pendingChanges[selectedPersona];
      if (!hasPendingForThisPersona) {
        setHasUnsavedChanges(Object.keys(pendingChanges).length > 0);
      }
    }
  }, [selectedPersona, pendingChanges]);

  // Fetch reflection areas  
  const { data: reflectionAreasData, isLoading: areasLoading } = useQuery<{success: boolean; areas: ReflectionArea[]}>({
    queryKey: ['/api/admin/ai/reflection-areas'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ai/reflection-areas', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch reflection areas');
      }
      
      return response.json();
    },
    refetchInterval: 30000,
  });

  // Fetch detailed persona documents with processing status
  const { data: documentsData, isLoading: documentsLoading } = useQuery<{success: boolean; documents: TrainingDocument[]}>({
    queryKey: ['persona-documents'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ai/persona-documents', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch persona documents');
      }
      return response.json();
    },
    refetchInterval: 30000,
  });

  // Update persona mutation
  const updatePersonaMutation = useMutation({
    mutationFn: async ({ personaId, updates, preserveEditMode = false }: { personaId: string; updates: Partial<TaliaPersona>; preserveEditMode?: boolean }) => {
      const response = await fetch(`/api/admin/ai/personas/${personaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update persona');
      }
      
      return { data: await response.json(), preserveEditMode, personaId, updates };
    },
    onSuccess: async (result) => {
      const { preserveEditMode } = result;
      
      // Invalidate and refetch immediately
      await queryClient.invalidateQueries({ queryKey: ['/api/admin/ai/personas'] });
      await refetchPersonas();
      
      if (!preserveEditMode) {
        setEditingMode(false);
      }
    },
    onError: () => {
      // Revert optimistic update on error by refetching
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai/personas'] });
      refetchPersonas();
    },
  });

  // Update reflection area mutation
  const updateReflectionAreaMutation = useMutation({
    mutationFn: async ({ areaId, updates }: { areaId: string; updates: Partial<ReflectionArea> }) => {
      const response = await fetch(`/api/admin/ai/reflection-areas/${areaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update reflection area');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai/reflection-areas'] });
    },
  });

  const personas = personasData?.personas || [];
  const reflectionAreas = reflectionAreasData?.areas || [];
  const documents = documentsData?.documents || [];
  const currentPersona = personas.find(p => p.id === selectedPersona);

  // Debug logging
  React.useEffect(() => {
    if (personasError) {
      console.error('🔧 Personas query error:', personasError);
    }
    if (personasLoading) {
      console.log('🔧 Personas loading...');
    }
    if (personas.length > 0) {
      console.log('🔍 Current personas data:', personas.map(p => ({ id: p.id, name: p.name, enabled: p.enabled })));
      console.log('🔍 DETAILED persona states:', personas.map(p => ({ 
        id: p.id, 
        enabled: p.enabled, 
        enabledType: typeof p.enabled,
        enabledString: String(p.enabled)
      })));
    }
  }, [personas, personasError, personasLoading]);

  const handleDocumentToggle = (documentId: string, checked: boolean) => {
    if (!currentPersona) return;
    
    const currentDocs = pendingChanges[selectedPersona] || currentPersona.trainingDocuments;
    const updatedDocs = checked 
      ? [...currentDocs, documentId]
      : currentDocs.filter(id => id !== documentId);

    setPendingChanges(prev => ({
      ...prev,
      [selectedPersona]: updatedDocs
    }));
    setHasUnsavedChanges(true);
  };

  const handleReflectionAreaToggle = (areaId: string, enabled: boolean) => {
    updateReflectionAreaMutation.mutate({
      areaId,
      updates: { enabled }
    });
  };

  const handlePersonaToggle = (personaId: string, enabled: boolean) => {
    console.log(`🔧 Toggling persona ${personaId} to ${enabled}`);
    
    // Optimistic update: immediately update local state
    queryClient.setQueryData(['/api/admin/ai/personas'], (oldData: any) => {
      if (!oldData) return oldData;
      
      const updatedPersonas = oldData.personas.map((persona: TaliaPersona) => 
        persona.id === personaId ? { ...persona, enabled } : persona
      );
      
      console.log(`🔧 Optimistic update applied:`, updatedPersonas.find(p => p.id === personaId));
      
      return {
        ...oldData,
        personas: updatedPersonas
      };
    });

    updatePersonaMutation.mutate({
      personaId,
      updates: { enabled },
      preserveEditMode: true
    });
  };

  // Filter documents based on show/hide inactive setting
  const getCurrentDocuments = (personaId: string): string[] => {
    const persona = personas.find(p => p.id === personaId);
    return pendingChanges[personaId] || persona?.trainingDocuments || [];
  };

  const filteredDocuments = showInactiveDocuments 
    ? documents 
    : documents.filter(doc => 
        getCurrentDocuments(selectedPersona).includes(doc.id) || 
        doc.assignedToPersonas.includes(selectedPersona)
      );

  // Group filtered documents by type
  const groupedDocuments = filteredDocuments.reduce((groups, doc) => {
    const type = doc.document_type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(doc);
    return groups;
  }, {} as Record<string, TrainingDocument[]>);

  const toggleGroup = (groupType: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupType)) {
        newSet.delete(groupType);
      } else {
        newSet.add(groupType);
      }
      return newSet;
    });
  };

  const handleGroupToggle = (groupType: string, selectAll: boolean) => {
    if (!currentPersona) return;
    
    const groupDocIds = groupedDocuments[groupType]?.map(doc => doc.id) || [];
    const currentDocs = pendingChanges[selectedPersona] || currentPersona.trainingDocuments;
    let updatedDocs = [...currentDocs];
    
    if (selectAll) {
      // Add all documents from this group that aren't already selected
      groupDocIds.forEach(docId => {
        if (!updatedDocs.includes(docId)) {
          updatedDocs.push(docId);
        }
      });
    } else {
      // Remove all documents from this group
      updatedDocs = updatedDocs.filter(docId => !groupDocIds.includes(docId));
    }

    setPendingChanges(prev => ({
      ...prev,
      [selectedPersona]: updatedDocs
    }));
    setHasUnsavedChanges(true);
  };

  const getGroupSelectionState = (groupType: string): 'all' | 'none' | 'partial' => {
    if (!currentPersona) return 'none';
    
    const groupDocIds = groupedDocuments[groupType]?.map(doc => doc.id) || [];
    const currentDocs = pendingChanges[selectedPersona] || currentPersona.trainingDocuments;
    const selectedCount = groupDocIds.filter(id => currentDocs.includes(id)).length;
    
    if (selectedCount === 0) return 'none';
    if (selectedCount === groupDocIds.length) return 'all';
    return 'partial';
  };

  const handleSaveChanges = () => {
    if (!currentPersona || !pendingChanges[selectedPersona]) return;
    
    updatePersonaMutation.mutate({
      personaId: selectedPersona,
      updates: { trainingDocuments: pendingChanges[selectedPersona] },
      preserveEditMode: true
    });
    
    // Clear pending changes for this persona
    setPendingChanges(prev => {
      const newChanges = { ...prev };
      delete newChanges[selectedPersona];
      return newChanges;
    });
    
    // Update hasUnsavedChanges based on remaining changes
    setTimeout(() => {
      setPendingChanges(current => {
        setHasUnsavedChanges(Object.keys(current).length > 0);
        return current;
      });
    }, 0);
  };

  const handleCancelChanges = () => {
    // Clear pending changes for this persona
    setPendingChanges(prev => {
      const newChanges = { ...prev };
      delete newChanges[selectedPersona];
      return newChanges;
    });
    
    // Update hasUnsavedChanges based on remaining changes
    setTimeout(() => {
      setPendingChanges(current => {
        setHasUnsavedChanges(Object.keys(current).length > 0);
        return current;
      });
    }, 0);
  };

  const handleTrainingSubmit = async () => {
    if (!trainingText.trim() || !selectedPersona) return;
    
    setIsSubmittingTraining(true);
    
    try {
      const response = await fetch('/api/training-docs/add-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          personaId: selectedPersona,
          trainingText: trainingText.trim()
        }),
      });
      
      if (response.ok) {
        setTrainingText('');
        // Could add a success notification here
        console.log('✅ Training text submitted successfully');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit training text');
      }
    } catch (error) {
      console.error('❌ Error submitting training text:', error);
      // Could add an error notification here
    } finally {
      setIsSubmittingTraining(false);
    }
  };


  const formatDocumentType = (type: string): string => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getProcessingStatusBadge = (doc: TrainingDocument) => {
    if (doc.processing_status === 'processed') {
      return (
        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
          ✓ Processed ({doc.chunk_count} chunks)
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
          ⏳ Pending
        </Badge>
      );
    }
  };

  const getEnvironmentBadgeColor = (env: string): string => {
    switch (env) {
      case 'development':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'staging':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'production':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEnvironmentIcon = (env: string): string => {
    switch (env) {
      case 'development':
        return '🔧';
      case 'staging':
        return '🚀';
      case 'production':
        return '🌐';
      default:
        return '❓';
    }
  };

  if (personasLoading || areasLoading || documentsLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span>Loading Persona Management...</span>
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
            <Users className="h-6 w-6" />
            Persona Management
            <Badge className={getEnvironmentBadgeColor(currentEnvironment)}>
              {getEnvironmentIcon(currentEnvironment)} {currentEnvironment.toUpperCase()}
            </Badge>
          </h1>
          <p className="text-gray-600 mt-1">
            Configure Talia personas, their document access, and reflection area availability
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Persona
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Persona List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Available Personas
            </CardTitle>
            <CardDescription>
              Select a persona to configure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {personas.map((persona) => (
                <div 
                  key={persona.id} 
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPersona === persona.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPersona(persona.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="mb-1">
                        <h3 className="font-medium">{persona.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{persona.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={Boolean(persona?.enabled)}
                        onCheckedChange={(checked) => handlePersonaToggle(persona.id, checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Badge variant={Boolean(persona?.enabled) ? 'default' : 'secondary'}>
                        {Boolean(persona?.enabled) ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Persona Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {currentPersona?.name || 'Select Persona'}
                  {currentPersona && (
                    <div className="flex gap-1 ml-2">
                      {(currentPersona?.environments || []).map((env) => (
                        <Badge 
                          key={env} 
                          variant="outline" 
                          className={`text-xs ${getEnvironmentBadgeColor(env)}`}
                        >
                          {getEnvironmentIcon(env)} {env}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardTitle>
                <CardDescription>
                  {currentPersona?.description || 'Choose a persona to configure'}
                </CardDescription>
              </div>
              {currentPersona && (
                <Button
                  variant="outline"
                  onClick={() => setEditingMode(!editingMode)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  {editingMode ? 'Cancel' : 'Edit'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {currentPersona ? (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Token Limit
                    </label>
                    <Input
                      type="number"
                      value={currentPersona.tokenLimit}
                      disabled={!editingMode}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Response Length
                    </label>
                    <Input
                      type="number"
                      value={currentPersona.behavior.maxResponseLength}
                      disabled={!editingMode}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Required Documents */}
                {currentPersona.requiredDocumentNames && currentPersona.requiredDocumentNames.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-red-600" />
                      Required Documents
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        Always Active
                      </Badge>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                      {(currentPersona?.requiredDocumentNames || []).map((docName, index) => (
                        <div key={currentPersona.requiredDocuments?.[index] || docName} className="p-3 border rounded-lg bg-red-50 border-red-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-red-900">{docName}</h4>
                              <p className="text-sm text-red-700">Required for this persona role</p>
                            </div>
                            <CheckCircle className="h-5 w-5 text-red-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Document Summary */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {getCurrentDocuments(selectedPersona).length}
                      </div>
                      <div className="text-sm text-gray-600">Documents Enabled</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {documents.filter(doc => 
                          getCurrentDocuments(selectedPersona).includes(doc.id) && 
                          doc.processing_status === 'processed'
                        ).length}
                      </div>
                      <div className="text-sm text-gray-600">Processed & Ready</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {documents.filter(doc => 
                          getCurrentDocuments(selectedPersona).includes(doc.id) && 
                          doc.processing_status === 'pending'
                        ).length}
                      </div>
                      <div className="text-sm text-gray-600">Processing Pending</div>
                    </div>
                  </div>
                </div>

                {/* Optional Training Documents */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Optional Training Documents
                      <Badge variant="outline" className="text-gray-600">
                        {showInactiveDocuments ? documents.length : filteredDocuments.length} visible
                      </Badge>
                      {!showInactiveDocuments && (
                        <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                          Inactive Hidden
                        </Badge>
                      )}
                    </h3>
                    <div className="flex items-center gap-3">
                      {/* Show/Hide Inactive Toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Show inactive</span>
                        <Switch
                          checked={showInactiveDocuments}
                          onCheckedChange={setShowInactiveDocuments}
                        />
                      </div>
                      
                      {editingMode && (
                        <div className="flex items-center gap-2">
                          {pendingChanges[selectedPersona] && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelChanges}
                                className="text-gray-600"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleSaveChanges}
                                disabled={updatePersonaMutation.isPending}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {updatePersonaMutation.isPending ? 'Saving...' : 'Save Changes'}
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(groupedDocuments).map(([type, docs]) => {
                      const isExpanded = expandedGroups.has(type);
                      const selectionState = getGroupSelectionState(type);
                      
                      return (
                        <div key={type} className="border rounded-lg overflow-hidden">
                          {/* Group Header */}
                          <div className="bg-gray-50 p-3 border-b">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => toggleGroup(type)}
                                  className="text-gray-600 hover:text-gray-800"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </button>
                                <h4 className="font-medium text-gray-900">
                                  {formatDocumentType(type)}
                                </h4>
                                <Badge variant="secondary" className="text-xs">
                                  {docs.length} documents
                                </Badge>
                                {selectionState !== 'none' && (
                                  <Badge 
                                    variant={selectionState === 'all' ? 'default' : 'outline'}
                                    className="text-xs"
                                  >
                                    {selectionState === 'all' ? 'All Selected' : 
                                     selectionState === 'partial' ? 'Partial' : ''}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleGroupToggle(type, true)}
                                  disabled={!editingMode || selectionState === 'all'}
                                  className="h-7 px-2 text-xs"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Select All
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleGroupToggle(type, false)}
                                  disabled={!editingMode || selectionState === 'none'}
                                  className="h-7 px-2 text-xs"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Deselect All
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Group Documents */}
                          {isExpanded && (
                            <div className="p-3">
                              <div className="grid grid-cols-1 gap-3">
                                {docs.map((doc) => (
                                  <div key={doc.id} className="p-4 border rounded-lg bg-white">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h5 className="font-medium text-sm truncate">{doc.title}</h5>
                                          {getCurrentDocuments(selectedPersona).includes(doc.id) && (
                                            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 text-xs">
                                              Active
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-600 mb-2">{doc.category || 'No category'}</p>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                          <span>Updated {formatDate(doc.updated_at)}</span>
                                          {doc.assignedToPersonas.length > 0 && (
                                            <span>• Used by {doc.assignedToPersonas.length} persona{doc.assignedToPersonas.length !== 1 ? 's' : ''}</span>
                                          )}
                                        </div>
                                      </div>
                                      <Switch
                                        checked={getCurrentDocuments(selectedPersona).includes(doc.id)}
                                        onCheckedChange={(checked) => handleDocumentToggle(doc.id, checked)}
                                        disabled={!editingMode}
                                      />
                                    </div>
                                    <div className="flex items-center justify-between">
                                      {getProcessingStatusBadge(doc)}
                                      {doc.assignedToPersonas.includes(selectedPersona) && (
                                        <span className="text-xs text-blue-600 font-medium">
                                          Currently enabled for {personas.find(p => p.id === selectedPersona)?.name}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Training Data Editor */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Training Data Editor
                    <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                      Direct Edit
                    </Badge>
                  </h3>
                  <TrainingDataEditor personaId={selectedPersona} />
                </div>

                {/* Training Text Entry (for ast_reflection persona only) */}
                {selectedPersona === 'ast_reflection' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Talia Training
                    </h3>
                    <div className="p-4 border rounded-lg">
                      <div className="mb-3">
                        <h4 className="font-medium mb-2">Add Training Context</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Enter training information that will help Talia provide better coaching. This content will be added to her permanent training context.
                        </p>
                        <Textarea
                          placeholder="Enter training context, behavioral guidelines, or coaching improvements for Talia..."
                          className="min-h-24 mb-3"
                          value={trainingText}
                          onChange={(e) => setTrainingText(e.target.value)}
                          disabled={!editingMode}
                        />
                        <Button
                          size="sm"
                          onClick={handleTrainingSubmit}
                          disabled={!editingMode || !trainingText.trim() || isSubmittingTraining}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isSubmittingTraining ? 'Adding...' : 'Add to Training'}
                        </Button>
                      </div>
                      <Alert>
                        <Brain className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Training Mode:</strong> Type "TRAIN" (all caps) when chatting with Reflection Talia to enter interactive training mode for real-time coaching improvements.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                )}

                {/* Reflection Areas (for ast_reflection persona only) */}
                {selectedPersona === 'ast_reflection' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Reflection Areas
                    </h3>
                    <div className="space-y-3">
                      {reflectionAreas.map((area) => (
                        <div key={area.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{area.name}</h4>
                              <p className="text-sm text-gray-600">{area.description}</p>
                              <p className="text-xs text-gray-500">Workshop Step: {area.workshopStep}</p>
                            </div>
                            <Switch
                              checked={Boolean(area?.enabled)}
                              onCheckedChange={(checked) => handleReflectionAreaToggle(area.id, checked)}
                            />
                          </div>
                          {!area.enabled && area.fallbackText && (
                            <Alert className="mt-2">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                <strong>Fallback:</strong> {area.fallbackText}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Report Talia Features (for report personas only) */}
                {(() => {
                  console.log('🔍 Current selected persona:', selectedPersona);
                  console.log('🔍 Checking if should show ReportTaliaFeatures:', selectedPersona === 'star_report');
                  return selectedPersona === 'star_report' ? <ReportTaliaFeatures /> : null;
                })()}

                {/* Data Access */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Data Access</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {(currentPersona?.dataAccess || []).map((access) => (
                      <Badge key={access} variant="outline" className="justify-center">
                        {access.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Select a persona from the left to configure its settings
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Persona Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{personas.length}</div>
              <div className="text-sm text-gray-600">Total Personas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {personas.filter(p => p.enabled).length}
              </div>
              <div className="text-sm text-gray-600">Active Personas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{reflectionAreas.length}</div>
              <div className="text-sm text-gray-600">Reflection Areas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {reflectionAreas.filter(a => a.enabled).length}
              </div>
              <div className="text-sm text-gray-600">Active Areas</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}