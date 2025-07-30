import React, { useState, useEffect } from 'react';
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
  X
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
}

export default function PersonaManagement() {
  const [selectedPersona, setSelectedPersona] = useState<string>('ast_reflection');
  const [editingMode, setEditingMode] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['coaching_guide', 'report_template']));
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, string[]>>({});
  const [currentEnvironment, setCurrentEnvironment] = useState<string>('development');
  const [trainingText, setTrainingText] = useState('');
  const [isSubmittingTraining, setIsSubmittingTraining] = useState(false);
  const queryClient = useQueryClient();

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

  // Fetch available training documents
  const { data: documentsData, isLoading: documentsLoading } = useQuery<{success: boolean; documents: TrainingDocument[]}>({
    queryKey: ['/api/training-docs/documents'],
    refetchInterval: 60000,
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

  // Group documents by type
  const groupedDocuments = documents.reduce((groups, doc) => {
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

  // Get current document list (pending or saved)
  const getCurrentDocuments = (personaId: string): string[] => {
    const persona = personas.find(p => p.id === personaId);
    return pendingChanges[personaId] || persona?.trainingDocuments || [];
  };

  const formatDocumentType = (type: string): string => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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

                {/* Optional Training Documents */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Optional Training Documents
                    </h3>
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
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {docs.map((doc) => (
                                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                                    <div>
                                      <h5 className="font-medium text-sm">{doc.title}</h5>
                                      <p className="text-xs text-gray-600">{doc.category || 'No category'}</p>
                                    </div>
                                    <Switch
                                      checked={getCurrentDocuments(selectedPersona).includes(doc.id)}
                                      onCheckedChange={(checked) => handleDocumentToggle(doc.id, checked)}
                                      disabled={!editingMode}
                                    />
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