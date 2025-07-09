import express from 'express';
import puppeteer from 'puppeteer';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';
import path from 'path';
import { db } from '../db';
import { users, userAssessments } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const execAsync = promisify(exec);
const router = express.Router();

// Generate comprehensive HI Holistic Development Report
router.get('/generate/:userId', async (req, res) => {
  try {
    const userId = req.params.userId === 'me' ? req.session.userId : parseInt(req.params.userId);
    
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
      assessments: {}
    };

    assessments.forEach(assessment => {
      try {
        reportData.assessments[assessment.assessmentType] = JSON.parse(assessment.results);
      } catch (error) {
        console.error(`Error parsing assessment data for ${assessment.assessmentType}:`, error);
        reportData.assessments[assessment.assessmentType] = {};
      }
    });

    // Check required assessments
    const requiredAssessments = ['starCard', 'flowAssessment', 'cantrilLadder', 'stepByStepReflection'];
    const missingAssessments = requiredAssessments.filter(type => !reportData.assessments[type]);
    
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
    const userId = req.params.userId === 'me' ? req.session.userId : parseInt(req.params.userId);
    
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
      assessments: {}
    };

    assessments.forEach(assessment => {
      try {
        reportData.assessments[assessment.assessmentType] = JSON.parse(assessment.results);
      } catch (error) {
        console.error(`Error parsing assessment data for ${assessment.assessmentType}:`, error);
        reportData.assessments[assessment.assessmentType] = {};
      }
    });

    // Check required assessments
    const requiredAssessments = ['starCard', 'flowAssessment', 'cantrilLadder', 'stepByStepReflection'];
    const missingAssessments = requiredAssessments.filter(type => !reportData.assessments[type]);
    
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
  const futureSelf = data.assessments?.futureSelfReflection || {};
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
    <!-- Header -->
    <header class="report-header">
      <div class="header-content">
        <div class="hi-logo">
          <div class="logo-circle">HI</div>
        </div>
        <div class="header-text">
          <h1>HI Holistic Development Report: ${userName}</h1>
          <div class="participant-info">
            <p><strong>PARTICIPANT:</strong> ${userName}</p>
            <p><strong>Role:</strong> ${userTitle}</p>
            <p><strong>Organization:</strong> ${userOrg}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </header>

    <!-- 1. Executive Summary -->
    <section class="section">
      <h2 class="section-title">1. EXECUTIVE SUMMARY</h2>
      <div class="content-block">
        <p>A concise overview of ${userName}'s unique strengths, flow patterns, well-being, and forward-looking vision, synthesized from self-assessments, reflections, and insights.</p>
        ${generateExecutiveSummaryContent(starCard, stepByStep, userName, strengthPercentages)}
      </div>
    </section>

    <!-- 2. Core Strengths Profile -->
    <section class="section">
      <h2 class="section-title">2. CORE STRENGTHS PROFILE</h2>
      <div class="content-block">
        <h3>Star Card Summary</h3>
        ${generateStrengthsTableContent(strengthPercentages, stepByStep)}
      </div>
    </section>

    <!-- 3. Flow Optimization -->
    <section class="section">
      <h2 class="section-title">3. FLOW OPTIMIZATION</h2>
      <div class="content-block">
        ${generateFlowOptimizationContent(flow, flowAttributes)}
      </div>
    </section>

    <!-- 4. Well-being & Self-Care -->
    <section class="section">
      <h2 class="section-title">4. WELL-BEING & SELF-CARE</h2>
      <div class="content-block">
        ${generateWellbeingContent(cantril)}
      </div>
    </section>

    <!-- 5. Future Vision & Growth Plan -->
    <section class="section">
      <h2 class="section-title">5. FUTURE VISION & GROWTH PLAN</h2>
      <div class="content-block">
        ${generateFutureVisionContent(futureSelf, cantril)}
      </div>
    </section>

    <!-- 6. Strengths, Constraints & Development -->
    <section class="section">
      <h2 class="section-title">6. STRENGTHS, CONSTRAINTS, AND DEVELOPMENT OPPORTUNITIES</h2>
      <div class="content-block">
        ${generateConstraintsContent(roundingOut, stepByStep, strengthPercentages)}
      </div>
    </section>

    <!-- 7. Team Synergy -->
    <section class="section">
      <h2 class="section-title">7. TEAM SYNERGY & COMPLEMENTARY STRENGTHS</h2>
      <div class="content-block">
        ${generateTeamSynergyContent(stepByStep, strengthPercentages)}
      </div>
    </section>

    <!-- 8. Reflection & Next Steps -->
    <section class="section">
      <h2 class="section-title">8. REFLECTION & NEXT STEPS</h2>
      <div class="content-block">
        ${generateReflectionContent(finalReflection, roundingOut)}
      </div>
    </section>

    <!-- 9. AI-Powered Recommendations -->
    <section class="section">
      <h2 class="section-title">9. AI-POWERED FORWARD-LOOKING RECOMMENDATIONS</h2>
      <div class="content-block">
        ${generateAIRecommendationsContent(strengthPercentages, flow, userName)}
      </div>
    </section>

    <!-- Footer -->
    <footer class="report-footer">
      <p>Generated on ${new Date().toLocaleDateString()} | HI Holistic Development Platform</p>
    </footer>
  </div>
</body>
</html>
`;
}

function generateExecutiveSummaryContent(starCard: any, stepByStep: any, userName: string, percentages: any): string {
  const topStrength = Object.entries(percentages).reduce((a, b) => parseFloat(String(a[1])) > parseFloat(String(b[1])) ? a : b);
  const strengthName = String(topStrength[0]).charAt(0).toUpperCase() + String(topStrength[0]).slice(1);
  
  return `
    <div class="summary-content">
      <p>${userName} demonstrates a unique combination of strengths with ${strengthName} as their primary strength (${topStrength[1]}%). 
      Their assessment reveals a well-rounded profile with strong capabilities in ${Object.entries(percentages)
        .filter(([, value]) => parseFloat(String(value)) > 20)
        .map(([key]) => key)
        .join(', ')}.</p>
      
      <p>Key insights from their self-reflection indicate ${stepByStep.reflections?.uniqueContribution || 'a systematic approach to challenges with focus on collaborative problem-solving'}.</p>
    </div>
  `;
}

function generateStrengthsTableContent(percentages: any, stepByStep: any): string {
  const reflections = stepByStep.reflections || {};
  
  return `
    <table class="strengths-table">
      <thead>
        <tr>
          <th>Strength Area</th>
          <th>Percentage</th>
          <th>Key Reflection Highlights</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Feeling</td>
          <td>${percentages.feeling}%</td>
          <td>${reflections.strength4 || 'Empathy, team support, emotional intelligence'}</td>
        </tr>
        <tr>
          <td>Acting</td>
          <td>${percentages.acting}%</td>
          <td>${reflections.strength3 || 'Initiative, rapid execution, energy in implementation'}</td>
        </tr>
        <tr>
          <td>Thinking</td>
          <td>${percentages.thinking}%</td>
          <td>${reflections.strength2 || 'Problem-solving, analytical approach, innovation'}</td>
        </tr>
        <tr>
          <td>Planning</td>
          <td>${percentages.planning}%</td>
          <td>${reflections.strength1 || 'Strategic thinking, organization, systematic approach'}</td>
        </tr>
      </tbody>
    </table>
  `;
}

function generateFlowOptimizationContent(flow: any, flowAttributes: any): string {
  const flowScore = flow.flowScore || 0;
  const attributes = flowAttributes.attributes || [];
  
  return `
    <div class="flow-content">
      <p><strong>Flow Score:</strong> ${flowScore}/60</p>
      
      <h4>Flow Triggers & Patterns</h4>
      <ul>
        <li><strong>Peak Flow Indicators:</strong> Deep focus states, creative immersion, time distortion</li>
        <li><strong>Flow Catalysts:</strong> Uninterrupted focus time, challenging but achievable tasks</li>
        <li><strong>Optimal Conditions:</strong> ${attributes.map(attr => attr.name).join(', ') || 'Structured environment with clear objectives'}</li>
      </ul>
      
      <div class="ai-suggestion">
        <h4>AI Analysis Prompt:</h4>
        <p><em>How can this person further optimize their work environment to maximize flow?</em></p>
        
        <h4>AI Suggestion:</h4>
        <p>Schedule critical and creative tasks during optimal focus periods; minimize interruptions during deep work; leverage top attributes (${attributes.slice(0, 2).map(attr => attr.name).join(', ')}) to structure challenging projects.</p>
      </div>
    </div>
  `;
}

function generateWellbeingContent(cantril: any): string {
  const currentLevel = cantril.wellBeingLevel || 7;
  const futureLevel = cantril.futureWellBeingLevel || 9;
  
  return `
    <div class="wellbeing-content">
      <h4>Ladder of Well-being Self-Assessment</h4>
      <p><strong>(Scale: 0–10, 10 = Best Possible Life)</strong></p>
      <p><strong>Current Self-Rating:</strong> ${currentLevel}/10</p>
      
      <h4>Well-being Reflections:</h4>
      <ul>
        <li><strong>Current Factors:</strong> ${cantril.currentFactors || 'Strong professional foundation, supportive relationships, meaningful work'}</li>
        <li><strong>Future Vision:</strong> Target level ${futureLevel}/10</li>
        <li><strong>Improvements Needed:</strong> ${cantril.futureImprovements || 'Enhanced work-life balance, expanded growth opportunities'}</li>
      </ul>
      
      <div class="ai-suggestion">
        <h4>AI Analysis Prompt:</h4>
        <p><em>What well-being practices could this person strengthen to sustain high performance?</em></p>
        
        <h4>AI Suggestion:</h4>
        <p>Focus on ${cantril.quarterlyActions || 'maintaining current positive practices while building new habits that support long-term growth and resilience'}.</p>
      </div>
    </div>
  `;
}

function generateFutureVisionContent(futureSelf: any, cantril: any): string {
  return `
    <div class="vision-content">
      <h4>Future Self Questionnaire</h4>
      <ul>
        <li><strong>5 Years:</strong> ${futureSelf.futureSelfDescription?.split('.')[0] || 'Advanced leadership role with expanded influence'}</li>
        <li><strong>10 Years:</strong> ${futureSelf.futureSelfDescription?.split('.')[1] || 'Strategic leadership position shaping organizational direction'}</li>
        <li><strong>20 Years:</strong> ${futureSelf.futureSelfDescription?.split('.')[2] || 'Industry thought leader making lasting impact'}</li>
      </ul>
      
      <h4>Vision Statement:</h4>
      <p>"${futureSelf.visualizationNotes || 'My vision is to lead with authenticity and innovation, creating meaningful change through collaborative excellence and continuous growth.'}"</p>
      
      <div class="ai-suggestion">
        <h4>AI Analysis Prompt:</h4>
        <p><em>What actionable steps can this person take toward their vision?</em></p>
        
        <h4>AI Suggestion:</h4>
        <p>${cantril.quarterlyActions || 'Seek cross-functional leadership opportunities; build strategic networks; develop expertise in emerging areas; document and share learning journeys.'}</p>
      </div>
    </div>
  `;
}

function generateConstraintsContent(roundingOut: any, stepByStep: any, percentages: any): string {
  const lowestStrength = Object.entries(percentages).reduce((a, b) => parseFloat(String(a[1])) < parseFloat(String(b[1])) ? a : b);
  
  return `
    <div class="constraints-content">
      <h4>Strengths in Action</h4>
      <ul>
        <li><strong>Primary Strength:</strong> ${Object.entries(percentages).reduce((a, b) => parseFloat(String(a[1])) > parseFloat(String(b[1])) ? a : b)[0]} - ${stepByStep.reflections?.strength1 || 'Core capability driving success'}</li>
        <li><strong>Supporting Strengths:</strong> Balanced approach across multiple areas</li>
      </ul>
      
      <h4>Constraints & Stretch Zones</h4>
      <ul>
        <li><strong>Development Area:</strong> ${lowestStrength[0]} (${lowestStrength[1]}%) - ${roundingOut.values || 'Opportunity for growth and skill building'}</li>
        <li><strong>Stress Triggers:</strong> ${roundingOut.strengths || 'High-pressure situations with unclear expectations'}</li>
      </ul>
      
      <div class="ai-suggestion">
        <h4>AI Analysis Prompt:</h4>
        <p><em>How can this person leverage their strengths to overcome constraints and achieve more flow?</em></p>
        
        <h4>AI Suggestion:</h4>
        <p>Focus on ${roundingOut.growthAreas || 'building complementary skills while maximizing existing strengths through strategic partnerships and structured development opportunities'}.</p>
      </div>
    </div>
  `;
}

function generateTeamSynergyContent(stepByStep: any, percentages: any): string {
  return `
    <div class="synergy-content">
      <h4>Complementary Strengths Valued in Others</h4>
      <ul>
        <li><strong>Strategic Partners:</strong> ${stepByStep.reflections?.teamValues || 'Detail-oriented planners who provide structure and clarity'}</li>
        <li><strong>Collaborative Preferences:</strong> ${stepByStep.reflections?.uniqueContribution || 'Team members who balance different thinking styles and approaches'}</li>
      </ul>
      
      <div class="ai-suggestion">
        <h4>AI Analysis Prompt:</h4>
        <p><em>How can this person and their team create collective flow and well-being?</em></p>
        
        <h4>AI Suggestion:</h4>
        <p>Foster trust-based team cultures; encourage open reflection and feedback; align tasks with individual and team flow patterns; leverage diverse strengths for optimal outcomes.</p>
      </div>
    </div>
  `;
}

function generateReflectionContent(finalReflection: any, roundingOut: any): string {
  return `
    <div class="reflection-content">
      <h4>End Reflections</h4>
      <ul>
        <li><strong>Growth Insights:</strong> ${roundingOut.growthAreas || 'Trust intuition while seeking feedback; remain focused yet flexible'}</li>
        <li><strong>Unique Appreciation:</strong> ${roundingOut.passions || 'Ability to balance strategic thinking with practical execution'}</li>
      </ul>
      
      <h4>Next Steps & Growth Plan</h4>
      <ul>
        <li><strong>Development Actions:</strong> ${roundingOut.values || 'Strengthen complementary skills through targeted learning and practice'}</li>
        <li><strong>Focus Areas:</strong> ${finalReflection.futureLetterText?.substring(0, 100) || 'Continue building on core strengths while expanding capabilities'}</li>
      </ul>
    </div>
  `;
}

function generateAIRecommendationsContent(percentages: any, flow: any, userName: string): string {
  return `
    <div class="ai-recommendations">
      <div class="recommendation-block">
        <h4>AI Analysis Prompt:</h4>
        <p><em>How can ${userName}'s unique profile inform their leadership development?</em></p>
        <h4>AI Suggestion:</h4>
        <p>Focus on leading with your strongest capabilities while developing complementary skills through mentorship and systems thinking.</p>
      </div>
      
      <div class="recommendation-block">
        <h4>AI Analysis Prompt:</h4>
        <p><em>What resources or learning opportunities would accelerate ${userName}'s growth?</em></p>
        <h4>AI Suggestion:</h4>
        <p>Enroll in leadership development programs; seek mentorship from experienced leaders; join cross-sector networks; practice presenting complex ideas to diverse audiences.</p>
      </div>
      
      <div class="recommendation-block">
        <h4>AI Analysis Prompt:</h4>
        <p><em>How can ${userName}'s team leverage this report for collective growth?</em></p>
        <h4>AI Suggestion:</h4>
        <p>Share strengths profiles; co-create team flow strategies; hold regular reflection sessions; align individual strengths with team objectives.</p>
      </div>
    </div>
  `;
}

function getEnhancedReportCSS(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
    }
    
    .report-container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 20px;
    }
    
    .report-header {
      border-bottom: 3px solid #2563eb;
      margin-bottom: 30px;
      padding-bottom: 20px;
    }
    
    .header-content {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    
    .hi-logo .logo-circle {
      width: 60px;
      height: 60px;
      background: #2563eb;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 20px;
    }
    
    .header-text h1 {
      font-size: 24px;
      color: #1e40af;
      margin-bottom: 10px;
    }
    
    .participant-info p {
      margin: 5px 0;
      font-size: 14px;
    }
    
    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 18px;
      color: #1e40af;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 10px;
      margin-bottom: 20px;
      font-weight: 600;
    }
    
    .content-block {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
    }
    
    .content-block h3 {
      color: #374151;
      margin-bottom: 15px;
      font-size: 16px;
    }
    
    .content-block h4 {
      color: #374151;
      margin: 15px 0 10px 0;
      font-size: 14px;
      font-weight: 600;
    }
    
    .content-block p {
      margin-bottom: 15px;
      text-align: justify;
    }
    
    .content-block ul {
      margin: 10px 0 15px 20px;
    }
    
    .content-block li {
      margin-bottom: 8px;
    }
    
    .strengths-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    
    .strengths-table th,
    .strengths-table td {
      border: 1px solid #d1d5db;
      padding: 12px;
      text-align: left;
      vertical-align: top;
    }
    
    .strengths-table th {
      background: #e5e7eb;
      font-weight: 600;
      color: #374151;
    }
    
    .strengths-table tbody tr:nth-child(even) {
      background: #f9fafb;
    }
    
    .ai-suggestion {
      background: #eff6ff;
      padding: 15px;
      margin: 20px 0;
      border-radius: 6px;
      border-left: 4px solid #3b82f6;
    }
    
    .ai-suggestion h4 {
      color: #1e40af;
      margin-bottom: 8px;
    }
    
    .ai-suggestion p {
      margin-bottom: 10px;
      font-style: italic;
    }
    
    .recommendation-block {
      background: #f0f9ff;
      padding: 15px;
      margin: 15px 0;
      border-radius: 6px;
      border-left: 4px solid #0ea5e9;
    }
    
    .recommendation-block h4 {
      color: #0c4a6e;
      margin-bottom: 8px;
    }
    
    .report-footer {
      text-align: center;
      padding: 20px 0;
      border-top: 1px solid #e5e7eb;
      margin-top: 40px;
      font-size: 12px;
      color: #6b7280;
    }
    
    @media print {
      .section {
        page-break-inside: avoid;
        page-break-after: auto;
      }
      
      .report-header {
        page-break-after: avoid;
      }
    }
  `;
}

export default router;