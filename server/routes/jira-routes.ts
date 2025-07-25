import express from 'express';
import { 
  searchJiraTickets, 
  getJiraTicket, 
  getAIRelatedTickets, 
  getProjectTickets,
  generateDevStatusReport 
} from '../utils/jiraIntegration.js';
import { requireDevelopment } from '../middleware/validateFlags.js';

const router = express.Router();

// Get tickets from specific projects
router.get('/projects', async (req, res) => {
  try {
    const tickets = await getProjectTickets();
    res.json({
      success: true,
      projects: tickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project tickets',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Search tickets with filters
router.get('/search', async (req, res) => {
  try {
    const { projects, status, assignee, type, limit } = req.query;
    
    const searchOptions = {
      projects: projects ? (projects as string).split(',') : undefined,
      status: status ? (status as string).split(',') : undefined,
      assignee: assignee as string,
      type: type ? (type as string).split(',') : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    };
    
    const tickets = await searchJiraTickets(searchOptions);
    res.json({
      success: true,
      tickets,
      count: tickets.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to search tickets',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get specific ticket details
router.get('/ticket/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const ticket = await getJiraTicket(key);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: `Ticket ${key} not found`
      });
    }
    
    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ticket',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get AI-related tickets (development only)
router.get('/ai-related', requireDevelopment, async (req, res) => {
  try {
    const tickets = await getAIRelatedTickets();
    res.json({
      success: true,
      tickets,
      count: tickets.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI-related tickets',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Development status report combining Jira + feature flags
router.get('/dev-status', requireDevelopment, async (req, res) => {
  try {
    const report = await generateDevStatusReport();
    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate development status report',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;