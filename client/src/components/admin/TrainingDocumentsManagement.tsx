import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Alert, AlertDescription } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';
import PersonaManagement from './PersonaManagement';
import { 
  Upload, 
  FileText, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  Clock,
  BookOpen,
  Database,
  BarChart3,
  Users
} from 'lucide-react';

interface TrainingDocument {
  id: string;
  title: string;
  document_type: string;
  category: string;
  tags: string[];
  version: string;
  status: string;
  file_size: number;
  file_type: string;
  original_filename: string;
  uploaded_by: number;
  created_at: string;
  updated_at: string;
  content_length: number;
  chunk_count?: number;
}

interface DocumentType {
  value: string;
  label: string;
  description: string;
}

interface DocumentStats {
  by_type: Array<{ document_type: string; count: number; active_count: number }>;
  processing: Array<{ job_type: string; status: string; count: number }>;
  totals: {
    total_documents: number;
    active_documents: number;
    total_size: number;
    avg_size: number;
  };
  chunks: {
    total_chunks: number;
    avg_tokens_per_chunk: number;
    documents_with_chunks: number;
  };
}

const TrainingDocumentsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<TrainingDocument | null>(null);
  const [editingDocument, setEditingDocument] = useState<TrainingDocument | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<TrainingDocument | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch training documents
  const {
    data: documentsData,
    isLoading: documentsLoading,
    error: documentsError
  } = useQuery({
    queryKey: ['training-documents', currentPage, searchTerm, selectedType, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      
      if (searchTerm) params.set('search', searchTerm);
      if (selectedType && selectedType !== 'all') params.set('document_type', selectedType);
      if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
      
      const response = await fetch(`/api/training-docs/documents?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch training documents');
      }
      
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch document types and categories
  const {
    data: documentTypesData,
    isLoading: typesLoading
  } = useQuery({
    queryKey: ['document-types'],
    queryFn: async () => {
      const response = await fetch('/api/training-docs/document-types', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch document types');
      }
      
      return response.json();
    },
  });

  // Fetch statistics
  const {
    data: statsData,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['training-stats'],
    queryFn: async () => {
      const response = await fetch('/api/training-docs/stats', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch training statistics');
      }
      
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const stats: DocumentStats | undefined = statsData?.stats;
  const documents: TrainingDocument[] = documentsData?.documents || [];
  const documentTypes: DocumentType[] = documentTypesData?.document_types || [];
  const categories: string[] = documentTypesData?.categories || [];

  // Document upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/training-docs/documents', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload document');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-documents'] });
      queryClient.invalidateQueries({ queryKey: ['training-stats'] });
      setShowUploadDialog(false);
    },
  });

  // Document delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/training-docs/documents/${documentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete document');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-documents'] });
      queryClient.invalidateQueries({ queryKey: ['training-stats'] });
    },
  });

  // Document update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ documentId, updates }: { documentId: string; updates: any }) => {
      const response = await fetch(`/api/training-docs/documents/${documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update document');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-documents'] });
      queryClient.invalidateQueries({ queryKey: ['training-stats'] });
      setEditingDocument(null);
    },
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      coaching_guide: 'bg-blue-100 text-blue-800',
      report_template: 'bg-green-100 text-green-800',
      assessment_framework: 'bg-purple-100 text-purple-800',
      best_practices: 'bg-yellow-100 text-yellow-800',
      strengths_theory: 'bg-indigo-100 text-indigo-800',
      flow_research: 'bg-pink-100 text-pink-800',
      team_dynamics: 'bg-orange-100 text-orange-800',
      industry_guidance: 'bg-teal-100 text-teal-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleDeleteDocument = (document: TrainingDocument) => {
    setShowDeleteConfirm(document);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      deleteMutation.mutate(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
    }
  };

  const handleEditDocument = (document: TrainingDocument) => {
    setEditingDocument(document);
  };

  if (documentsLoading || typesLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner className="h-8 w-8" />
        <span className="ml-3 text-lg">Loading Training Documents...</span>
      </div>
    );
  }

  if (documentsError) {
    return (
      <Alert className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load training documents. Please check your permissions and try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Training Documents</h2>
          <p className="text-gray-600">Manage AI training documents for enhanced coaching and reports</p>
        </div>
        <Button 
          onClick={() => setShowUploadDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="personas" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Personas
          </TabsTrigger>
          <TabsTrigger value="processing" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Processing
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {stats && (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totals.total_documents}</div>
                    <p className="text-sm text-green-600">
                      {stats.totals.active_documents} active
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Chunks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.chunks.total_chunks}</div>
                    <p className="text-sm text-gray-600">
                      {Math.round(stats.chunks.avg_tokens_per_chunk || 0)} avg tokens
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Storage Used</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatFileSize(stats.totals.total_size || 0)}</div>
                    <p className="text-sm text-gray-600">
                      {formatFileSize(stats.totals.avg_size || 0)} avg
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Processing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.chunks.documents_with_chunks}</div>
                    <p className="text-sm text-gray-600">documents processed</p>
                  </CardContent>
                </Card>
              </div>

              {/* Document Types Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Documents by Type</CardTitle>
                  <CardDescription>Distribution of training documents across different categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.by_type.map((type) => (
                      <div key={type.document_type} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium capitalize">
                            {type.document_type.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-gray-600">
                            {type.active_count} / {type.count}
                          </div>
                        </div>
                        <Badge className={getTypeColor(type.document_type)}>
                          {type.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('');
                    setSelectedCategory('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Documents List */}
          <div className="grid gap-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{doc.title}</h3>
                        {getStatusIcon(doc.status)}
                        <Badge className={getTypeColor(doc.document_type)}>
                          {doc.document_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Category:</span> {doc.category || 'None'}
                        </div>
                        <div>
                          <span className="font-medium">Version:</span> {doc.version}
                        </div>
                        <div>
                          <span className="font-medium">Size:</span> {formatFileSize(doc.file_size)}
                        </div>
                        <div>
                          <span className="font-medium">Content:</span> {doc.content_length.toLocaleString()} chars
                        </div>
                      </div>

                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {doc.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        Created: {new Date(doc.created_at).toLocaleDateString()} 
                        {doc.original_filename && ` • File: ${doc.original_filename}`}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedDocument(doc)}
                        title="View document"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditDocument(doc)}
                        title="Edit document"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteDocument(doc)}
                        title="Delete document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {documentsData?.pagination && (
            <div className="flex justify-center gap-2">
              <Button 
                variant="outline" 
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="px-4 py-2">
                Page {currentPage} of {documentsData.pagination.pages}
              </span>
              <Button 
                variant="outline" 
                disabled={currentPage >= documentsData.pagination.pages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Personas Tab */}
        <TabsContent value="personas" className="space-y-6">
          <PersonaManagement />
        </TabsContent>

        {/* Processing Tab */}
        <TabsContent value="processing" className="space-y-6">
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Processing Status</CardTitle>
                <CardDescription>Document chunking and embedding generation status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats.processing.map((job, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium capitalize">{job.job_type}</div>
                        <div className="text-sm text-gray-600 capitalize">{job.status}</div>
                      </div>
                      <Badge variant="secondary">{job.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <UploadDocumentDialog 
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        documentTypes={documentTypes}
        categories={categories}
        onUpload={uploadMutation.mutate}
        isUploading={uploadMutation.isPending}
        error={uploadMutation.error?.message}
      />

      {/* Document Detail Dialog */}
      {selectedDocument && (
        <DocumentDetailDialog 
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}

      {/* Edit Document Dialog */}
      {editingDocument && (
        <EditDocumentDialog 
          document={editingDocument}
          documentTypes={documentTypes}
          categories={categories}
          onClose={() => setEditingDocument(null)}
          onUpdate={(updates) => updateMutation.mutate({ documentId: editingDocument.id, updates })}
          isUpdating={updateMutation.isPending}
          error={updateMutation.error?.message}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <Dialog open={true} onOpenChange={() => setShowDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Document</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{showDeleteConfirm.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Upload Document Dialog Component
interface UploadDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  documentTypes: DocumentType[];
  categories: string[];
  onUpload: (formData: FormData) => void;
  isUploading: boolean;
  error?: string;
}

const UploadDocumentDialog: React.FC<UploadDocumentDialogProps> = ({
  open,
  onClose,
  documentTypes,
  categories,
  onUpload,
  isUploading,
  error
}) => {
  const [formData, setFormData] = useState({
    title: '',
    document_type: '',
    category: '',
    tags: '',
    version: '1.0',
    content: ''
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    
    if (file) {
      data.append('file', file);
    }
    
    onUpload(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-fill title if not set
      if (!formData.title) {
        setFormData(prev => ({
          ...prev,
          title: selectedFile.name.replace(/\.[^/.]+$/, "")
        }));
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Training Document</DialogTitle>
          <DialogDescription>
            Add a new training document for AI coaching and report generation
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Document title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Document Type</label>
              <Select 
                value={formData.document_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, document_type: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Category
                <span className="text-xs text-gray-500 font-normal ml-2">
                  (Optional - helps organize documents, e.g., "AST Workshop", "Report Generation", "Strengths Analysis")
                </span>
              </label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., AST Workshop, Report Generation, Strengths Analysis"
                list="categories"
              />
              <datalist id="categories">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Version</label>
              <Input
                value={formData.version}
                onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                placeholder="1.0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
            <Input
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="coaching, strengths, development"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Upload File</label>
            <Input
              type="file"
              onChange={handleFileChange}
              accept=".txt,.md,.pdf,.doc,.docx"
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: Text (.txt), Markdown (.md), PDF (.pdf), Word (.doc, .docx)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content (optional if file uploaded)</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Paste document content here..."
              rows={8}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Edit Document Dialog Component
interface EditDocumentDialogProps {
  document: TrainingDocument;
  documentTypes: DocumentType[];
  categories: string[];
  onClose: () => void;
  onUpdate: (updates: any) => void;
  isUpdating: boolean;
  error?: string;
}

const EditDocumentDialog: React.FC<EditDocumentDialogProps> = ({
  document,
  documentTypes,
  categories,
  onClose,
  onUpdate,  
  isUpdating,
  error
}) => {
  const [activeTab, setActiveTab] = useState('metadata');
  const [formData, setFormData] = useState({
    title: document.title,
    document_type: document.document_type,
    category: document.category || '',
    tags: document.tags?.join(', ') || '',
    version: document.version,
    status: document.status
  });
  const [documentContent, setDocumentContent] = useState<string>('');
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState<string>('');

  // Fetch document content when switching to content tab
  useEffect(() => {
    if (activeTab === 'content' && !documentContent && !contentLoading) {
      fetchDocumentContent();
    }
  }, [activeTab]);

  const fetchDocumentContent = async () => {
    setContentLoading(true);
    setContentError('');
    try {
      const response = await fetch(`/api/admin/ai/training-docs/${document.id}/content`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setDocumentContent(data.document.content);
      } else {
        setContentError(data.error || 'Failed to load content');
      }
    } catch (err) {
      setContentError('Failed to load document content');
    } finally {
      setContentLoading(false);
    }
  };

  const handleMetadataSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleContentSave = async () => {
    try {
      const response = await fetch(`/api/admin/ai/training-docs/${document.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: documentContent }),
        credentials: 'include'
      });
      
      const data = await response.json();
      if (data.success) {
        // Refresh the document list
        window.location.reload(); // Simple refresh for now
      } else {
        setContentError(data.error || 'Failed to save content');
      }
    } catch (err) {
      setContentError('Failed to save content');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Document: {document.title}</DialogTitle>
          <DialogDescription>
            Update document metadata or edit content directly
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="metadata" className="mt-4">
            <form onSubmit={handleMetadataSubmit} className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Document title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Document Type</label>
              <Select 
                value={formData.document_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, document_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Document category"
                list="edit-categories"
              />
              <datalist id="edit-categories">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Version</label>
              <Input
                value={formData.version}
                onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                placeholder="1.0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
            <Input
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="coaching, strengths, development"
            />
          </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={isUpdating}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Updating...' : 'Update Metadata'}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="content" className="mt-4">
            <div className="space-y-4">
              {contentError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{contentError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">Document Content</label>
                {contentLoading ? (
                  <div className="flex items-center justify-center p-8 border rounded-lg">
                    <Spinner className="h-6 w-6" />
                    <span className="ml-2">Loading content...</span>
                  </div>
                ) : (
                  <Textarea
                    value={documentContent}
                    onChange={(e) => setDocumentContent(e.target.value)}
                    placeholder="Document content..."
                    className="w-full min-h-[500px] max-h-[600px] font-mono text-sm resize-y"
                    style={{ overflow: 'auto' }}
                  />
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t bg-white sticky bottom-0">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={handleContentSave}
                  disabled={contentLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Save Content & Reprocess
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// Document Detail Dialog Component
interface DocumentDetailDialogProps {
  document: TrainingDocument;
  onClose: () => void;
}

const DocumentDetailDialog: React.FC<DocumentDetailDialogProps> = ({ document, onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <BookOpen className="h-5 w-5" />
            {document.title}
          </DialogTitle>
          <DialogDescription>
            {document.document_type.replace('_', ' ')} • Version {document.version}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Type:</span>
              <Badge className={`ml-2 ${document.document_type === 'coaching_guide' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                {document.document_type.replace('_', ' ')}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Category:</span> {document.category || 'None'}
            </div>
            <div>
              <span className="font-medium">Status:</span> {document.status}
            </div>
            <div>
              <span className="font-medium">File Size:</span> {document.file_size ? `${(document.file_size / 1024).toFixed(1)} KB` : 'N/A'}
            </div>
          </div>

          {document.tags && document.tags.length > 0 && (
            <div>
              <span className="font-medium text-sm">Tags:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {document.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-2">Content Preview</h4>
            <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
              {document.content_length > 0 ? 
                "Content preview will be available once full document viewing is implemented." :
                "No content available"
              }
            </div>
          </div>

          <div className="text-xs text-gray-500 border-t pt-4">
            Created: {new Date(document.created_at).toLocaleString()} | 
            Updated: {new Date(document.updated_at).toLocaleString()}
            {document.original_filename && ` | Original file: ${document.original_filename}`}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrainingDocumentsManagement;