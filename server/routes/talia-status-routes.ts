/**
 * Talia Status Routes
 * ==================
 * Check if Reflection Talia and Report Talia are connected and working
 */

import express from 'express';
import { generateOpenAICoachingResponse, isOpenAIAPIAvailable } from '../services/openai-api-service.js';

const router = express.Router();

/**
 * GET /api/talia-status/reflection
 * Test if Reflection Talia is connected and working
 */
router.get('/reflection', async (req, res) => {
  try {
    // Quick basic availability check
    if (!isOpenAIAPIAvailable()) {
      return res.json({
        connected: false,
        status: 'api_key_missing',
        message: 'OpenAI API key not configured'
      });
    }

    // Test actual API connection with a simple message
    const testResponse = await generateOpenAICoachingResponse({
      userMessage: 'Hello',
      personaType: 'ast_reflection',
      userName: 'Test User',
      contextData: { stepId: 'test' },
      maxTokens: 50
    });

    // If we got a response and it's not a fallback error message
    const isConnected = testResponse && 
                       !testResponse.includes('having trouble connecting') &&
                       !testResponse.includes('connection error');

    res.json({
      connected: isConnected,
      status: isConnected ? 'connected' : 'connection_failed',
      message: isConnected ? 'Reflection Talia is ready' : 'Talia is feeling disconnected, she\'ll be back later.',
      testResponse: process.env.NODE_ENV === 'development' ? testResponse.substring(0, 100) + '...' : undefined
    });

  } catch (error) {
    console.error('❌ Talia connection test failed:', error);
    
    res.json({
      connected: false,
      status: 'connection_error',
      message: 'Talia is feeling disconnected, she\'ll be back later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/talia-status/reports
 * Test if Report Talia (report generation) is working
 */
router.get('/reports', async (req, res) => {
  try {
    // Quick basic availability check
    if (!isOpenAIAPIAvailable()) {
      return res.json({
        connected: false,
        status: 'api_key_missing',
        message: 'Report generation unavailable - API not configured'
      });
    }

    // Test with a minimal report generation call
    const testResponse = await generateOpenAICoachingResponse({
      userMessage: 'Generate a test response',
      personaType: 'star_report',
      userName: 'Test User',
      contextData: { 
        reportContext: 'test',
        selectedUserId: 1,
        selectedUserName: 'Test User',
        userData: { basic: 'test' }
      },
      maxTokens: 50
    });

    const isConnected = testResponse && 
                       !testResponse.includes('having trouble connecting') &&
                       !testResponse.includes('connection error');

    res.json({
      connected: isConnected,
      status: isConnected ? 'connected' : 'connection_failed',
      message: isConnected ? 'Report generation available' : 'Report generation temporarily unavailable',
      testResponse: process.env.NODE_ENV === 'development' ? testResponse.substring(0, 100) + '...' : undefined
    });

  } catch (error) {
    console.error('❌ Report Talia connection test failed:', error);
    
    res.json({
      connected: false,
      status: 'connection_error', 
      message: 'Report generation temporarily unavailable',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/talia-status/all
 * Get status of both Reflection Talia and Report Talia
 */
router.get('/all', async (req, res) => {
  try {
    // Run both tests in parallel
    const [reflectionTest, reportsTest] = await Promise.allSettled([
      fetch(`${req.protocol}://${req.get('host')}/api/talia-status/reflection`).then(r => r.json()),
      fetch(`${req.protocol}://${req.get('host')}/api/talia-status/reports`).then(r => r.json())
    ]);

    const reflectionStatus = reflectionTest.status === 'fulfilled' ? reflectionTest.value : { connected: false };
    const reportsStatus = reportsTest.status === 'fulfilled' ? reportsTest.value : { connected: false };

    res.json({
      reflection: reflectionStatus,
      reports: reportsStatus,
      overall: {
        anyConnected: reflectionStatus.connected || reportsStatus.connected,
        allConnected: reflectionStatus.connected && reportsStatus.connected,
        status: reflectionStatus.connected && reportsStatus.connected ? 'all_connected' :
                reflectionStatus.connected || reportsStatus.connected ? 'partial_connection' :
                'disconnected'
      },
      // Back-compat summary fields expected by admin UI
      openai: isOpenAIAPIAvailable(),
      reflection_talia: !!reflectionStatus.connected,
      report_talia: !!reportsStatus.connected,
      response_time: null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Overall Talia status check failed:', error);
    
    res.json({
      reflection: { connected: false },
      reports: { connected: false },
      overall: {
        anyConnected: false,
        allConnected: false,
        status: 'error'
      },
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
