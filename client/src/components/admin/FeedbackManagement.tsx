import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';

interface FeedbackItem {
  id: number;
  userId: number;
  userName: string;
  username: string;
  isTestUser: boolean;
  pageContext: string;
  feedbackText: string;
  priorityLevel: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface BetaNote {
  id: number;
  userId: number;
  userName?: string;
  username?: string;
  isBetaTester?: boolean;
  workshopType: string;
  stepId: string;
  noteContent: string;
  noteType: string;
  createdAt: string;
  updatedAt: string;
}

interface BetaSurvey {
  id: number;
  userId: number;
  userName?: string;
  username?: string;
  isBetaTester?: boolean;
  qualityRating: number;
  authenticityRating: number;
  recommendationRating: number;
  roseResponse: string;
  budResponse: string;
  thornResponse: string;
  professionalApplication: string;
  suggestedImprovements: string;
  interests: string | string[];
  finalComments: string;
  completedAt: string;
  createdAt: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  isTestUser: boolean;
  isBetaTester: boolean;
  feedbackCount: number;
  notesCount: number;
  hasSurvey: number;
}

interface UserFeedbackData {
  feedback: FeedbackItem[];
  betaNotes: BetaNote[];
  betaSurvey: BetaSurvey | null;
}

export default function FeedbackManagement() {
  const [activeView, setActiveView] = useState<'feedback-list' | 'user-view'>('feedback-list');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data states
  const [allFeedback, setAllFeedback] = useState<FeedbackItem[]>([]);
  const [allBetaNotes, setAllBetaNotes] = useState<BetaNote[]>([]);
  const [allBetaSurveys, setAllBetaSurveys] = useState<BetaSurvey[]>([]);
  const [usersWithFeedback, setUsersWithFeedback] = useState<User[]>([]);
  
  // Filters for feedback list
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  // User modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userFeedbackData, setUserFeedbackData] = useState<UserFeedbackData>({
    feedback: [],
    betaNotes: [],
    betaSurvey: null
  });
  const [userModalLoading, setUserModalLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    if (activeView === 'feedback-list') {
      loadFeedbackData();
    } else if (activeView === 'user-view') {
      loadUsersWithFeedback();
    }
  }, [activeView]);

  const loadFeedbackData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/feedback/admin/all', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch feedback data');
      }
      
      const data = await response.json();
      setAllFeedback(data.feedback || []);
    } catch (err) {
      console.error('Error loading feedback:', err);
      setError('Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  const loadUsersWithFeedback = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/beta-testers/admin/users-with-feedback', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users with feedback');
      }
      
      const data = await response.json();
      setUsersWithFeedback(data.users || []);
    } catch (err) {
      console.error('Error loading users with feedback:', err);
      setError('Failed to load users with feedback');
    } finally {
      setLoading(false);
    }
  };

  const loadUserFeedbackData = async (userId: number) => {
    setUserModalLoading(true);
    try {
      // Load all feedback data for this user
      const [feedbackResponse, notesResponse, surveyResponse] = await Promise.all([
        fetch(`/api/feedback/admin/user/${userId}`, { credentials: 'include' }),
        fetch(`/api/beta-testers/admin/user/${userId}/notes`, { credentials: 'include' }),
        fetch(`/api/beta-testers/admin/user/${userId}/survey`, { credentials: 'include' })
      ]);

      const feedbackData = await feedbackResponse.json();
      const notesData = await notesResponse.json();
      const surveyData = await surveyResponse.json();

      setUserFeedbackData({
        feedback: feedbackData.feedback || [],
        betaNotes: notesData.notes || [],
        betaSurvey: surveyData.survey || null
      });
    } catch (err) {
      console.error('Error loading user feedback data:', err);
      setError('Failed to load user feedback data');
    } finally {
      setUserModalLoading(false);
    }
  };

  const openUserModal = (user: User) => {
    setSelectedUser(user);
    loadUserFeedbackData(user.id);
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setUserFeedbackData({ feedback: [], betaNotes: [], betaSurvey: null });
  };

  // Filter feedback based on selected filters
  const filteredFeedback = allFeedback.filter(item => {
    const statusMatch = statusFilter === 'all' || item.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || item.priorityLevel === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const formatInterests = (interests: string | string[]) => {
    if (!interests) return 'Not specified';
    
    try {
      // Handle both array and string formats
      if (Array.isArray(interests)) {
        return interests.join(', ');
      } else if (typeof interests === 'string') {
        // Try to parse as JSON array
        if (interests.startsWith('[') && interests.endsWith(']')) {
          const parsed = JSON.parse(interests);
          return Array.isArray(parsed) ? parsed.join(', ') : interests;
        }
        return interests;
      }
      return 'Not specified';
    } catch {
      return interests.toString();
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500 text-white';
      case 'in_progress': return 'bg-yellow-500 text-black';
      case 'resolved': return 'bg-green-500 text-white';
      case 'closed': return 'bg-gray-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Feedback Management</h2>
        <p className="text-gray-600">
          Simplified interface to view and manage user feedback, beta notes, and surveys.
        </p>
      </div>

      {/* View Toggle */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="feedback-list">📝 Feedback List</TabsTrigger>
          <TabsTrigger value="user-view">👥 User View</TabsTrigger>
        </TabsList>

        {/* Feedback List View */}
        <TabsContent value="feedback-list" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-sm font-medium mb-1">Status Filter:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Priority Filter:</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <Button onClick={loadFeedbackData} disabled={loading} className="mt-6">
              Refresh Data
            </Button>
          </div>

          {loading && <div className="text-center py-4">Loading feedback...</div>}
          {error && <div className="text-red-600 py-4">{error}</div>}

          <div className="space-y-4">
            {filteredFeedback.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.userName}</span>
                    {item.isTestUser && <Badge className="bg-orange-100 text-orange-800">🔧 Test User</Badge>}
                    <span className="text-sm text-gray-500">({item.username})</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityBadgeColor(item.priorityLevel)}>
                      {item.priorityLevel}
                    </Badge>
                    <Badge className={getStatusBadgeColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
                <div className="mb-2">
                  <span className="text-sm font-medium">Page: </span>
                  <span className="text-sm text-gray-600">{item.pageContext || 'Not specified'}</span>
                </div>
                <div className="mb-3">
                  <p className="text-gray-800">{item.feedbackText}</p>
                </div>
                <div className="text-xs text-gray-500">
                  Created: {formatDate(item.createdAt)} | Updated: {formatDate(item.updatedAt)}
                </div>
              </Card>
            ))}

            {!loading && filteredFeedback.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No feedback items found with the current filters.
              </div>
            )}
          </div>
        </TabsContent>

        {/* User View */}
        <TabsContent value="user-view" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Click on any user to view all their feedback in one place.
            </p>
            <Button onClick={loadUsersWithFeedback} disabled={loading}>
              Refresh Users
            </Button>
          </div>

          {loading && <div className="text-center py-4">Loading users...</div>}
          {error && <div className="text-red-600 py-4">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usersWithFeedback.map((user) => (
              <Card key={user.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => openUserModal(user)}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-lg">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.username}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {user.isBetaTester && <Badge className="bg-purple-100 text-purple-800">🧪 Beta Tester</Badge>}
                    {user.isTestUser && <Badge className="bg-orange-100 text-orange-800">🔧 Test User</Badge>}
                  </div>
                </div>
                
                <div className="flex gap-2 text-sm">
                  {user.feedbackCount > 0 && (
                    <Badge variant="outline">
                      📝 {user.feedbackCount} feedback
                    </Badge>
                  )}
                  {user.notesCount > 0 && (
                    <Badge variant="outline">
                      🧪 {user.notesCount} notes
                    </Badge>
                  )}
                  {user.hasSurvey > 0 && (
                    <Badge variant="outline">
                      📊 Survey
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {!loading && usersWithFeedback.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users with feedback found.
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* User Feedback Modal */}
      <Dialog open={!!selectedUser} onOpenChange={closeUserModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedUser?.name} - All Feedback
              <div className="flex gap-1">
                {selectedUser?.isBetaTester && <Badge className="bg-purple-100 text-purple-800">🧪 Beta Tester</Badge>}
                {selectedUser?.isTestUser && <Badge className="bg-orange-100 text-orange-800">🔧 Test User</Badge>}
              </div>
            </DialogTitle>
            <DialogDescription>
              Comprehensive view of all feedback from {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>

          {userModalLoading && (
            <div className="text-center py-8">Loading user feedback data...</div>
          )}

          {!userModalLoading && (
            <div className="space-y-6">
              {/* Regular Feedback */}
              {userFeedbackData.feedback.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">📝 Feedback Items ({userFeedbackData.feedback.length})</h3>
                  <div className="space-y-3">
                    {userFeedbackData.feedback.map((item) => (
                      <div key={item.id} className="border rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">
                            Page: {item.pageContext || 'Not specified'}
                          </span>
                          <div className="flex gap-1">
                            <Badge className={getPriorityBadgeColor(item.priorityLevel)}>
                              {item.priorityLevel}
                            </Badge>
                            <Badge className={getStatusBadgeColor(item.status)}>
                              {item.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-800 mb-2">{item.feedbackText}</p>
                        <div className="text-xs text-gray-500">
                          {formatDate(item.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Beta Tester Notes */}
              {userFeedbackData.betaNotes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">🧪 Beta Tester Notes ({userFeedbackData.betaNotes.length})</h3>
                  <div className="space-y-3">
                    {userFeedbackData.betaNotes.map((note) => (
                      <div key={note.id} className="border rounded p-3 bg-purple-50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-2">
                            <Badge variant="outline">{note.workshopType?.toUpperCase()}</Badge>
                            <Badge variant="outline">Step {note.stepId}</Badge>
                            <Badge variant="outline">{note.noteType}</Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(note.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-800">{note.noteContent}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Beta Survey */}
              {userFeedbackData.betaSurvey && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">📊 Beta Survey</h3>
                  <div className="border rounded p-4 bg-blue-50">
                    {/* Star Ratings */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="font-medium">Quality</div>
                        <div className="text-2xl">{'⭐'.repeat(userFeedbackData.betaSurvey.qualityRating || 0)}</div>
                        <div className="text-sm text-gray-600">{userFeedbackData.betaSurvey.qualityRating}/5</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">Authenticity</div>
                        <div className="text-2xl">{'⭐'.repeat(userFeedbackData.betaSurvey.authenticityRating || 0)}</div>
                        <div className="text-sm text-gray-600">{userFeedbackData.betaSurvey.authenticityRating}/5</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">Recommendation</div>
                        <div className="text-2xl">{'⭐'.repeat(userFeedbackData.betaSurvey.recommendationRating || 0)}</div>
                        <div className="text-sm text-gray-600">{userFeedbackData.betaSurvey.recommendationRating}/5</div>
                      </div>
                    </div>

                    {/* Rose/Bud/Thorn */}
                    <div className="space-y-3 mb-4">
                      {userFeedbackData.betaSurvey.roseResponse && (
                        <div>
                          <div className="font-medium text-green-700">🌹 Rose (What went well)</div>
                          <p className="text-gray-800">{userFeedbackData.betaSurvey.roseResponse}</p>
                        </div>
                      )}
                      
                      {userFeedbackData.betaSurvey.budResponse && (
                        <div>
                          <div className="font-medium text-yellow-700">🌱 Bud (What has potential)</div>
                          <p className="text-gray-800">{userFeedbackData.betaSurvey.budResponse}</p>
                        </div>
                      )}
                      
                      {userFeedbackData.betaSurvey.thornResponse && (
                        <div>
                          <div className="font-medium text-red-700">🌿 Thorn (What was challenging)</div>
                          <p className="text-gray-800">{userFeedbackData.betaSurvey.thornResponse}</p>
                        </div>
                      )}
                    </div>

                    {/* Additional Insights */}
                    <div className="space-y-3">
                      {userFeedbackData.betaSurvey.professionalApplication && (
                        <div>
                          <div className="font-medium">💼 Professional Application</div>
                          <p className="text-gray-800">{userFeedbackData.betaSurvey.professionalApplication}</p>
                        </div>
                      )}
                      
                      {userFeedbackData.betaSurvey.suggestedImprovements && (
                        <div>
                          <div className="font-medium">🚀 Suggested Improvements</div>
                          <p className="text-gray-800">{userFeedbackData.betaSurvey.suggestedImprovements}</p>
                        </div>
                      )}
                      
                      {userFeedbackData.betaSurvey.interests && (
                        <div>
                          <div className="font-medium">🎯 Interests (what they'd like to hear more about)</div>
                          <p className="text-gray-800">{formatInterests(userFeedbackData.betaSurvey.interests)}</p>
                        </div>
                      )}
                      
                      {userFeedbackData.betaSurvey.finalComments && (
                        <div>
                          <div className="font-medium">💬 Final Comments</div>
                          <p className="text-gray-800">{userFeedbackData.betaSurvey.finalComments}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 text-xs text-gray-500">
                      Survey completed: {formatDate(userFeedbackData.betaSurvey.completedAt)}
                    </div>
                  </div>
                </div>
              )}

              {/* No Data Message */}
              {!userModalLoading && 
               userFeedbackData.feedback.length === 0 && 
               userFeedbackData.betaNotes.length === 0 && 
               !userFeedbackData.betaSurvey && (
                <div className="text-center py-8 text-gray-500">
                  No feedback data found for this user.
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}