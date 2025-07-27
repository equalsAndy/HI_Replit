import React, { useState, useEffect } from 'react';
import { isFeatureEnabled } from '../../utils/featureFlags';

interface SystemInfo {
  browser: string;
  os: string;
  screen: string;
  viewport: string;
  userAgent: string;
  timestamp: string;
  timezone: string;
}

interface FeedbackItem {
  id: string;
  userId: number | null;
  userName: string | null;
  userEmail: string | null;
  workshopType: 'ast' | 'ia';
  pageContext: 'current' | 'other' | 'general';
  targetPage: string | null;
  feedbackType: 'bug' | 'feature' | 'content' | 'general';
  priority: 'low' | 'medium' | 'high' | 'blocker';
  message: string;
  experienceRating: number | null;
  status: 'new' | 'in_progress' | 'resolved' | 'archived';
  tags: string[];
  systemInfo: SystemInfo;
  adminNotes: string | null;
  jiraTicketId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FeedbackStats {
  total: number;
  statusCounts: Record<string, number>;
  workshopCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  averageRating: string | null;
  recentCount: number;
  lastUpdated: string;
}

export const FeedbackManagement: React.FC = () => {
  // Admin dashboard should always have access to feedback management
  // Skip feature flag check in admin context

  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filters and pagination
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [workshopFilter, setWorkshopFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // User data for filtering
  const [users, setUsers] = useState<{id: number, name: string, username: string}[]>([]);

  // Sorting
  const [sortField, setSortField] = useState<keyof FeedbackItem>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Form data for editing
  const [processingAction, setProcessingAction] = useState<string>('');
  const [editingNotes, setEditingNotes] = useState<string>('');

  // Bulk selection
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState<boolean>(false);

  // Load feedback data and stats
  useEffect(() => {
    loadFeedbackData();
    loadFeedbackStats();
    // Clear selections when filters change
    setSelectedItems([]);
    setShowBulkActions(false);
  }, [statusFilter, workshopFilter, typeFilter, priorityFilter, userFilter, searchTerm, currentPage, sortField, sortDirection]);

  // Load users list for filtering
  useEffect(() => {
    loadUsers();
  }, []);

  // Update bulk actions visibility when selections change
  useEffect(() => {
    setShowBulkActions(selectedItems.length > 0);
  }, [selectedItems]);

  const loadFeedbackData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(workshopFilter !== 'all' && { workshopType: workshopFilter }),
        ...(typeFilter !== 'all' && { feedbackType: typeFilter }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter }),
        ...(userFilter !== 'all' && { userId: userFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/feedback/list?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback);
      } else {
        console.error('Failed to load feedback data');
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeedbackStats = async () => {
    try {
      const response = await fetch('/api/feedback/stats/overview', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading feedback stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        // Extract users list and format for dropdown
        const usersList = data.users.map((user: any) => ({
          id: user.id,
          name: user.name,
          username: user.username
        }));
        setUsers(usersList);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const updateFeedbackStatus = async (feedbackId: string, updates: any) => {
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        loadFeedbackData();
        loadFeedbackStats();
        return true;
      } else {
        console.error('Failed to update feedback');
        return false;
      }
    } catch (error) {
      console.error('Error updating feedback:', error);
      return false;
    }
  };

  const handleSort = (field: keyof FeedbackItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const openDetailModal = (item: FeedbackItem) => {
    setSelectedFeedback(item);
    setProcessingAction('');
    setEditingNotes(item.adminNotes || '');
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedFeedback(null);
    setProcessingAction('');
    setEditingNotes('');
  };

  const handleProcessFeedback = async () => {
    if (!selectedFeedback || !processingAction) return;

    const updates: any = {};
    
    // Handle different processing actions
    switch (processingAction) {
      case 'create_ticket':
        updates.status = 'in_progress';
        if (editingNotes.trim()) {
          updates.adminNotes = editingNotes.trim() + '\n\n[Action: Create Jira Ticket]';
        } else {
          updates.adminNotes = '[Action: Create Jira Ticket]';
        }
        break;
      case 'ignore':
        updates.status = 'archived';
        if (editingNotes.trim()) {
          updates.adminNotes = editingNotes.trim() + '\n\n[Action: Ignored]';
        } else {
          updates.adminNotes = '[Action: Ignored]';
        }
        break;
      case 'investigate':
        updates.status = 'in_progress';
        if (editingNotes.trim()) {
          updates.adminNotes = editingNotes.trim() + '\n\n[Action: Under Investigation]';
        } else {
          updates.adminNotes = '[Action: Under Investigation]';
        }
        break;
      case 'delete':
        // Handle deletion separately
        try {
          const response = await fetch(`/api/feedback/${selectedFeedback.id}`, {
            method: 'DELETE',
            credentials: 'include'
          });
          
          if (response.ok) {
            closeDetailModal();
            loadFeedbackData();
            loadFeedbackStats();
          } else {
            console.error('Failed to delete feedback');
          }
        } catch (error) {
          console.error('Error deleting feedback:', error);
        }
        return;
      default:
        // Just update notes if no specific action
        if (editingNotes !== (selectedFeedback.adminNotes || '')) {
          updates.adminNotes = editingNotes;
        }
    }

    if (Object.keys(updates).length > 0) {
      const success = await updateFeedbackStatus(selectedFeedback.id, updates);
      if (success) {
        closeDetailModal();
      }
    } else {
      closeDetailModal();
    }
  };

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(feedback.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (feedbackId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, feedbackId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== feedbackId));
    }
  };

  const isAllSelected = feedback.length > 0 && selectedItems.length === feedback.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < feedback.length;

  // Bulk operations handlers
  const handleBulkArchive = async () => {
    try {
      const response = await fetch('/api/feedback/bulk/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          feedbackIds: selectedItems,
          status: 'archived'
        }),
      });

      if (response.ok) {
        setSelectedItems([]);
        loadFeedbackData();
        loadFeedbackStats();
      } else {
        console.error('Failed to archive feedback items');
      }
    } catch (error) {
      console.error('Error archiving feedback items:', error);
    }
  };

  const handleBulkDelete = async () => {
    // Show confirmation modal first
    if (window.confirm(`Are you sure you want to permanently delete ${selectedItems.length} feedback item${selectedItems.length !== 1 ? 's' : ''}? This action cannot be undone.`)) {
      try {
        const response = await fetch('/api/feedback/bulk/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            feedbackIds: selectedItems
          }),
        });

        if (response.ok) {
          setSelectedItems([]);
          loadFeedbackData();
          loadFeedbackStats();
        } else {
          console.error('Failed to delete feedback items');
        }
      } catch (error) {
        console.error('Error deleting feedback items:', error);
      }
    }
  };

  // CSV Export handler
  const handleCSVExport = async () => {
    try {
      const exportData = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        workshopType: workshopFilter !== 'all' ? workshopFilter : undefined,
        feedbackType: typeFilter !== 'all' ? typeFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        userId: userFilter !== 'all' ? userFilter : undefined,
        search: searchTerm || undefined
      };

      const response = await fetch('/api/feedback/export/csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(exportData),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'feedback-export.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to export CSV');
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#10b981'; // green
      case 'medium': return '#f59e0b'; // orange
      case 'high': return '#ef4444'; // red
      case 'blocker': return '#6b7280'; // gray
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#3b82f6'; // blue
      case 'in_progress': return '#f59e0b'; // orange
      case 'resolved': return '#10b981'; // green
      case 'archived': return '#6b7280'; // gray
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !stats) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading feedback data...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Feedback Management</h2>
        <p style={styles.subtitle}>Monitor and manage user feedback from workshop experiences</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3>Total Feedback</h3>
            <div style={styles.statNumber}>{stats.total}</div>
          </div>
          <div style={styles.statCard}>
            <h3>Recent (7 days)</h3>
            <div style={styles.statNumber}>{stats.recentCount}</div>
          </div>
          <div style={styles.statCard}>
            <h3>Average Rating</h3>
            <div style={styles.statNumber}>{stats.averageRating || 'N/A'}</div>
          </div>
          <div style={styles.statCard}>
            <h3>Pending</h3>
            <div style={styles.statNumber}>{(stats.statusCounts.new || 0) + (stats.statusCounts.in_progress || 0)}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={styles.filtersContainer}>
        <div style={styles.filterGroup}>
          <label>Status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label>Workshop:</label>
          <select 
            value={workshopFilter} 
            onChange={(e) => setWorkshopFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">All</option>
            <option value="ast">AllStarTeams</option>
            <option value="ia">Imaginal Agility</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label>Type:</label>
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">All</option>
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
            <option value="content">Content Issue</option>
            <option value="general">General</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label>Priority:</label>
          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="blocker">Blocker</option>
          </select>
        </div>
        <div style={styles.filterGroup}>
          <label>User:</label>
          <select 
            value={userFilter} 
            onChange={(e) => setUserFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Users</option>
            {users.map(user => (
              <option key={user.id} value={user.id.toString()}>
                {user.name} ({user.username})
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label>Search:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search feedback..."
            style={styles.searchInput}
          />
        </div>
        
        {/* Export Controls */}
        <div style={styles.exportControls}>
          <button
            onClick={handleCSVExport}
            style={styles.exportButton}
          >
            📊 Export CSV
          </button>
          <span style={styles.exportNote}>
            Exports current filtered results ({feedback.length} items)
          </span>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {showBulkActions && (
        <div style={styles.bulkActionsToolbar}>
          <div style={styles.bulkActionsLeft}>
            <span style={styles.selectionCount}>
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div style={styles.bulkActionsRight}>
            <button
              onClick={handleBulkArchive}
              style={styles.bulkActionButton}
            >
              Archive Selected
            </button>
            <button
              onClick={handleBulkDelete}
              style={{...styles.bulkActionButton, backgroundColor: '#ef4444'}}
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Feedback Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  style={styles.checkbox}
                />
              </th>
              <th style={styles.th} onClick={() => handleSort('createdAt')}>
                Date {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={styles.th} onClick={() => handleSort('workshopType')}>
                Workshop {sortField === 'workshopType' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={styles.th} onClick={() => handleSort('feedbackType')}>
                Type {sortField === 'feedbackType' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={styles.th} onClick={() => handleSort('priority')}>
                Priority {sortField === 'priority' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={styles.th} onClick={() => handleSort('status')}>
                Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={styles.th}>Message</th>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {feedback.map((item) => (
              <tr key={item.id} style={styles.tr}>
                <td style={styles.td}>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                    style={styles.checkbox}
                  />
                </td>
                <td style={styles.td}>{formatDate(item.createdAt)}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: item.workshopType === 'ast' ? '#dbeafe' : '#f3e8ff',
                    color: item.workshopType === 'ast' ? '#1e40af' : '#7c3aed'
                  }}>
                    {item.workshopType.toUpperCase()}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={styles.feedbackType}>
                    {item.feedbackType === 'bug' && '🐛'} 
                    {item.feedbackType === 'feature' && '💡'} 
                    {item.feedbackType === 'content' && '📝'} 
                    {item.feedbackType === 'general' && '💬'} 
                    {item.feedbackType}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: `${getPriorityColor(item.priority)}20`,
                    color: getPriorityColor(item.priority)
                  }}>
                    {item.priority}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: `${getStatusColor(item.status)}20`,
                    color: getStatusColor(item.status)
                  }}>
                    {item.status.replace('_', ' ')}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={styles.messagePreview}>
                    {item.message.length > 60 ? `${item.message.substring(0, 60)}...` : item.message}
                  </div>
                </td>
                <td style={styles.td}>
                  {item.userName ? (
                    <div>
                      <div style={styles.userName}>{item.userName}</div>
                      <div style={styles.userEmail}>{item.userEmail}</div>
                    </div>
                  ) : (
                    <span style={styles.anonymous}>Anonymous</span>
                  )}
                </td>
                <td style={styles.td}>
                  <button
                    onClick={() => openDetailModal(item)}
                    style={styles.actionButton}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedFeedback && (
        <div style={styles.modalOverlay} onClick={closeDetailModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Feedback Details</h3>
              <button onClick={closeDetailModal} style={styles.closeButton}>×</button>
            </div>
            
            <div style={styles.modalContent}>
              <div style={styles.detailGrid}>
                <div style={styles.detailSection}>
                  <h4>Feedback Information</h4>
                  <div style={styles.detailRow}>
                    <strong>Workshop:</strong> {selectedFeedback.workshopType.toUpperCase()}
                  </div>
                  <div style={styles.detailRow}>
                    <strong>Type:</strong> {selectedFeedback.feedbackType}
                  </div>
                  <div style={styles.detailRow}>
                    <strong>Priority:</strong> {selectedFeedback.priority}
                  </div>
                  <div style={styles.detailRow}>
                    <strong>Page Context:</strong> {selectedFeedback.pageContext}
                  </div>
                  {selectedFeedback.targetPage && (
                    <div style={styles.detailRow}>
                      <strong>Target Page:</strong> {selectedFeedback.targetPage}
                    </div>
                  )}
                  {selectedFeedback.experienceRating && (
                    <div style={styles.detailRow}>
                      <strong>Experience Rating:</strong> {selectedFeedback.experienceRating}/5
                    </div>
                  )}
                  <div style={styles.detailRow}>
                    <strong>Submitted:</strong> {formatDate(selectedFeedback.createdAt)}
                  </div>
                </div>

                <div style={styles.detailSection}>
                  <h4>User Information</h4>
                  {selectedFeedback.userName ? (
                    <>
                      <div style={styles.detailRow}>
                        <strong>Name:</strong> {selectedFeedback.userName}
                      </div>
                      <div style={styles.detailRow}>
                        <strong>Email:</strong> {selectedFeedback.userEmail}
                      </div>
                    </>
                  ) : (
                    <div style={styles.detailRow}>Anonymous feedback</div>
                  )}
                </div>

                <div style={styles.detailSection}>
                  <h4>System Information</h4>
                  <div style={styles.detailRow}>
                    <strong>Browser:</strong> {selectedFeedback.systemInfo.browser}
                  </div>
                  <div style={styles.detailRow}>
                    <strong>OS:</strong> {selectedFeedback.systemInfo.os}
                  </div>
                  <div style={styles.detailRow}>
                    <strong>Screen:</strong> {selectedFeedback.systemInfo.screen}
                  </div>
                  <div style={styles.detailRow}>
                    <strong>Viewport:</strong> {selectedFeedback.systemInfo.viewport}
                  </div>
                </div>
              </div>

              <div style={styles.messageSection}>
                <h4>Feedback Message</h4>
                <div style={styles.messageBox}>
                  {selectedFeedback.message}
                </div>
              </div>

              <div style={styles.adminSection}>
                <h4>Process Feedback</h4>
                
                <div style={styles.formGroup}>
                  <label>Action:</label>
                  <div style={styles.radioGroup}>
                    <label style={styles.radioLabel}>
                      <input
                        type="radio"
                        name="processingAction"
                        value="create_ticket"
                        checked={processingAction === 'create_ticket'}
                        onChange={(e) => setProcessingAction(e.target.value)}
                        style={styles.radio}
                      />
                      <span style={styles.radioText}>Create Ticket</span>
                    </label>
                    <label style={styles.radioLabel}>
                      <input
                        type="radio"
                        name="processingAction"
                        value="ignore"
                        checked={processingAction === 'ignore'}
                        onChange={(e) => setProcessingAction(e.target.value)}
                        style={styles.radio}
                      />
                      <span style={styles.radioText}>Ignore</span>
                    </label>
                    <label style={styles.radioLabel}>
                      <input
                        type="radio"
                        name="processingAction"
                        value="investigate"
                        checked={processingAction === 'investigate'}
                        onChange={(e) => setProcessingAction(e.target.value)}
                        style={styles.radio}
                      />
                      <span style={styles.radioText}>Investigate</span>
                    </label>
                    <label style={styles.radioLabel}>
                      <input
                        type="radio"
                        name="processingAction"
                        value="delete"
                        checked={processingAction === 'delete'}
                        onChange={(e) => setProcessingAction(e.target.value)}
                        style={styles.radio}
                      />
                      <span style={{...styles.radioText, color: '#ef4444'}}>Delete</span>
                    </label>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label>Admin Notes:</label>
                  <textarea
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    placeholder="Add notes about this feedback..."
                    rows={4}
                    style={styles.textarea}
                  />
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={closeDetailModal} style={styles.cancelButton}>
                Cancel
              </button>
              <button 
                onClick={handleProcessFeedback} 
                style={{
                  ...styles.saveButton,
                  backgroundColor: processingAction === 'delete' ? '#ef4444' : '#3b82f6'
                }}
                disabled={!processingAction}
              >
                {processingAction === 'create_ticket' && 'Create Ticket'}
                {processingAction === 'ignore' && 'Ignore Feedback'}
                {processingAction === 'investigate' && 'Start Investigation'}
                {processingAction === 'delete' && 'Delete Feedback'}
                {!processingAction && 'Select Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  disabledMessage: {
    textAlign: 'center' as const,
    padding: '40px',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '40px',
    fontSize: '16px',
    color: '#6b7280',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '30px',
  },
  statCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center' as const,
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1e40af',
    marginTop: '8px',
  },
  filtersContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '16px',
    marginBottom: '20px',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  select: {
    padding: '6px 8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
  },
  searchInput: {
    padding: '6px 8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    minWidth: '200px',
  },
  tableContainer: {
    overflowX: 'auto' as const,
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    backgroundColor: 'white',
  },
  th: {
    padding: '12px 8px',
    textAlign: 'left' as const,
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    fontWeight: '600',
    fontSize: '13px',
    color: '#374151',
    cursor: 'pointer',
  },
  tr: {
    borderBottom: '1px solid #f3f4f6',
  },
  td: {
    padding: '12px 8px',
    fontSize: '13px',
    verticalAlign: 'top' as const,
  },
  badge: {
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
  },
  feedbackType: {
    fontSize: '12px',
    textTransform: 'capitalize' as const,
  },
  messagePreview: {
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  userName: {
    fontWeight: '500',
    fontSize: '12px',
  },
  userEmail: {
    fontSize: '11px',
    color: '#6b7280',
  },
  anonymous: {
    fontStyle: 'italic',
    color: '#9ca3af',
    fontSize: '12px',
  },
  actionButton: {
    padding: '4px 8px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  modalHeader: {
    padding: '20px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6b7280',
  },
  modalContent: {
    padding: '20px',
    overflowY: 'auto' as const,
    flex: 1,
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  },
  detailSection: {
    backgroundColor: '#f9fafb',
    padding: '16px',
    borderRadius: '8px',
  },
  detailRow: {
    marginBottom: '8px',
    fontSize: '14px',
  },
  messageSection: {
    marginBottom: '20px',
  },
  messageBox: {
    backgroundColor: '#f9fafb',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '14px',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap' as const,
  },
  adminSection: {
    backgroundColor: '#fef3c7',
    padding: '16px',
    borderRadius: '8px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  input: {
    width: '100%',
    padding: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
  },
  textarea: {
    width: '100%',
    padding: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    resize: 'vertical' as const,
  },
  modalFooter: {
    padding: '20px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  saveButton: {
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    marginTop: '4px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '14px',
  },
  radio: {
    marginRight: '8px',
    cursor: 'pointer',
  },
  radioText: {
    color: '#374151',
  },
  checkbox: {
    cursor: 'pointer',
  },
  bulkActionsToolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#f0f9ff',
    border: '1px solid #0ea5e9',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  bulkActionsLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  bulkActionsRight: {
    display: 'flex',
    gap: '8px',
  },
  selectionCount: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0c4a6e',
  },
  bulkActionButton: {
    padding: '6px 12px',
    backgroundColor: '#0ea5e9',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
  },
  exportControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '12px',
  },
  exportButton: {
    padding: '8px 16px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  exportNote: {
    fontSize: '12px',
    color: '#6b7280',
    fontStyle: 'italic',
  },
};

export default FeedbackManagement;