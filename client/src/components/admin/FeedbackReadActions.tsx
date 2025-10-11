import React, { useState } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';

interface FeedbackItem {
  id: string;
  status: 'new' | 'read' | 'in_progress' | 'resolved' | 'archived';
  message: string;
  feedbackType: string;
  priority: string;
  createdAt: string;
  userName?: string;
}

interface FeedbackReadActionsProps {
  feedback: FeedbackItem | FeedbackItem[];
  onStatusUpdate?: (feedbackId: string | string[], newStatus: string) => void;
  className?: string;
}

export const FeedbackReadActions: React.FC<FeedbackReadActionsProps> = ({
  feedback,
  onStatusUpdate,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Determine if we're working with single or multiple feedback items
  const isMultiple = Array.isArray(feedback);
  const feedbackItems = isMultiple ? feedback : [feedback];
  const allUnread = feedbackItems.every(item => item.status === 'new');
  const hasUnread = feedbackItems.some(item => item.status === 'new');

  const handleMarkAsRead = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (isMultiple) {
        // Bulk mark as read
        const feedbackIds = feedbackItems.map(item => item.id);
        const response = await fetch('/api/feedback/bulk/mark-read', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ feedbackIds })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Marked ${data.markedCount} feedback items as read`);
          onStatusUpdate?.(feedbackIds, 'read');
        } else {
          console.error('Failed to mark feedback as read');
        }
      } else {
        // Single mark as read
        const feedbackId = feedbackItems[0].id;
        const response = await fetch(`/api/feedback/${feedbackId}/mark-read`, {
          method: 'PATCH',
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Marked feedback as read');
          onStatusUpdate?.(feedbackId, 'read');
        } else {
          console.error('Failed to mark feedback as read');
        }
      }
    } catch (error) {
      console.error('Error marking feedback as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if all items are already read
  if (!hasUnread) {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-500 ${className}`}>
        <EyeOff size={16} />
        <span>{isMultiple ? 'All read' : 'Read'}</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleMarkAsRead}
      disabled={isLoading}
      className={`
        flex items-center gap-2 px-3 py-2 
        bg-blue-50 hover:bg-blue-100 
        border border-blue-200 hover:border-blue-300
        text-blue-700 hover:text-blue-800
        rounded-md transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        text-sm font-medium
        ${className}
      `}
      title={isMultiple ? 'Mark all selected as read' : 'Mark as read'}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
          <span>Marking...</span>
        </>
      ) : (
        <>
          <Eye size={16} />
          <span>
            {isMultiple 
              ? `Mark ${feedbackItems.filter(f => f.status === 'new').length} as read`
              : 'Mark as read'
            }
          </span>
        </>
      )}
    </button>
  );
};

// Status indicator component
interface FeedbackStatusBadgeProps {
  status: FeedbackItem['status'];
  className?: string;
}

export const FeedbackStatusBadge: React.FC<FeedbackStatusBadgeProps> = ({
  status,
  className = ''
}) => {
  const statusConfig = {
    new: { 
      color: 'bg-red-100 text-red-800 border-red-200', 
      icon: <div className="w-2 h-2 bg-red-500 rounded-full" />,
      label: 'New' 
    },
    read: { 
      color: 'bg-blue-100 text-blue-800 border-blue-200', 
      icon: <Eye size={12} />,
      label: 'Read' 
    },
    in_progress: { 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      icon: <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />,
      label: 'In Progress' 
    },
    resolved: { 
      color: 'bg-green-100 text-green-800 border-green-200', 
      icon: <Check size={12} />,
      label: 'Resolved' 
    },
    archived: { 
      color: 'bg-gray-100 text-gray-800 border-gray-200', 
      icon: <div className="w-2 h-2 bg-gray-500 rounded-full" />,
      label: 'Archived' 
    }
  };

  const config = statusConfig[status];

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2 py-1 
      border rounded-full text-xs font-medium
      ${config.color}
      ${className}
    `}>
      {config.icon}
      {config.label}
    </span>
  );
};

// Example usage component
export const FeedbackTableRow: React.FC<{ 
  feedback: FeedbackItem;
  onUpdate: (id: string, status: string) => void;
}> = ({ feedback, onUpdate }) => {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-4 py-3">
        <FeedbackStatusBadge status={feedback.status} />
      </td>
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-gray-900">
          {feedback.userName || 'Anonymous'}
        </div>
        <div className="text-xs text-gray-500">
          {new Date(feedback.createdAt).toLocaleDateString()}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {feedback.message}
        </div>
        <div className="text-xs text-gray-500">
          {feedback.feedbackType} • {feedback.priority}
        </div>
      </td>
      <td className="px-4 py-3">
        <FeedbackReadActions 
          feedback={feedback}
          onStatusUpdate={(id, status) => onUpdate(id as string, status)}
        />
      </td>
    </tr>
  );
};