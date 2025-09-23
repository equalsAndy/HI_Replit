import express from 'express';
import puppeteer from 'puppeteer';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';
import path from 'path';
import { db } from '../db.js';
import { users, userAssessments } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const execAsync = promisify(exec);
const router = express.Router();

// Generate comprehensive HI Holistic Development Report
router.get('/generate/:userId', async (req, res) => {
  try {
    const userId = req.params.userId === 'me' ? (req.session as any).userId : parseInt(req.params.userId);
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Fetch user data
    const user = await db.select().from(users).where(eq(users.id, userId));
    if (!user.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch all assessments
    const assessments = await db.select().from(userAssessments).where(eq(userAssessments.userId, userId));
    
    // Organize assessment data
    const reportData = {
      user: user[0],
      assessments: {} as any
    };

    assessments.forEach(assessment => {
      try {
        (reportData.assessments as any)[assessment.assessmentType] = JSON.parse(assessment.results);
      } catch (error) {
        console.error(`Error parsing assessment data for ${assessment.assessmentType}:`, error);
        (reportData.assessments as any)[assessment.assessmentType] = {};
      }
    });

    // Check required assessments
    const requiredAssessments = ['starCard', 'flowAssessment', 'cantrilLadder', 'stepByStepReflection'];
    const missingAssessments = requiredAssessments.filter(type => !(reportData.assessments as any)[type]);
    
    if (missingAssessments.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot generate report - missing required assessments',
        missing: missingAssessments 
      });
    }

    // Generate comprehensive HTML report
    const html = generateComprehensiveReportHTML(reportData);
    
    // Find Chromium executable
    let chromiumPath: string;
    try {
      const { stdout } = await execAsync('which google-chrome');
      chromiumPath = stdout.trim();
    } catch {
      try {
        const { stdout } = await execAsync('which chromium-browser');
        chromiumPath = stdout.trim();
      } catch {
        chromiumPath = '/usr/bin/google-chrome';
      }
    }

    // Generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: chromiumPath,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
      printBackground: true
    });
    
    await browser.close();

    // Save and serve PDF
    const fileName = `HI-Report-${user[0].name?.replace(/[^a-zA-Z0-9]/g, '-') || 'User'}-${Date.now()}.pdf`;
    const filePath = path.join(process.cwd(), 'uploads', fileName);
    
    await writeFile(filePath, pdf);
    
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error sending PDF file:', err);
        res.status(500).json({ error: 'Failed to send PDF file' });
      }
    });

  } catch (error) {
    console.error('Enhanced report generation failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate HTML version of the report for viewing in browser
router.get('/html/:userId', async (req, res) => {
  try {
    const userId = req.params.userId === 'me' ? (req.session as any).userId : parseInt(req.params.userId);
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Fetch user data
    const user = await db.select().from(users).where(eq(users.id, userId));
    if (!user.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch all assessments
    const assessments = await db.select().from(userAssessments).where(eq(userAssessments.userId, userId));
    
    // Organize assessment data
    const reportData = {
      user: user[0],
      assessments: {} as any
    };

    assessments.forEach(assessment => {
      try {
        (reportData.assessments as any)[assessment.assessmentType] = JSON.parse(assessment.results);
      } catch (error) {
        console.error(`Error parsing assessment data for ${assessment.assessmentType}:`, error);
        (reportData.assessments as any)[assessment.assessmentType] = {};
      }
    });

    // Check required assessments
    const requiredAssessments = ['starCard', 'flowAssessment', 'cantrilLadder', 'stepByStepReflection'];
    const missingAssessments = requiredAssessments.filter(type => !(reportData.assessments as any)[type]);
    
    if (missingAssessments.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot generate report - missing required assessments',
        missing: missingAssessments 
      });
    }

    // Generate comprehensive HTML report
    const html = generateComprehensiveReportHTML(reportData);
    
    // Set content type to HTML and send
    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (error) {
    console.error('HTML report generation failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function generateComprehensiveReportHTML(data: any): string {
  const starCard = data.assessments?.starCard || {};
  const cantril = data.assessments?.cantrilLadder || {};
  const flow = data.assessments?.flowAssessment || {};
  const flowAttributes = data.assessments?.flowAttributes || {};
  const stepByStep = data.assessments?.stepByStepReflection || {};
  const roundingOut = data.assessments?.roundingOutReflection || {};
  // futureSelfReflection fields deprecated; intentionally omitted
  const finalReflection = data.assessments?.finalReflection || {};
  
  const userName = data.user?.name || 'Participant';
  const userTitle = data.user?.jobTitle || '';
  const userOrg = data.user?.organization || '';
  
  // Calculate strength percentages
  const total = (starCard.thinking || 0) + (starCard.acting || 0) + (starCard.feeling || 0) + (starCard.planning || 0);
  const strengthPercentages = {
    thinking: total > 0 ? ((starCard.thinking || 0) / total * 100).toFixed(1) : '0.0',
    acting: total > 0 ? ((starCard.acting || 0) / total * 100).toFixed(1) : '0.0',
    feeling: total > 0 ? ((starCard.feeling || 0) / total * 100).toFixed(1) : '0.0',
    planning: total > 0 ? ((starCard.planning || 0) / total * 100).toFixed(1) : '0.0'
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>HI Holistic Development Report: ${userName}</title>
  <style>
    ${getEnhancedReportCSS()}
  </style>
</head>
<body>
  <div class="report-container">
    ${generateExecutiveSummaryContent(starCard, stepByStep, userName, strengthPercentages)}
    ${generateStrengthsTableContent(strengthPercentages, stepByStep)}
    ${generateFlowOptimizationContent(flow, flowAttributes)}
    ${generateWellbeingContent(cantril)}
    ${generateFutureVisionContent(futureSelf, cantril)}
    ${generateConstraintsContent(roundingOut, stepByStep, strengthPercentages)}
    ${generateTeamSynergyContent(stepByStep, strengthPercentages)}
    ${generateReflectionContent(finalReflection, roundingOut)}
    ${generateAIRecommendationsContent(strengthPercentages, flow, userName)}
  </div>
</body>
</html>
  `;
}

function generateExecutiveSummaryContent(starCard: any, stepByStep: any, userName: string, percentages: any): string {
  return `
    <div class="executive-summary">
      <h1>Executive Summary: ${userName}</h1>
      <p>This comprehensive report provides insights into your holistic development profile.</p>
    </div>
  `;
}

function generateStrengthsTableContent(percentages: any, stepByStep: any): string {
  return `
    <div class="strengths-table">
      <h2>Strengths Profile</h2>
      <table>
        <tr><td>Thinking</td><td>${percentages.thinking}%</td></tr>
        <tr><td>Acting</td><td>${percentages.acting}%</td></tr>
        <tr><td>Feeling</td><td>${percentages.feeling}%</td></tr>
        <tr><td>Planning</td><td>${percentages.planning}%</td></tr>
      </table>
    </div>
  `;
}

function generateFlowOptimizationContent(flow: any, flowAttributes: any): string {
  return `
    <div class="flow-optimization">
      <h2>Flow Optimization</h2>
      <p>Your flow assessment results and optimization recommendations.</p>
    </div>
  `;
}

function generateWellbeingContent(cantril: any): string {
  return `
    <div class="wellbeing">
      <h2>Well-being Assessment</h2>
      <p>Your well-being ladder assessment results.</p>
    </div>
  `;
}

function generateFutureVisionContent(futureSelf: any, cantril: any): string {
  return `
    <div class="future-vision">
      <h2>Future Vision</h2>
      <p>Your future self reflection and vision.</p>
    </div>
  `;
}

function generateConstraintsContent(roundingOut: any, stepByStep: any, percentages: any): string {
  return `
    <div class="constraints">
      <h2>Constraints and Challenges</h2>
      <p>Areas for development and growth.</p>
    </div>
  `;
}

function generateTeamSynergyContent(stepByStep: any, percentages: any): string {
  return `
    <div class="team-synergy">
      <h2>Team Synergy</h2>
      <p>How your strengths contribute to team dynamics.</p>
    </div>
  `;
}

function generateReflectionContent(finalReflection: any, roundingOut: any): string {
  return `
    <div class="reflection">
      <h2>Personal Reflection</h2>
      <p>Your reflections and insights from the workshop.</p>
    </div>
  `;
}

function generateAIRecommendationsContent(percentages: any, flow: any, userName: string): string {
  return `
    <div class="ai-recommendations">
      <h2>AI-Powered Recommendations</h2>
      <p>Personalized recommendations based on your assessment results.</p>
    </div>
  `;
}

function getEnhancedReportCSS(): string {
  return `
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .report-container {
      max-width: 800px;
      margin: 0 auto;
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1, h2 {
      color: #333;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    table td {
      padding: 8px;
      border: 1px solid #ddd;
    }
    .executive-summary,
    .strengths-table,
    .flow-optimization,
    .wellbeing,
    .future-vision,
    .constraints,
    .team-synergy,
    .reflection,
    .ai-recommendations {
      margin: 20px 0;
      padding: 15px;
      border-left: 4px solid #007bff;
    }
  `;
}

export default router;
