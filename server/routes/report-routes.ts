import express from 'express';
import puppeteer from 'puppeteer';
import { exec } from 'child_process';
import { promisify } from 'util';
import { db } from '../db';
import { users, userAssessments } from '@shared/schema';
import { eq } from 'drizzle-orm';

const execAsync = promisify(exec);

const router = express.Router();

// Generate and download report
router.get('/api/report/generate/:userId', async (req, res) => {
  try {
    // Handle 'me' parameter
    let userId: number;
    if (req.params.userId === 'me') {
      userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
    } else {
      userId = parseInt(req.params.userId);
    }
    
    // Basic auth check - allow user to generate their own report or admin to generate any
    const sessionUserId = req.session?.userId;
    const userRole = req.session?.userRole;
    
    if (sessionUserId !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get user data
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all assessments
    const assessments = await db.select()
      .from(userAssessments)
      .where(eq(userAssessments.userId, userId));

    // Transform to report data
    const reportData = {
      user: user[0],
      assessments: {} as Record<string, any>
    };
    
    assessments.forEach(assessment => {
      try {
        reportData.assessments[assessment.assessmentType] = JSON.parse(assessment.results);
      } catch (error) {
        console.warn(`Failed to parse ${assessment.assessmentType}:`, error);
        reportData.assessments[assessment.assessmentType] = { error: 'Failed to parse data' };
      }
    });

    // Check if user has completed all required assessments
    const requiredAssessments = ['starCard', 'flowAssessment', 'cantrilLadder', 'stepByStepReflection'];
    const missingAssessments = requiredAssessments.filter(type => !reportData.assessments[type]);
    
    console.log('Report data assessment check:', {
      available: Object.keys(reportData.assessments),
      required: requiredAssessments,
      missing: missingAssessments
    });
    
    if (missingAssessments.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot generate report - missing required assessments',
        missing: missingAssessments 
      });
    }

    // Generate HTML
    console.log('Generating HTML for report...');
    const html = generateReportHTML(reportData);
    console.log('HTML generated, length:', html.length);
    
    // Find Chromium executable dynamically
    let chromiumPath: string;
    try {
      const { stdout } = await execAsync('which chromium');
      chromiumPath = stdout.trim();
    } catch (error) {
      throw new Error('Chromium browser not found. Please ensure Chromium is installed.');
    }

    // Generate PDF with server-friendly configuration
    const browser = await puppeteer.launch({ 
      headless: true,
      executablePath: chromiumPath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-web-security'
      ]
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'letter',
      margin: { top: '0.75in', bottom: '0.75in', left: '0.75in', right: '0.75in' },
      printBackground: true
    });
    
    await browser.close();

    // Send PDF
    const fileName = `HI-Report-${user[0].name?.replace(/[^a-zA-Z0-9]/g, '-') || 'User'}-${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(pdf);

  } catch (error) {
    console.error('Report generation failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Report generation failed',
      details: error.message 
    });
  }
});

function generateReportHTML(data: any) {
  const starCard = data.assessments.starCard || {};
  const cantril = data.assessments.cantrilLadder || {};
  const cantrilReflection = data.assessments.cantrilLadderReflection || {};
  const flow = data.assessments.flowAssessment || {};
  const flowAttributes = data.assessments.flowAttributes || {};
  const stepByStep = data.assessments.stepByStepReflection || {};
  const roundingOut = data.assessments.roundingOutReflection || {};
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>HI Holistic Development Report - ${data.user.name}</title>
  <style>
    ${getReportCSS()}
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
          <h1>Holistic Development Report</h1>
          <h2>${data.user.name}</h2>
          <p class="user-details">${data.user.jobTitle || ''} ${data.user.jobTitle && data.user.organization ? '•' : ''} ${data.user.organization || ''}</p>
          <p class="generated-date">Generated ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </header>

    <!-- Executive Summary -->
    <section class="section">
      <h2 class="section-title">Executive Summary</h2>
      <div class="summary-card">
        ${generateExecutiveSummary(starCard, data.user.name)}
      </div>
    </section>

    <!-- Strengths Profile -->
    <section class="section">
      <h2 class="section-title">Core Strengths Profile</h2>
      ${generateStrengthsSection(starCard, stepByStep)}
    </section>

    <!-- Flow Optimization -->
    <section class="section">
      <h2 class="section-title">Flow Optimization</h2>
      ${generateFlowSection(flow, flowAttributes)}
    </section>

    <!-- Well-being -->
    <section class="section">
      <h2 class="section-title">Well-being & Self-Care</h2>
      ${generateWellbeingSection(cantril)}
    </section>

    <!-- Future Vision -->
    <section class="section">
      <h2 class="section-title">Future Vision & Growth Plan</h2>
      ${generateFutureSection(cantrilReflection, roundingOut)}
    </section>

    <!-- Personal Commitment -->
    ${generatePersonalCommitment(stepByStep)}

    <!-- Footer -->
    <footer class="report-footer">
      <p>This report was generated as part of the AllStarTeams workshop experience.</p>
      <p>For more information, visit your workshop platform.</p>
    </footer>
  </div>
</body>
</html>
  `;
}

function getReportCSS() {
  return `
    :root {
      --feeling-blue: #007bff;
      --thinking-green: #28a745;
      --acting-red: #dc3545;
      --planning-yellow: #ffc107;
      --hi-primary: #2c5aa0;
      --hi-secondary: #1e3d6f;
      --gray-50: #f8f9fa;
      --gray-100: #e9ecef;
      --gray-200: #dee2e6;
      --gray-600: #6c757d;
      --gray-800: #343a40;
      --white: #ffffff;
    }
    
    * {
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: var(--gray-800);
      margin: 0;
      font-size: 11pt;
      background: var(--white);
    }
    
    .report-container {
      max-width: 8.5in;
      margin: 0 auto;
      background: var(--white);
    }
    
    .report-header {
      background: linear-gradient(135deg, var(--hi-primary) 0%, var(--hi-secondary) 100%);
      color: var(--white);
      padding: 40px;
      position: relative;
      overflow: hidden;
    }
    
    .report-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 50%);
      transform: rotate(45deg);
    }
    
    .header-content {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      gap: 30px;
    }
    
    .hi-logo .logo-circle {
      width: 80px;
      height: 80px;
      background: var(--white);
      color: var(--hi-primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28pt;
      font-weight: 900;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }
    
    .header-text h1 {
      margin: 0 0 8px 0;
      font-size: 28pt;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    
    .header-text h2 {
      margin: 0 0 12px 0;
      font-size: 18pt;
      font-weight: 600;
      opacity: 0.95;
    }
    
    .user-details {
      margin: 0 0 8px 0;
      font-size: 12pt;
      opacity: 0.85;
    }
    
    .generated-date {
      margin: 0;
      font-size: 10pt;
      opacity: 0.75;
    }
    
    .section {
      margin: 40px 0;
      padding: 0 40px;
    }
    
    .section-title {
      color: var(--hi-primary);
      font-size: 16pt;
      font-weight: 700;
      margin: 0 0 24px 0;
      padding-bottom: 12px;
      border-bottom: 3px solid var(--hi-primary);
      position: relative;
    }
    
    .section-title::after {
      content: '';
      position: absolute;
      bottom: -3px;
      left: 0;
      width: 60px;
      height: 3px;
      background: var(--feeling-blue);
    }
    
    .summary-card {
      background: var(--gray-50);
      border: 1px solid var(--gray-200);
      border-left: 6px solid var(--hi-primary);
      padding: 24px;
      border-radius: 8px;
      margin: 20px 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    
    .strength-item {
      margin: 20px 0;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid var(--gray-200);
      position: relative;
      background: var(--white);
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    
    .strength-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 6px;
      border-radius: 6px 0 0 6px;
    }
    
    .strength-item.thinking::before { background: var(--thinking-green); }
    .strength-item.feeling::before { background: var(--feeling-blue); }
    .strength-item.acting::before { background: var(--acting-red); }
    .strength-item.planning::before { background: var(--planning-yellow); }
    
    .strength-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .strength-name {
      font-weight: 700;
      font-size: 14pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .strength-percentage {
      font-size: 20pt;
      font-weight: 800;
      color: var(--hi-primary);
    }
    
    .strength-rank {
      color: var(--gray-600);
      font-size: 10pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    
    .strength-bar {
      width: 100%;
      height: 8px;
      background: var(--gray-200);
      border-radius: 4px;
      overflow: hidden;
      margin: 12px 0;
    }
    
    .strength-bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    
    .strength-bar-fill.thinking { background: var(--thinking-green); }
    .strength-bar-fill.feeling { background: var(--feeling-blue); }
    .strength-bar-fill.acting { background: var(--acting-red); }
    .strength-bar-fill.planning { background: var(--planning-yellow); }
    
    .data-quality-warning {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      color: #856404;
      padding: 12px;
      border-radius: 6px;
      font-size: 10pt;
      margin: 12px 0;
    }
    
    .metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--gray-200);
    }
    
    .metric-row:last-child {
      border-bottom: none;
    }
    
    .metric-label {
      font-weight: 600;
      color: var(--gray-600);
    }
    
    .metric-value {
      font-weight: 700;
      color: var(--hi-primary);
      font-size: 12pt;
    }
    
    .reflection-text {
      background: var(--gray-50);
      padding: 16px;
      border-radius: 6px;
      border-left: 4px solid var(--hi-primary);
      font-style: italic;
      margin: 12px 0;
    }
    
    .commitment-section {
      background: linear-gradient(135deg, var(--gray-50) 0%, var(--white) 100%);
      border: 2px solid var(--hi-primary);
      border-radius: 12px;
      padding: 32px;
      margin: 40px 0;
    }
    
    .report-footer {
      background: var(--gray-50);
      padding: 24px 40px;
      text-align: center;
      color: var(--gray-600);
      font-size: 10pt;
      border-top: 1px solid var(--gray-200);
    }
    
    @page {
      margin: 0.75in;
      size: letter;
    }
    
    @media print {
      .report-container {
        max-width: none;
      }
    }
  `;
}

function generateExecutiveSummary(starCard: any, name: string) {
  if (!starCard.thinking) {
    return `<p><strong>${name}</strong> has completed their AllStarTeams workshop journey. This report provides insights into their personal development and growth areas.</p>`;
  }
  
  const strengths = [
    { name: 'Thinking', value: starCard.thinking || 0 },
    { name: 'Feeling', value: starCard.feeling || 0 },
    { name: 'Acting', value: starCard.acting || 0 },
    { name: 'Planning', value: starCard.planning || 0 }
  ].sort((a, b) => b.value - a.value);
  
  const primary = strengths[0];
  const secondary = strengths[1];
  
  return `
    <p><strong>${name}</strong> demonstrates a <strong>${primary.name}-${secondary.name}</strong> leadership pattern, 
    with ${primary.name} (${primary.value}%) as their primary strength and ${secondary.name} (${secondary.value}%) 
    as their secondary approach.</p>
    
    <p>This combination represents <strong>${primary.value + secondary.value}%</strong> of their natural energy distribution, 
    creating a distinctive pattern for team contribution and collaboration. This profile suggests a balanced approach 
    to leadership that draws primarily from ${primary.name.toLowerCase()} abilities while supporting with 
    ${secondary.name.toLowerCase()} capabilities.</p>
  `;
}

function generateStrengthsSection(starCard: any, reflections: any) {
  if (!starCard.thinking) {
    return '<p><em>Star Card assessment data not available.</em></p>';
  }
  
  const strengths = [
    { name: 'Thinking', value: starCard.thinking || 0, color: 'thinking' },
    { name: 'Feeling', value: starCard.feeling || 0, color: 'feeling' },
    { name: 'Acting', value: starCard.acting || 0, color: 'acting' },
    { name: 'Planning', value: starCard.planning || 0, color: 'planning' }
  ].sort((a, b) => b.value - a.value);
  
  return strengths.map((strength, index) => {
    const reflection = reflections?.[`strength${index + 1}`];
    const hasValidReflection = reflection && reflection.length > 10 && !/^[a-z]{1,10}$/i.test(reflection.trim());
    
    return `
      <div class="strength-item ${strength.color}">
        <div class="strength-header">
          <div class="strength-name">${strength.name}</div>
          <div class="strength-percentage">${strength.value}%</div>
        </div>
        <div class="strength-rank">${getStrengthRank(index)}</div>
        <div class="strength-bar">
          <div class="strength-bar-fill ${strength.color}" style="width: ${strength.value}%"></div>
        </div>
        ${hasValidReflection ? 
          `<div class="reflection-text">"${reflection}"</div>` : 
          reflection ? 
            `<div class="reflection-text">"${reflection}"</div>
             <div class="data-quality-warning">Note: This reflection appears to contain placeholder or incomplete text.</div>` :
            '<div class="data-quality-warning">No reflection provided for this strength.</div>'
        }
      </div>
    `;
  }).join('');
}

function generateFlowSection(flowAssessment: any, flowAttributes: any) {
  let content = '<div class="metric-rows">';
  
  if (flowAssessment?.flowScore !== undefined) {
    const percentage = Math.round((flowAssessment.flowScore / 60) * 100);
    content += `
      <div class="metric-row">
        <div class="metric-label">Flow Assessment Score</div>
        <div class="metric-value">${flowAssessment.flowScore}/60 (${percentage}%)</div>
      </div>
    `;
  }
  
  if (flowAttributes?.attributes && Array.isArray(flowAttributes.attributes)) {
    content += `
      <div class="metric-row">
        <div class="metric-label">Selected Flow Attributes</div>
        <div class="metric-value">${flowAttributes.attributes.length} attributes</div>
      </div>
    `;
    
    const attributesList = flowAttributes.attributes
      .map((attr: any) => attr.name || attr)
      .join(', ');
    
    content += `
      <div class="reflection-text">
        <strong>Your Flow Attributes:</strong> ${attributesList}
      </div>
    `;
  }
  
  content += '</div>';
  
  if (!flowAssessment?.flowScore && !flowAttributes?.attributes) {
    content = '<p><em>Flow assessment data not available.</em></p>';
  }
  
  return content;
}

function generateWellbeingSection(cantril: any) {
  if (!cantril?.wellBeingLevel && !cantril?.futureWellBeingLevel) {
    return '<p><em>Well-being assessment data not available.</em></p>';
  }
  
  let content = '<div class="metric-rows">';
  
  if (cantril.wellBeingLevel !== undefined) {
    content += `
      <div class="metric-row">
        <div class="metric-label">Current Well-being Level</div>
        <div class="metric-value">${cantril.wellBeingLevel}/10</div>
      </div>
    `;
  }
  
  if (cantril.futureWellBeingLevel !== undefined) {
    content += `
      <div class="metric-row">
        <div class="metric-label">Future Well-being Vision</div>
        <div class="metric-value">${cantril.futureWellBeingLevel}/10</div>
      </div>
    `;
  }
  
  content += '</div>';
  
  // Add reflections
  const reflections = [
    { label: 'Current Contributing Factors', value: cantril.currentFactors },
    { label: 'Future Improvement Areas', value: cantril.futureImprovements },
    { label: 'Specific Changes Needed', value: cantril.specificChanges },
    { label: 'Quarterly Progress Plan', value: cantril.quarterlyProgress },
    { label: 'Quarterly Action Steps', value: cantril.quarterlyActions }
  ];
  
  reflections.forEach(reflection => {
    if (reflection.value) {
      const isValid = reflection.value.length > 10 && !/^[a-z]{1,10}$/i.test(reflection.value.trim());
      content += `
        <div class="reflection-text">
          <strong>${reflection.label}:</strong> "${reflection.value}"
          ${!isValid ? '<div class="data-quality-warning">Note: This response appears to contain placeholder text.</div>' : ''}
        </div>
      `;
    }
  });
  
  return content;
}

function generateFutureSection(cantrilReflection: any, roundingOut: any) {
  let content = '';
  
  if (cantrilReflection?.futureImprovements) {
    const isValid = cantrilReflection.futureImprovements.length > 20 && 
                   !/^[a-z\s]{1,20}$/i.test(cantrilReflection.futureImprovements.trim());
    
    content += `
      <div class="reflection-text">
        <strong>Future Improvements:</strong> "${cantrilReflection.futureImprovements}"
        ${!isValid ? '<div class="data-quality-warning">Note: This reflection appears to contain placeholder text.</div>' : ''}
      </div>
    `;
  }
  
  if (roundingOut?.growthAreas) {
    const isValid = roundingOut.growthAreas.length > 20 && 
                   !/^[a-z\s]{1,20}$/i.test(roundingOut.growthAreas.trim());
    
    content += `
      <div class="reflection-text">
        <strong>Growth Areas:</strong> "${roundingOut.growthAreas}"
        ${!isValid ? '<div class="data-quality-warning">Note: This reflection appears to contain placeholder text.</div>' : ''}
      </div>
    `;
  }
  
  return content || '<p><em>Future vision data not available.</em></p>';
}

function generatePersonalCommitment(stepByStep: any) {
  if (!stepByStep?.uniqueContribution) {
    return '';
  }
  
  const isValid = stepByStep.uniqueContribution.length > 20 && 
                 !/^[a-z\s]{1,20}$/i.test(stepByStep.uniqueContribution.trim());
  
  return `
    <section class="section">
      <h2 class="section-title">Personal Commitment</h2>
      <div class="commitment-section">
        <div class="reflection-text">
          <strong>My Unique Contribution:</strong><br>
          "${stepByStep.uniqueContribution}"
          ${!isValid ? '<div class="data-quality-warning">Note: This commitment appears to contain placeholder text.</div>' : ''}
        </div>
      </div>
    </section>
  `;
}

function getStrengthRank(index: number) {
  const ranks = ['Primary Strength', 'Secondary Strength', 'Supporting Approach', 'Balancing Approach'];
  return ranks[index] || 'Supporting Approach';
}

export default router;