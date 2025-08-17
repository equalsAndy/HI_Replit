import express from 'express';
import { db } from '../db.js';
import { feedback, users } from '../../shared/schema.js';
import { eq, desc, and, ilike, inArray, count, or } from 'drizzle-orm';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { featureFlags } from '../utils/feature-flags.js';

const router = express.Router();

// Lightweight request logging for QA (dev/staging only)
const feedbackLoggingEnabled = (process.env.FEATURE_LOG_API === 'true') || (process.env.NODE_ENV !== 'production');
router.use((req, res, next) => {
  if (!feedbackLoggingEnabled) return next();
  const start = Date.now();
  const userId = (req as any)?.user?.id || (req.session as any)?.userId;
  const preview: Record<string, any> = {};
  try {
    if (req.method === 'POST' || req.method === 'PATCH') {
      const body: any = req.body || {};
      preview.pageContext = body.pageContext;
      preview.feedbackType = body.feedbackType;
      preview.priority = body.priority;
      preview.workshop = body.pageData?.workshop;
      if (typeof body.message === 'string') preview.messageLen = body.message.length;
    }
  } catch {}
  console.log('📝 [feedback]', {
    method: req.method,
    path: req.originalUrl || req.url,
    userId,
    query: req.query,
    ...preview,
  });
  res.on('finish', () => {
    console.log('✅ [feedback]', {
      status: res.statusCode,
      ms: Date.now() - start,
    });
  });
  next();
});

// Middleware to check if feedback system is enabled
const checkFeedbackEnabled = (req: any, res: any, next: any) => {
  if (!featureFlags.feedbackSystem.enabled) {
    return res.status(404).json({ error: 'Feedback system not available' });
  }
  next();
};

// Apply feature flag check to all routes
router.use(checkFeedbackEnabled);

// Submit feedback endpoint
router.post('/submit', requireAuth, async (req, res) => {
  try {
    const {
      pageContext,
      targetPage,
      feedbackType,
      message,
      experienceRating,
      priority,
      pageData,
      systemInfo
    } = req.body;

    // Validate required fields
    if (!pageContext || !feedbackType || !message || !pageData || !systemInfo) {
      return res.status(400).json({ 
        error: 'Missing required fields: pageContext, feedbackType, message, pageData, systemInfo' 
      });
    }

    // Validate enum values
    const validPageContexts = ['current', 'other', 'general'];
    const validFeedbackTypes = ['bug', 'feature', 'content', 'general'];
    const validPriorities = ['low', 'medium', 'high', 'blocker'];
    const validWorkshopTypes = ['ast', 'ia'];

    if (!validPageContexts.includes(pageContext)) {
      return res.status(400).json({ error: 'Invalid pageContext' });
    }

    if (!validFeedbackTypes.includes(feedbackType)) {
      return res.status(400).json({ error: 'Invalid feedbackType' });
    }

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority' });
    }

    if (!validWorkshopTypes.includes(pageData.workshop)) {
      return res.status(400).json({ error: 'Invalid workshop type' });
    }

    if (experienceRating && (experienceRating < 1 || experienceRating > 5)) {
      return res.status(400).json({ error: 'Experience rating must be between 1 and 5' });
    }

    // Create feedback record
    const newFeedback = await db.insert(feedback).values({
      userId: req.user.id,
      workshopType: pageData.workshop,
      pageContext,
      targetPage: pageContext === 'current' ? pageData.title : 
                  pageContext === 'other' ? targetPage : 
                  null,
      feedbackType,
      priority: priority || 'low',
      message: message.trim(),
      experienceRating,
      status: 'new',
      tags: [],
      systemInfo,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    console.log('Feedback submitted:', {
      id: newFeedback[0].id,
      userId: req.user.id,
      workshopType: pageData.workshop,
      feedbackType,
      priority: priority || 'low'
    });

    res.status(201).json({
      success: true,
      feedbackId: newFeedback[0].id,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get feedback counts for beta testers (MUST come before /:id route)
router.get('/beta-tester-counts', requireAdmin, async (req, res) => {
  try {
    // Get all users who are beta testers OR test users (since admins are both)
    const betaTesters = await db
      .select({ id: users.id, username: users.username, name: users.name })
      .from(users)
      .where(or(eq(users.isBetaTester, true), eq(users.isTestUser, true)));

    if (betaTesters.length === 0) {
      return res.json({
        success: true,
        betaTesters: [],
        message: 'No beta testers found'
      });
    }

    // Get feedback counts for each beta tester - only if there are beta testers
    const feedbackCounts = await db
      .select({
        userId: feedback.userId,
        count: count()
      })
      .from(feedback)
      .where(inArray(feedback.userId, betaTesters.map(u => u.id)))
      .groupBy(feedback.userId);

    // Create a map of userId to count
    const countMap: Record<number, number> = {};
    feedbackCounts.forEach(item => {
      if (item.userId) {
        countMap[item.userId] = item.count;
      }
    });

    // Create response with user info and counts
    const result = betaTesters.map(user => ({
      userId: user.id,
      username: user.username,
      name: user.name,
      ticketCount: countMap[user.id] || 0
    }));

    res.json({
      success: true,
      betaTesters: result,
      totalBetaTesters: betaTesters.length,
      totalTickets: feedbackCounts.reduce((sum, item) => sum + item.count, 0)
    });

  } catch (error) {
    console.error('Error fetching beta tester ticket counts:', error);
    res.status(500).json({ error: 'Failed to fetch beta tester ticket counts' });
  }
});

// Get feedback statistics for admin dashboard (MUST come before /:id route)
router.get('/stats/overview', requireAdmin, async (req, res) => {
  try {
    // Get overall stats
    const totalFeedback = await db.select().from(feedback);
    
    // Count by status
    const statusCounts = totalFeedback.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count by workshop type
    const workshopCounts = totalFeedback.reduce((acc, item) => {
      acc[item.workshopType] = (acc[item.workshopType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count by feedback type
    const typeCounts = totalFeedback.reduce((acc, item) => {
      acc[item.feedbackType] = (acc[item.feedbackType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count by priority
    const priorityCounts = totalFeedback.reduce((acc, item) => {
      acc[item.priority] = (acc[item.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Average experience rating
    const ratingsSum = totalFeedback
      .filter(item => item.experienceRating)
      .reduce((sum, item) => sum + (item.experienceRating || 0), 0);
    const ratingsCount = totalFeedback.filter(item => item.experienceRating).length;
    const averageRating = ratingsCount > 0 ? (ratingsSum / ratingsCount).toFixed(1) : null;

    // Recent feedback (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentFeedback = totalFeedback.filter(item => 
      new Date(item.createdAt) >= sevenDaysAgo
    );

    res.json({
      total: totalFeedback.length,
      statusCounts,
      workshopCounts,
      typeCounts,
      priorityCounts,
      averageRating,
      recentCount: recentFeedback.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({ error: 'Failed to fetch feedback statistics' });
  }
});

// Get feedback list for admin (with filtering and pagination)
router.get('/list', requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      status,
      workshopType,
      feedbackType,
      priority,
      search,
      userId
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // Build where conditions
    let whereConditions = [];
    
    if (status) {
      whereConditions.push(eq(feedback.status, status as string));
    }
    
    if (workshopType) {
      whereConditions.push(eq(feedback.workshopType, workshopType as string));
    }
    
    if (feedbackType) {
      whereConditions.push(eq(feedback.feedbackType, feedbackType as string));
    }
    
    if (priority) {
      whereConditions.push(eq(feedback.priority, priority as string));
    }
    
    if (search) {
      whereConditions.push(ilike(feedback.message, `%${search}%`));
    }

    if (userId) {
      whereConditions.push(eq(feedback.userId, Number(userId)));
    }

    // Get feedback with user information
    const feedbackList = await db
      .select({
        id: feedback.id,
        userId: feedback.userId,
        userName: users.name,
        userEmail: users.email,
        workshopType: feedback.workshopType,
        pageContext: feedback.pageContext,
        targetPage: feedback.targetPage,
        feedbackType: feedback.feedbackType,
        priority: feedback.priority,
        message: feedback.message,
        experienceRating: feedback.experienceRating,
        status: feedback.status,
        tags: feedback.tags,
        systemInfo: feedback.systemInfo,
        adminNotes: feedback.adminNotes,
        jiraTicketId: feedback.jiraTicketId,
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt,
      })
      .from(feedback)
      .leftJoin(users, eq(feedback.userId, users.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(feedback.createdAt))
      .limit(Number(limit))
      .offset(offset);

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: feedback.id })
      .from(feedback)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const totalCount = totalCountResult.length;

    res.json({
      feedback: feedbackList,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching feedback list:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Get single feedback item for admin
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const feedbackItem = await db
      .select({
        id: feedback.id,
        userId: feedback.userId,
        userName: users.name,
        userEmail: users.email,
        workshopType: feedback.workshopType,
        pageContext: feedback.pageContext,
        targetPage: feedback.targetPage,
        feedbackType: feedback.feedbackType,
        priority: feedback.priority,
        message: feedback.message,
        experienceRating: feedback.experienceRating,
        status: feedback.status,
        tags: feedback.tags,
        systemInfo: feedback.systemInfo,
        adminNotes: feedback.adminNotes,
        jiraTicketId: feedback.jiraTicketId,
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt,
      })
      .from(feedback)
      .leftJoin(users, eq(feedback.userId, users.id))
      .where(eq(feedback.id, id))
      .limit(1);

    if (feedbackItem.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json(feedbackItem[0]);

  } catch (error) {
    console.error('Error fetching feedback item:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Mark feedback as read
router.patch('/:id/mark-read', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const updatedFeedback = await db
      .update(feedback)
      .set({
        status: 'read',
        updatedAt: new Date()
      })
      .where(eq(feedback.id, id))
      .returning();

    if (updatedFeedback.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    console.log('Feedback marked as read:', {
      id,
      previousStatus: 'various',
      newStatus: 'read',
      markedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Feedback marked as read',
      feedback: updatedFeedback[0]
    });

  } catch (error) {
    console.error('Error marking feedback as read:', error);
    res.status(500).json({ error: 'Failed to mark feedback as read' });
  }
});

// Update feedback status and admin notes
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, jiraTicketId, tags } = req.body;

    // Validate status if provided
    const validStatuses = ['new', 'read', 'in_progress', 'resolved', 'archived'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date()
    };

    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (jiraTicketId !== undefined) updateData.jiraTicketId = jiraTicketId;
    if (tags !== undefined) updateData.tags = tags;

    const updatedFeedback = await db
      .update(feedback)
      .set(updateData)
      .where(eq(feedback.id, id))
      .returning();

    if (updatedFeedback.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    console.log('Feedback updated:', {
      id,
      status: status || 'unchanged',
      hasAdminNotes: !!adminNotes,
      jiraTicketId: jiraTicketId || 'none'
    });

    res.json({
      success: true,
      feedback: updatedFeedback[0]
    });

  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ error: 'Failed to update feedback' });
  }
});

// Bulk mark feedback as read
router.patch('/bulk/mark-read', requireAdmin, async (req, res) => {
  try {
    const { feedbackIds } = req.body;

    if (!feedbackIds || !Array.isArray(feedbackIds) || feedbackIds.length === 0) {
      return res.status(400).json({ error: 'feedbackIds array is required' });
    }

    const updatedFeedback = await db
      .update(feedback)
      .set({
        status: 'read',
        updatedAt: new Date()
      })
      .where(inArray(feedback.id, feedbackIds))
      .returning({ id: feedback.id });

    console.log('Bulk feedback marked as read:', {
      count: updatedFeedback.length,
      feedbackIds: feedbackIds.slice(0, 5), // Log first 5 IDs for reference
      markedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `${updatedFeedback.length} feedback items marked as read`,
      markedCount: updatedFeedback.length,
      markedIds: updatedFeedback.map(f => f.id)
    });

  } catch (error) {
    console.error('Error bulk marking feedback as read:', error);
    res.status(500).json({ error: 'Failed to bulk mark feedback as read' });
  }
});

// Bulk update feedback items
router.patch('/bulk/update', requireAdmin, async (req, res) => {
  try {
    const { feedbackIds, status, tags } = req.body;

    if (!feedbackIds || !Array.isArray(feedbackIds) || feedbackIds.length === 0) {
      return res.status(400).json({ error: 'feedbackIds array is required' });
    }

    // Validate status if provided
    const validStatuses = ['new', 'read', 'in_progress', 'resolved', 'archived'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date()
    };

    if (status) updateData.status = status;
    if (tags !== undefined) updateData.tags = tags;

    const updatedFeedback = await db
      .update(feedback)
      .set(updateData)
      .where(inArray(feedback.id, feedbackIds))
      .returning({ id: feedback.id });

    console.log('Bulk feedback update:', {
      count: updatedFeedback.length,
      status: status || 'unchanged',
      feedbackIds: feedbackIds.slice(0, 5) // Log first 5 IDs for reference
    });

    res.json({
      success: true,
      updatedCount: updatedFeedback.length,
      updatedIds: updatedFeedback.map(f => f.id)
    });

  } catch (error) {
    console.error('Error bulk updating feedback:', error);
    res.status(500).json({ error: 'Failed to bulk update feedback' });
  }
});

// Delete feedback item permanently
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFeedback = await db
      .delete(feedback)
      .where(eq(feedback.id, id))
      .returning({ id: feedback.id });

    if (deletedFeedback.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    console.log('Feedback deleted permanently:', {
      id,
      deletedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Feedback deleted permanently',
      deletedId: deletedFeedback[0].id
    });

  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

// Bulk delete feedback items
router.delete('/bulk/delete', requireAdmin, async (req, res) => {
  try {
    const { feedbackIds } = req.body;

    if (!feedbackIds || !Array.isArray(feedbackIds) || feedbackIds.length === 0) {
      return res.status(400).json({ error: 'feedbackIds array is required' });
    }

    const deletedFeedback = await db
      .delete(feedback)
      .where(inArray(feedback.id, feedbackIds))
      .returning({ id: feedback.id });

    console.log('Bulk feedback deletion:', {
      count: deletedFeedback.length,
      feedbackIds: feedbackIds.slice(0, 5), // Log first 5 IDs for reference
      deletedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      deletedCount: deletedFeedback.length,
      deletedIds: deletedFeedback.map(f => f.id)
    });

  } catch (error) {
    console.error('Error bulk deleting feedback:', error);
    res.status(500).json({ error: 'Failed to bulk delete feedback' });
  }
});

// Export feedback to CSV
router.post('/export/csv', requireAdmin, async (req, res) => {
  try {
    const {
      status,
      workshopType,
      feedbackType,
      priority,
      search
    } = req.body;

    // Build where conditions (same as list endpoint)
    let whereConditions = [];
    
    if (status) {
      whereConditions.push(eq(feedback.status, status as string));
    }
    
    if (workshopType) {
      whereConditions.push(eq(feedback.workshopType, workshopType as string));
    }
    
    if (feedbackType) {
      whereConditions.push(eq(feedback.feedbackType, feedbackType as string));
    }
    
    if (priority) {
      whereConditions.push(eq(feedback.priority, priority as string));
    }
    
    if (search) {
      whereConditions.push(ilike(feedback.message, `%${search}%`));
    }

    // Get all feedback with user information (no pagination for export)
    const feedbackList = await db
      .select({
        id: feedback.id,
        userId: feedback.userId,
        userName: users.name,
        userEmail: users.email,
        workshopType: feedback.workshopType,
        pageContext: feedback.pageContext,
        targetPage: feedback.targetPage,
        feedbackType: feedback.feedbackType,
        priority: feedback.priority,
        message: feedback.message,
        experienceRating: feedback.experienceRating,
        status: feedback.status,
        tags: feedback.tags,
        systemInfo: feedback.systemInfo,
        adminNotes: feedback.adminNotes,
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt,
      })
      .from(feedback)
      .leftJoin(users, eq(feedback.userId, users.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(feedback.createdAt));

    // Generate CSV content
    const csvHeaders = [
      'ID',
      'Date',
      'User Name',
      'User Email',
      'Workshop',
      'Page Context',
      'Target Page',
      'Type',
      'Priority',
      'Status',
      'Experience Rating',
      'Message',
      'Admin Notes',
      'Browser',
      'OS',
      'Updated At'
    ];

    const csvRows = feedbackList.map(item => {
      const systemInfo = item.systemInfo as any;
      return [
        item.id,
        new Date(item.createdAt).toISOString(),
        item.userName || 'Anonymous',
        item.userEmail || 'N/A',
        item.workshopType.toUpperCase(),
        item.pageContext,
        item.targetPage || 'N/A',
        item.feedbackType,
        item.priority,
        item.status,
        item.experienceRating || 'N/A',
        `"${(item.message || '').replace(/"/g, '""')}"`, // Escape quotes in CSV
        `"${(item.adminNotes || '').replace(/"/g, '""')}"`, // Escape quotes in CSV
        systemInfo?.browser || 'Unknown',
        systemInfo?.os || 'Unknown',
        new Date(item.updatedAt).toISOString()
      ];
    });

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    // Set CSV headers
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `feedback-export-${timestamp}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    console.log('Feedback CSV export:', {
      totalRecords: feedbackList.length,
      filters: { status, workshopType, feedbackType, priority, hasSearch: !!search },
      exportedAt: new Date().toISOString()
    });

    res.send(csvContent);

  } catch (error) {
    console.error('Error exporting feedback to CSV:', error);
    res.status(500).json({ error: 'Failed to export feedback' });
  }
});

export default router;
