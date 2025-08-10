#!/usr/bin/env node

/**
 * Standalone StarCard PNG Generator with HTML2Canvas
 * 
 * Generates StarCard PNG files from JSON data using the actual React StarCard component
 * with Puppeteer and html2canvas for pixel-perfect rendering.
 * 
 * Usage: node generate-starcards.js input-data.json
 * 
 * Expected JSON format:
 * [
 *   {
 *     "name": "John Doe",
 *     "thinking": 35,
 *     "acting": 25, 
 *     "feeling": 20,
 *     "planning": 20,
 *     "flowAttributes": ["Thoughtful", "Strategic", "Empathetic", "Organized"],
 *     "flowScore": 42
 *   }
 * ]
 */

import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

// Import existing constants for color mapping
async function importConstants() {
  const { getAttributeColor, QUADRANT_COLORS } = await import('./client/src/components/starcard/starCardConstants.ts');
  return { getAttributeColor, QUADRANT_COLORS };
}

// Sanitize filename by removing special characters and spaces
function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Validate user data object
function validateUserData(userData, index) {
  const errors = [];
  
  if (!userData.name || typeof userData.name !== 'string') {
    errors.push(`User ${index}: Missing or invalid 'name' field`);
  }
  
  const requiredStrengths = ['thinking', 'acting', 'feeling', 'planning'];
  for (const strength of requiredStrengths) {
    if (typeof userData[strength] !== 'number' || userData[strength] < 0 || userData[strength] > 100) {
      errors.push(`User ${index}: Invalid '${strength}' value (must be 0-100)`);
    }
  }
  
  // Validate that percentages add up to 100 (with small tolerance)
  const total = (userData.thinking || 0) + (userData.acting || 0) + (userData.feeling || 0) + (userData.planning || 0);
  if (Math.abs(total - 100) > 1) {
    console.warn(`⚠️  User ${index} (${userData.name}): Strength percentages total ${total}% (expected 100%)`);
  }
  
  return errors;
}

// Flow attribute to strength quadrant mapping
const FLOW_ATTRIBUTE_MAPPING = {
  // Thinking Attributes (Green)
  'Abstract': 'thinking',
  'Analytic': 'thinking', 
  'Analytical': 'thinking', // Alternative spelling
  'Astute': 'thinking',
  'Big Picture': 'thinking',
  'Curious': 'thinking',
  'Focused': 'thinking',
  'Insightful': 'thinking',
  'Logical': 'thinking',
  'Investigative': 'thinking',
  'Rational': 'thinking',
  'Reflective': 'thinking',
  'Sensible': 'thinking',
  'Strategic': 'thinking',
  'Thoughtful': 'thinking',

  // Feeling Attributes (Blue)
  'Collaborative': 'feeling',
  'Creative': 'feeling',
  'Encouraging': 'feeling',
  'Expressive': 'feeling',
  'Empathic': 'feeling',
  'Empathetic': 'feeling', // Alternative spelling
  'Intuitive': 'feeling',
  'Inspiring': 'feeling',
  'Objective': 'feeling',
  'Passionate': 'feeling',
  'Positive': 'feeling',
  'Receptive': 'feeling',
  'Supportive': 'feeling',
  'Caring': 'feeling',

  // Planning Attributes (Yellow)
  'Detail-Oriented': 'planning',
  'Detailed': 'planning', // Alternative spelling
  'Diligent': 'planning',
  'Immersed': 'planning',
  'Industrious': 'planning',
  'Methodical': 'planning',
  'Organized': 'planning',
  'Precise': 'planning',
  'Punctual': 'planning',
  'Reliable': 'planning',
  'Responsible': 'planning',
  'Straightforward': 'planning',
  'Tidy': 'planning',
  'Systematic': 'planning',
  'Thorough': 'planning',
  'Balanced': 'planning', // Common for balanced profiles

  // Acting Attributes (Red)
  'Adventuresome': 'acting',
  'Competitive': 'acting',
  'Dynamic': 'acting',
  'Effortless': 'acting',
  'Energetic': 'acting',
  'Engaged': 'acting',
  'Funny': 'acting',
  'Persuasive': 'acting',
  'Open-Minded': 'acting',
  'Optimistic': 'acting',
  'Practical': 'acting',
  'Resilient': 'acting',
  'Spontaneous': 'acting',
  'Vigorous': 'acting',
  'Bold': 'acting',
  'Decisive': 'acting',
  'Adaptable': 'acting',
  'Versatile': 'acting',
  'Resourceful': 'acting'
};

// Get color for flow attribute based on strength quadrant mapping
function getFlowAttributeColor(attributeName, quadrantColors) {
  const mappedQuadrant = FLOW_ATTRIBUTE_MAPPING[attributeName];
  if (mappedQuadrant && quadrantColors[mappedQuadrant]) {
    return quadrantColors[mappedQuadrant];
  }
  
  // Default to gray if not found
  console.warn(`⚠️  Flow attribute "${attributeName}" not found in mapping, using gray`);
  return '#9ca3af'; // Gray color
}

// Process flow attributes and assign colors based on strength quadrant mapping
function processFlowAttributes(flowAttributes, quadrantColors) {
  if (!Array.isArray(flowAttributes) || flowAttributes.length === 0) {
    console.warn('⚠️  No flow attributes provided, using defaults');
    return [
      { text: 'Creative', color: getFlowAttributeColor('Creative', quadrantColors) },
      { text: 'Focused', color: getFlowAttributeColor('Focused', quadrantColors) },
      { text: 'Collaborative', color: getFlowAttributeColor('Collaborative', quadrantColors) },
      { text: 'Reliable', color: getFlowAttributeColor('Reliable', quadrantColors) }
    ];
  }
  
  // Take first 4 attributes and map to colors based on strength quadrant
  return flowAttributes.slice(0, 4).map(attr => ({
    text: attr,
    color: getFlowAttributeColor(attr, quadrantColors)
  }));
}

// Create HTML template for StarCard rendering
function createStarCardHTML(userData, flowAttributes, quadrantColors) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StarCard Generation - ${userData.name}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f9f9f9;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        
        .starcard-container {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            width: 440px;
            height: 650px;
            display: flex;
            flex-direction: column;
            position: relative;
        }
        
        .starcard-title {
            font-size: 1.25rem;
            font-weight: 700;
            text-align: center;
            text-transform: uppercase;
            margin-bottom: 16px;
            color: #374151;
        }
        
        .user-profile {
            display: flex;
            align-items: center;
            margin-bottom: 24px;
        }
        
        .user-avatar {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: #e5e7eb;
            margin-right: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #d1d5db;
            overflow: hidden;
        }
        
        .user-avatar-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
        }
        
        .user-avatar-icon {
            width: 32px;
            height: 32px;
            color: #9ca3af;
        }
        
        .user-info {
            flex: 1;
        }
        
        .user-name {
            font-weight: 500;
            color: #1f2937;
            font-size: 1rem;
            margin-bottom: 2px;
        }
        
        .user-organization {
            font-size: 0.875rem;
            color: #6b7280;
            font-style: italic;
        }
        
        .cloud-section {
            text-align: center;
            margin-bottom: 8px;
            position: relative;
            height: 110px;
            margin-top: -20px;
        }
        
        .cloud-image {
            width: 98%;
            height: 88px;
            object-fit: contain;
            position: absolute;
            top: 0;
            left: 1%;
        }
        
        .cloud-text {
            position: absolute;
            width: 100%;
            top: 50px;
        }
        
        .cloud-title {
            font-size: 1.125rem;
            font-weight: 700;
            color: #6b7280;
        }
        
        .cloud-subtitle {
            font-size: 0.785rem;
            color: #6b7280;
            font-style: italic;
        }
        
        .starcard-diagram {
            position: relative;
            width: 308px;
            height: 308px;
            margin: 0 auto 24px;
            margin-top: -25px;
        }
        
        .flow-label {
            position: absolute;
            top: -6px;
            right: 9px;
            width: 66px;
            text-align: center;
            z-index: 30;
            font-size: 0.65rem;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.8);
        }
        
        .core-label {
            position: absolute;
            top: 64px;
            left: 158px;
            width: 60px;
            text-align: center;
            z-index: 30;
            font-size: 0.65rem;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.8);
        }
        
        .center-star {
            position: absolute;
            left: 125px;
            top: 20px;
            z-index: 20;
        }
        
        .star-circle {
            width: 57px;
            height: 57px;
            border-radius: 50%;
            border: 2px solid #d1d5db;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .star-icon {
            width: 40px;
            height: 40px;
            color: #9ca3af;
        }
        
        .quadrants-grid {
            position: absolute;
            left: 80px;
            top: 86px;
            width: 145px;
            height: 145px;
            z-index: 10;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3px;
        }
        
        .quadrant {
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 0.75rem;
            font-weight: 500;
            text-align: center;
        }
        
        .quadrant-content {
            text-align: center;
        }
        
        .flow-square {
            position: absolute;
            width: 73px;
            height: 73px;
            color: white;
            border: 1px solid #d1d5db;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2px;
        }
        
        .flow-text {
            font-weight: 700;
            text-align: center;
            line-height: 1.2;
        }
        
        .arrow {
            position: absolute;
        }
        
        .arrow-line {
            background: #9ca3af;
        }
        
        .arrow-head {
            fill: #9ca3af;
        }
        
        .right-arrow {
            right: 38px;
            top: 108px;
            height: 98px;
        }
        
        .right-arrow .arrow-line {
            position: absolute;
            left: 0;
            top: 0;
            height: 98px;
            width: 1px;
        }
        
        .right-arrow .arrow-triangle {
            position: absolute;
            left: -4.5px;
            bottom: -8px;
        }
        
        .bottom-arrow {
            top: 266px;
            left: 105px;
            width: 97px;
        }
        
        .bottom-arrow .arrow-line {
            position: absolute;
            left: 0;
            top: 6px;
            width: 97px;
            height: 1px;
        }
        
        .bottom-arrow .arrow-triangle {
            position: absolute;
            left: -5px;
            top: -4.5px;
        }
        
        .left-arrow {
            left: 38px;
            top: 108px;
            height: 98px;
        }
        
        .left-arrow .arrow-line {
            position: absolute;
            left: 0;
            top: 0;
            height: 98px;
            width: 1px;
        }
        
        .left-arrow .arrow-triangle {
            position: absolute;
            left: -4.5px;
            top: -10px;
        }
        
        .logo {
            display: flex;
            justify-content: flex-end;
            margin-top: 15px;
            padding-right: 16px;
        }
        
        .logo-img {
            height: 24px;
            width: auto;
        }
    </style>
</head>
<body>
    <div class="starcard-container" id="starcard">
        <h2 class="starcard-title">Star Card</h2>
        
        <!-- User Profile -->
        <div class="user-profile">
            <div class="user-avatar">
                <img src="directed_dev_logo.jpg" class="user-avatar-img" alt="DirectED" />
            </div>
            <div class="user-info">
                <p class="user-name">${userData.name || 'Your Name'}</p>
                <p class="user-organization">${userData.organization || 'DirectED'}</p>
            </div>
        </div>
        
        <!-- Cloud Section -->
        <div class="cloud-section">
            <div style="position: relative; width: 100%; height: 110px;">
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABLAAAAD4CAIAAABzB4iKAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF0WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDMgNzkuOTY5MGE4N2ZjLCAyMDI1LzAzLzA2LTIwOjUwOjE2ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjYuNiAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjUtMDUtMDVUMTE6NDI6NTQtMDc6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDI1LTA1LTA3VDEwOjIzOjQ0LTA3OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDI1LTA1LTA3VDEwOjIzOjQ0LTA3OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoyYmYxNzM1Yi02Yjk2LTRlMmYtODRmMS00ZWViZjZmNjE3NWQiIHhtcE1NOkRvY3VtZW50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" 
                     class="cloud-image" style="width: 98%; height: 88px; object-fit: contain; position: absolute; top: 0; left: 1%;" />
                <div class="cloud-text">
                    <p class="cloud-title">Imagination</p>
                    <p class="cloud-subtitle">Your Apex Strength</p>
                </div>
            </div>
        </div>
        
        <!-- Main StarCard Diagram -->
        <div class="starcard-diagram">
            <!-- Flow Label -->
            <div class="flow-label">Flow</div>
            
            <!-- Core Label -->
            <div class="core-label">Core</div>
            
            <!-- Center Star -->
            <div class="center-star">
                <div class="star-circle">
                    <svg class="star-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" 
                                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
            </div>
            
            <!-- Four Quadrant Squares -->
            <div class="quadrants-grid">
                <!-- Top Left - Position 3 -->
                <div class="quadrant" style="background-color: ${quadrantColors.thinking};">
                    <div class="quadrant-content">
                        <div>THINKING</div>
                        <div>${userData.thinking}%</div>
                    </div>
                </div>
                
                <!-- Top Right - Position 0 -->
                <div class="quadrant" style="background-color: ${quadrantColors.feeling};">
                    <div class="quadrant-content">
                        <div>FEELING</div>
                        <div>${userData.feeling}%</div>
                    </div>
                </div>
                
                <!-- Bottom Left - Position 2 -->
                <div class="quadrant" style="background-color: ${quadrantColors.planning};">
                    <div class="quadrant-content">
                        <div>PLANNING</div>
                        <div>${userData.planning}%</div>
                    </div>
                </div>
                
                <!-- Bottom Right - Position 1 -->
                <div class="quadrant" style="background-color: ${quadrantColors.acting};">
                    <div class="quadrant-content">
                        <div>ACTING</div>
                        <div>${userData.acting}%</div>
                    </div>
                </div>
            </div>
            
            <!-- Flow Squares -->
            <!-- Top Right -->
            <div class="flow-square" style="top: 15px; right: 2px; background-color: ${flowAttributes[0]?.color || '#e5e7eb'};">
                <div class="flow-text" style="font-size: ${Math.max(Math.min(69 / (flowAttributes[0]?.text?.length || 8) * 1.2, 14), 7.5)}px;">
                    ${flowAttributes[0]?.text || ''}
                </div>
            </div>
            
            <!-- Bottom Right -->
            <div class="flow-square" style="top: 225px; right: 2px; background-color: ${flowAttributes[1]?.color || '#e5e7eb'};">
                <div class="flow-text" style="font-size: ${Math.max(Math.min(69 / (flowAttributes[1]?.text?.length || 8) * 1.2, 14), 7.5)}px;">
                    ${flowAttributes[1]?.text || ''}
                </div>
            </div>
            
            <!-- Bottom Left -->
            <div class="flow-square" style="top: 225px; left: 2px; background-color: ${flowAttributes[2]?.color || '#e5e7eb'};">
                <div class="flow-text" style="font-size: ${Math.max(Math.min(69 / (flowAttributes[2]?.text?.length || 8) * 1.2, 14), 7.5)}px;">
                    ${flowAttributes[2]?.text || ''}
                </div>
            </div>
            
            <!-- Top Left -->
            <div class="flow-square" style="top: 15px; left: 2px; background-color: ${flowAttributes[3]?.color || '#e5e7eb'};">
                <div class="flow-text" style="font-size: ${Math.max(Math.min(69 / (flowAttributes[3]?.text?.length || 8) * 1.2, 14), 7.5)}px;">
                    ${flowAttributes[3]?.text || ''}
                </div>
            </div>
            
            <!-- Arrows -->
            <!-- Right vertical arrow -->
            <div class="arrow right-arrow">
                <div class="arrow-line"></div>
                <div class="arrow-triangle">
                    <svg width="10" height="10" viewBox="0 0 10 10">
                        <path d="M5 10 L0 5 L10 5 Z" class="arrow-head" />
                    </svg>
                </div>
            </div>
            
            <!-- Bottom horizontal arrow -->
            <div class="arrow bottom-arrow">
                <div class="arrow-line"></div>
                <div class="arrow-triangle">
                    <svg width="10" height="10" viewBox="0 0 10 10">
                        <path d="M0 5 L5 0 L5 10 Z" class="arrow-head" />
                    </svg>
                </div>
            </div>
            
            <!-- Left vertical arrow -->
            <div class="arrow left-arrow">
                <div class="arrow-line"></div>
                <div class="arrow-triangle">
                    <svg width="10" height="10" viewBox="0 0 10 10">
                        <path d="M5 0 L0 5 L10 5 Z" class="arrow-head" />
                    </svg>
                </div>
            </div>
        </div>
        
        <!-- Logo -->
        <div class="logo">
            <img src="all-star-teams-logo-150px.png" 
                 class="logo-img" alt="AllStarTeams" />
        </div>
    </div>

    <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
    <script>
        window.generateStarCard = async function() {
            const element = document.getElementById('starcard');
            const canvas = await html2canvas(element, {
                backgroundColor: null,
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true,
                width: 440,
                height: 650
            });
            return canvas.toDataURL('image/png');
        };
    </script>
</body>
</html>`;
}

// Generate StarCard PNG using Puppeteer and html2canvas
async function generateStarCard(userData, outputDir, quadrantColors) {
  let browser = null;
  let tempHtmlFile = null;
  
  try {
    console.log(`🎨 Generating StarCard for: ${userData.name}`);
    
    // Get quadrant colors
    const quadrantColorsObj = {
      thinking: 'rgb(1, 162, 82)',    // Green
      acting: 'rgb(241, 64, 64)',     // Red  
      feeling: 'rgb(22, 126, 253)',   // Blue
      planning: 'rgb(255, 203, 47)'   // Yellow
    };
    
    // Process flow attributes
    const processedAttributes = processFlowAttributes(userData.flowAttributes, quadrantColorsObj);
    
    console.log(`   Strengths: T:${userData.thinking}% A:${userData.acting}% F:${userData.feeling}% P:${userData.planning}%`);
    console.log(`   Flow Attributes: ${processedAttributes.map(a => a.text).join(', ')}`);
    
    // Use the quadrant colors from the processed attributes section
    
    // Create HTML template
    const htmlContent = createStarCardHTML(userData, processedAttributes, quadrantColorsObj);
    
    // Write temporary HTML file
    const tempDir = path.join(process.cwd(), 'tempClaudecomms');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    tempHtmlFile = path.join(tempDir, `starcard-${Date.now()}.html`);
    fs.writeFileSync(tempHtmlFile, htmlContent);
    
    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--disable-features=VizDisplayCompositor']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    // Navigate to the HTML file
    await page.goto(`file://${tempHtmlFile}`, { waitUntil: 'networkidle0' });
    
    // Wait a bit for fonts to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate the StarCard using html2canvas
    const imageDataUrl = await page.evaluate(async () => {
      return await window.generateStarCard();
    });
    
    // Extract base64 data and convert to buffer
    const base64Data = imageDataUrl.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Create filename
    const sanitizedName = sanitizeFilename(userData.name);
    const filename = `${sanitizedName}-starcard.png`;
    const filePath = path.join(outputDir, filename);
    
    // Write PNG file
    fs.writeFileSync(filePath, imageBuffer);
    
    console.log(`✅ Generated: ${filename} (${Math.round(imageBuffer.length / 1024)}KB)`);
    return { success: true, filename, size: imageBuffer.length };
    
  } catch (error) {
    console.error(`❌ Failed to generate StarCard for ${userData.name}:`, error.message);
    return { success: false, error: error.message };
  } finally {
    // Cleanup
    if (browser) {
      await browser.close();
    }
    if (tempHtmlFile && fs.existsSync(tempHtmlFile)) {
      fs.unlinkSync(tempHtmlFile);
    }
  }
}

// Get flow category based on score
function getFlowCategory(flowScore) {
  if (flowScore >= 50) return 'Flow Fluent';
  if (flowScore >= 39) return 'Flow Aware';
  if (flowScore >= 26) return 'Flow Blocked';
  return 'Flow Distant';
}

// Main execution function
async function main() {
  console.log('🌟 StarCard PNG Generator Started');
  console.log('=====================================');
  
  // Check command line arguments
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('❌ Error: Please provide a JSON file path');
    console.log('Usage: node generate-starcards.js input-data.json');
    process.exit(1);
  }
  
  const inputFile = args[0];
  
  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Error: Input file '${inputFile}' not found`);
    process.exit(1);
  }
  
  try {
    // Read and parse JSON data
    console.log(`📖 Reading data from: ${inputFile}`);
    const jsonData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    
    // Ensure data is an array
    const userData = Array.isArray(jsonData) ? jsonData : [jsonData];
    console.log(`📊 Found ${userData.length} user record(s)`);
    
    // Validate all user data
    let validationErrors = 0;
    userData.forEach((user, index) => {
      const errors = validateUserData(user, index + 1);
      if (errors.length > 0) {
        console.error(`❌ Validation errors for user ${index + 1}:`);
        errors.forEach(error => console.error(`   ${error}`));
        validationErrors += errors.length;
      }
    });
    
    if (validationErrors > 0) {
      console.error(`❌ Found ${validationErrors} validation error(s). Please fix the data and try again.`);
      process.exit(1);
    }
    
    // Set up flow attribute color mapping
    console.log('🔧 Loading flow attribute color mapping...');
    
    // Create output directory
    const outputDir = path.join(process.cwd(), 'tempClaudecomms', 'starcards');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`📁 Created output directory: ${outputDir}`);
    }
    
    // Generate StarCards
    console.log('\n🎨 Starting StarCard generation...');
    console.log('=====================================');
    
    const results = [];
    let successCount = 0;
    let totalSize = 0;
    
    // Define quadrant colors
    const quadrantColors = {
      thinking: 'rgb(1, 162, 82)',    // Green
      acting: 'rgb(241, 64, 64)',     // Red  
      feeling: 'rgb(22, 126, 253)',   // Blue
      planning: 'rgb(255, 203, 47)'   // Yellow
    };
    
    for (let i = 0; i < userData.length; i++) {
      const user = userData[i];
      const result = await generateStarCard(user, outputDir, quadrantColors);
      results.push({ user: user.name, ...result });
      
      if (result.success) {
        successCount++;
        totalSize += result.size;
      }
      
      // Add small delay between generations to avoid overwhelming the system
      if (i < userData.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Summary
    console.log('\n📊 Generation Summary');
    console.log('=====================================');
    console.log(`✅ Successfully generated: ${successCount}/${userData.length} StarCards`);
    console.log(`📁 Output directory: ${outputDir}`);
    console.log(`💾 Total size: ${Math.round(totalSize / 1024)}KB`);
    
    if (successCount < userData.length) {
      console.log('\n❌ Failed generations:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`   ${r.user}: ${r.error}`);
      });
    }
    
    // List generated files
    if (successCount > 0) {
      console.log('\n📋 Generated files:');
      const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.png'));
      files.forEach(file => {
        const stats = fs.statSync(path.join(outputDir, file));
        console.log(`   ${file} (${Math.round(stats.size / 1024)}KB)`);
      });
    }
    
    console.log('\n🎉 StarCard generation completed!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

export { main, sanitizeFilename, validateUserData, processFlowAttributes, getFlowCategory };