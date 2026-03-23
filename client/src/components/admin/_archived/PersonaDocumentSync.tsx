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
  Database, 
  Cloud, 
  Upload,
  Download,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  FileText,
  Bot,
  Trash2,
  Edit,
  Plus,
  ChevronDown,
  ChevronRight,
  Eye,
  Settings
} from 'lucide-react';

interface PersonaConfig {
  id: string;
  name: string;
  type: 'reflection' | 'report' | 'admin';
  vectorStoreId: string;
  apiKey: string;
  enabled: boolean;
  postgresDocuments: Document[];
  openaiDocuments: OpenAIDocument[];
  syncStatus: 'synced' | 'partial' | 'unsynced' | 'error';
  lastSync: string | null;
}

interface Document {
  id: string;
  title: string;
  content: string;
  type: string;
  category: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  file_size: number;
  openaiFileId?: string;
  syncStatus: 'pending' | 'uploading' | 'synced' | 'error';
}

interface OpenAIDocument {
  id: string;
  filename: string;
  bytes: number;
  created_at: number;
  purpose: string;
  status: string;
  postgresDocumentId?: string;
}

interface SyncOperation {
  id: string;
  type: 'upload' | 'update' | 'delete';
  documentId: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message: string;
  timestamp: string;
}

const PersonaDocumentSync: React.FC = () => {
  const [selectedPersona, setSelectedPersona] = useState<string>('');
  const [syncOperations, setSyncOperations] = useState<SyncOperation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState('training');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Fetch persona configurations
  const { data: personas = [], refetch: refetchPersonas } = useQuery({
    queryKey: ['persona-sync-configs'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ai/persona-sync-configs', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch persona configs');
      return response.json();
    }
  });

  // Fetch sync status for selected persona
  const { data: syncStatus, refetch: refetchSyncStatus } = useQuery({
    queryKey: ['persona-sync-status', selectedPersona],
    queryFn: async () => {
      if (!selectedPersona) return null;
      const response = await fetch(`/api/admin/ai/persona-sync-status/${selectedPersona}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch sync status');
      return response.json();
    },
    enabled: !!selectedPersona
  });

  // Sync documents mutation
  const syncDocumentsMutation = useMutation({
    mutationFn: async ({ personaId, operation }: { personaId: string; operation: 'full' | 'incremental' }) => {
      const response = await fetch(`/api/admin/ai/sync-documents/${personaId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ operation })
      });
      if (!response.ok) throw new Error('Sync failed');
      return response.json();
    },
    onSuccess: () => {
      refetchSyncStatus();
      refetchPersonas();
    }
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/admin/ai/upload-document', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      setShowUploadDialog(false);
      setUploadFile(null);
      refetchSyncStatus();
    }
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async ({ documentId, fromOpenAI }: { documentId: string; fromOpenAI: boolean }) => {
      const response = await fetch(`/api/admin/ai/delete-document/${documentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fromOpenAI })
      });
      if (!response.ok) throw new Error('Delete failed');
      return response.json();
    },
    onSuccess: () => {
      refetchSyncStatus();
    }
  });

  const handleFileUpload = () => {
    if (!uploadFile || !selectedPersona) return;

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('personaId', selectedPersona);
    formData.append('category', uploadCategory);
    formData.append('autoSync', 'true');

    uploadDocumentMutation.mutate(formData);
  };

  const toggleCardExpansion = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  const getSyncStatusBadge = (status: string) => {
    const statusMap = {
      'synced': { color: 'bg-green-100 text-green-800', icon: Check },
      'partial': { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      'unsynced': { color: 'bg-red-100 text-red-800', icon: X },
      'error': { color: 'bg-red-100 text-red-800', icon: AlertTriangle }
    };
    
    const config = statusMap[status] || statusMap['error'];
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Persona & Document Sync</h2>
          <p className="text-gray-600">Manage synchronization between PostgreSQL and OpenAI vector stores</p>
        </div>
        <Button 
          onClick={() => setShowUploadDialog(true)}
          disabled={!selectedPersona}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Upload Document
        </Button>
      </div>

      {/* Persona Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Select Persona
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {personas.map((persona: PersonaConfig) => (
              <Card 
                key={persona.id}
                className={`cursor-pointer transition-all ${
                  selectedPersona === persona.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedPersona(persona.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{persona.name}</h3>
                    {getSyncStatusBadge(persona.syncStatus)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Type: {persona.type}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Database className="w-3 h-3" />
                    {persona.postgresDocuments?.length || 0} docs
                    <Cloud className="w-3 h-3" />
                    {persona.openaiDocuments?.length || 0} files
                  </div>
                  {persona.lastSync && (
                    <p className="text-xs text-gray-400 mt-1">
                      Last sync: {new Date(persona.lastSync).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sync Status and Controls */}
      {selectedPersona && syncStatus && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Sync Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => syncDocumentsMutation.mutate({ 
                    personaId: selectedPersona, 
                    operation: 'incremental' 
                  })}
                  disabled={syncDocumentsMutation.isPending}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${syncDocumentsMutation.isPending ? 'animate-spin' : ''}`} />
                  Incremental Sync
                </Button>
                
                <Button
                  onClick={() => syncDocumentsMutation.mutate({ 
                    personaId: selectedPersona, 
                    operation: 'full' 
                  })}
                  disabled={syncDocumentsMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${syncDocumentsMutation.isPending ? 'animate-spin' : ''}`} />
                  Full Sync
                </Button>
                
                <div className="ml-auto">
                  {getSyncStatusBadge(syncStatus.overallStatus)}
                </div>
              </div>
              
              {syncStatus.summary && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Sync Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">PostgreSQL:</span>
                      <span className="font-medium ml-1">{syncStatus.summary.postgresCount} docs</span>
                    </div>
                    <div>
                      <span className="text-gray-600">OpenAI:</span>
                      <span className="font-medium ml-1">{syncStatus.summary.openaiCount} files</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Synced:</span>
                      <span className="font-medium ml-1">{syncStatus.summary.syncedCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Pending:</span>
                      <span className="font-medium ml-1">{syncStatus.summary.pendingCount}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PostgreSQL Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  PostgreSQL Documents
                  <Badge variant="outline">{syncStatus.postgresDocuments?.length || 0}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {syncStatus.postgresDocuments?.map((doc: Document) => (
                    <div key={doc.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{doc.title}</h4>
                          <p className="text-xs text-gray-500">
                            {doc.category} • {(doc.file_size / 1024).toFixed(1)}KB
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSyncStatusBadge(doc.syncStatus)}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteDocumentMutation.mutate({ 
                              documentId: doc.id, 
                              fromOpenAI: false 
                            })}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      {doc.openaiFileId && (
                        <p className="text-xs text-blue-600 mt-1">
                          OpenAI File: {doc.openaiFileId}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* OpenAI Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="w-5 h-5" />
                  OpenAI Vector Store
                  <Badge variant="outline">{syncStatus.openaiDocuments?.length || 0}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {syncStatus.openaiDocuments?.map((doc: OpenAIDocument) => (
                    <div key={doc.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{doc.filename}</h4>
                          <p className="text-xs text-gray-500">
                            {doc.status} • {(doc.bytes / 1024).toFixed(1)}KB
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={doc.postgresDocumentId ? "default" : "secondary"}>
                            {doc.postgresDocumentId ? 'Linked' : 'Orphaned'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteDocumentMutation.mutate({ 
                              documentId: doc.id, 
                              fromOpenAI: true 
                            })}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Created: {new Date(doc.created_at * 1000).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a new document to PostgreSQL and automatically sync to OpenAI
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">File</label>
              <Input
                type="file"
                accept=".txt,.md,.pdf,.docx"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="training">Training Material</SelectItem>
                  <SelectItem value="guidelines">Guidelines</SelectItem>
                  <SelectItem value="examples">Examples</SelectItem>
                  <SelectItem value="reference">Reference</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleFileUpload}
                disabled={!uploadFile || uploadDocumentMutation.isPending}
              >
                {uploadDocumentMutation.isPending ? 'Uploading...' : 'Upload & Sync'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonaDocumentSync;