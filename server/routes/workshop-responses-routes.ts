/**
 * Workshop Responses Routes
 * =========================
 * API endpoints for viewing workshop questions and answers.
 */

import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { workshopResponsesService } from '../services/workshop-responses-service.js';
import { workshopResponsesTemplateService } from '../services/workshop-responses-template-service.js';

const router = express.Router();

/**
 * GET /api/workshop-responses/:userId
 * Returns HTML document with all workshop questions and answers
 */
router.get('/:userId', requireAuth, async (req, res) => {
  try {
    const { userId: urlUserId } = req.params;
    const sessionUserId = req.session?.userId;

    // SECURITY: Validate authenticated user matches the userId in URL
    if (!sessionUserId || sessionUserId.toString() !== urlUserId) {
      console.log(`❌ SECURITY: User ${sessionUserId} attempted to view responses for user ${urlUserId}`);
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only view your own workshop responses'
      });
    }

    console.log(`📋 Generating workshop responses document for user ${sessionUserId}`);

    // Get workshop responses data
    const data = await workshopResponsesService.getWorkshopResponses(sessionUserId.toString());

    // Generate HTML document
    const html = workshopResponsesTemplateService.generateHTML(data);

    // Set headers for HTML response
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    // Send HTML
    res.send(html);

    console.log(`✅ Workshop responses document generated for ${data.participant.name}`);

  } catch (error) {
    console.error('❌ Error generating workshop responses:', error);

    // Return user-friendly error page
    const errorHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error Loading Workshop Responses</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #f9fafb;
            margin: 0;
            padding: 20px;
          }
          .error-container {
            max-width: 600px;
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            text-align: center;
          }
          h1 {
            color: #dc2626;
            margin-bottom: 20px;
          }
          p {
            color: #6b7280;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          a {
            display: inline-block;
            background: #7c3aed;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
          }
          a:hover {
            background: #6d28d9;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1>Unable to Load Workshop Responses</h1>
          <p>
            We encountered an error while generating your workshop responses document.
            This might be because you haven't completed the workshop yet, or there was
            a temporary technical issue.
          </p>
          <p style="color: #dc2626; font-size: 0.9rem;">
            Error: ${error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <a href="/workshop/ast">Return to Workshop</a>
        </div>
      </body>
      </html>
    `;

    res.status(500).send(errorHtml);
  }
});

export default router;
