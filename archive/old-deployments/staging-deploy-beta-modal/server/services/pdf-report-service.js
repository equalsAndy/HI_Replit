import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
export class PDFReportService {
    reportsDir;
    constructor() {
        this.reportsDir = path.join(process.cwd(), 'storage', 'reports');
        this.ensureReportsDirectory();
    }
    async ensureReportsDirectory() {
        try {
            await fs.mkdir(this.reportsDir, { recursive: true });
            console.log('📁 Reports directory ready:', this.reportsDir);
        }
        catch (error) {
            console.error('❌ Failed to create reports directory:', error);
        }
    }
    async generatePDF(reportData, starCardImagePath) {
        let browser;
        try {
            console.log('🚀 Starting PDF generation for user:', reportData.participant.name);
            let starCardImageBase64 = '';
            if (reportData.starCardData?.photoData) {
                starCardImageBase64 = reportData.starCardData.photoData;
                console.log('📊 Using StarCard data from report');
            }
            else if (starCardImagePath) {
                starCardImageBase64 = await this.convertImageToBase64(starCardImagePath);
                console.log('📊 Using StarCard from file path');
            }
            else {
                console.log('⚠️ No StarCard data available');
            }
            let pieChartImageBase64 = '';
            try {
                const { pieChartGeneratorService } = await import('./pie-chart-generator-service.js');
                pieChartImageBase64 = await pieChartGeneratorService.generatePieChart({
                    thinking: reportData.strengths.thinking,
                    acting: reportData.strengths.acting,
                    feeling: reportData.strengths.feeling,
                    planning: reportData.strengths.planning,
                    title: 'Your Strengths at a Glance'
                });
                console.log('📊 Generated pie chart for strengths visualization');
            }
            catch (error) {
                console.warn('⚠️ Could not generate pie chart:', error);
            }
            const templateData = {
                ...reportData,
                starCardImageBase64,
                pieChartImageBase64,
                generatedAt: `${reportData.generatedAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'America/Los_Angeles'
                })} at ${reportData.generatedAt.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZone: 'America/Los_Angeles',
                    timeZoneName: 'short'
                })}`
            };
            const htmlContent = this.generateHTMLReport(templateData);
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.setViewport({ width: 1200, height: 1600 });
            await page.setContent(htmlContent, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20mm',
                    right: '15mm',
                    bottom: '20mm',
                    left: '15mm'
                },
                displayHeaderFooter: true,
                headerTemplate: '<div></div>',
                footerTemplate: `
          <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
            <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
          </div>
        `
            });
            console.log('✅ PDF generated successfully, size:', pdfBuffer.length, 'bytes');
            return pdfBuffer;
        }
        catch (error) {
            console.error('❌ PDF generation failed:', error);
            throw new Error(`PDF generation failed: ${error.message}`);
        }
        finally {
            if (browser) {
                await browser.close();
            }
        }
    }
    async savePDF(pdfBuffer, userId, reportType) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `user-${userId}-${reportType}-report-${timestamp}.pdf`;
        const filePath = path.join(this.reportsDir, fileName);
        try {
            await fs.writeFile(filePath, pdfBuffer);
            console.log('💾 PDF saved to:', filePath);
            return filePath;
        }
        catch (error) {
            console.error('❌ Failed to save PDF:', error);
            throw new Error(`Failed to save PDF: ${error.message}`);
        }
    }
    getPDFPath(userId, reportType) {
        return path.join(this.reportsDir, `user-${userId}-${reportType}-report.pdf`);
    }
    async convertImageToBase64(imagePath) {
        try {
            const imageBuffer = await fs.readFile(imagePath);
            const base64 = imageBuffer.toString('base64');
            const mimeType = this.getMimeType(imagePath);
            return `data:${mimeType};base64,${base64}`;
        }
        catch (error) {
            console.warn('⚠️ Could not load star card image:', imagePath, error.message);
            return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        }
    }
    getMimeType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        switch (ext) {
            case '.png': return 'image/png';
            case '.jpg':
            case '.jpeg': return 'image/jpeg';
            case '.gif': return 'image/gif';
            case '.webp': return 'image/webp';
            default: return 'image/png';
        }
    }
    generateHTMLReport(data) {
        const isPersonalReport = data.reportType === 'personal';
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${isPersonalReport ? 'Personal' : 'Professional'} Development Report - ${data.participant.name}</title>
    <style>
        ${this.getCSSStyles()}
    </style>
</head>
<body>
    <!-- Header Section -->
    <div class="header">
        <div class="header-content">
            <h1>${isPersonalReport ? 'Personal Development Report' : 'Professional Development Report'}</h1>
            <div class="participant-info">
                <h2>${data.participant.name}</h2>
                ${data.participant.title ? `<p class="title">${data.participant.title}</p>` : ''}
                ${data.participant.organization ? `<p class="organization">${data.participant.organization}</p>` : ''}
                <p class="date">Generated on ${data.generatedAt}</p>
            </div>
        </div>
    </div>

    <!-- Strengths Profile Section -->
    <div class="page">
        <div class="section">
            <h2>Your Unique Strengths Profile</h2>
            
            <p class="intro-text">You possess a unique combination of strengths that shapes how you naturally approach challenges, collaborate with others, and create value in your work.</p>

            <!-- Pie Chart Visualization -->
            <div class="pie-chart-section">
                <div class="pie-container">
                    <svg class="pie-svg" viewBox="0 0 500 500">
                        <!-- Thinking segment (largest) -->
                        <path d="M 250 100 A 150 150 0 ${data.strengths.thinking > 50 ? 1 : 0} 1 ${250 + 150 * Math.cos((data.strengths.thinking * 3.6 - 90) * Math.PI / 180)} ${250 + 150 * Math.sin((data.strengths.thinking * 3.6 - 90) * Math.PI / 180)} L 250 250 Z" fill="#01a252" />
                        <!-- Acting segment -->
                        <path d="M ${250 + 150 * Math.cos((data.strengths.thinking * 3.6 - 90) * Math.PI / 180)} ${250 + 150 * Math.sin((data.strengths.thinking * 3.6 - 90) * Math.PI / 180)} A 150 150 0 0 1 ${250 + 150 * Math.cos(((data.strengths.thinking + data.strengths.acting) * 3.6 - 90) * Math.PI / 180)} ${250 + 150 * Math.sin(((data.strengths.thinking + data.strengths.acting) * 3.6 - 90) * Math.PI / 180)} L 250 250 Z" fill="#f14040" />
                        <!-- Feeling segment -->
                        <path d="M ${250 + 150 * Math.cos(((data.strengths.thinking + data.strengths.acting) * 3.6 - 90) * Math.PI / 180)} ${250 + 150 * Math.sin(((data.strengths.thinking + data.strengths.acting) * 3.6 - 90) * Math.PI / 180)} A 150 150 0 0 1 ${250 + 150 * Math.cos(((data.strengths.thinking + data.strengths.acting + data.strengths.feeling) * 3.6 - 90) * Math.PI / 180)} ${250 + 150 * Math.sin(((data.strengths.thinking + data.strengths.acting + data.strengths.feeling) * 3.6 - 90) * Math.PI / 180)} L 250 250 Z" fill="#167efd" />
                        <!-- Planning segment -->
                        <path d="M ${250 + 150 * Math.cos(((data.strengths.thinking + data.strengths.acting + data.strengths.feeling) * 3.6 - 90) * Math.PI / 180)} ${250 + 150 * Math.sin(((data.strengths.thinking + data.strengths.acting + data.strengths.feeling) * 3.6 - 90) * Math.PI / 180)} A 150 150 0 0 1 250 100 L 250 250 Z" fill="#ffcb2f" />
                        
                        <!-- Percentage labels around the pie (bigger and repositioned) -->
                        <text x="350" y="150" class="percentage-label" text-anchor="middle" fill="white" style="font-weight: bold; font-size: 20px;">THINKING</text>
                        <text x="350" y="175" class="percentage-label" text-anchor="middle" fill="white" style="font-weight: bold; font-size: 24px;">${data.strengths.thinking}%</text>
                        
                        <text x="350" y="350" class="percentage-label" text-anchor="middle" fill="white" style="font-weight: bold; font-size: 20px;">ACTING</text>
                        <text x="350" y="375" class="percentage-label" text-anchor="middle" fill="white" style="font-weight: bold; font-size: 24px;">${data.strengths.acting}%</text>
                        
                        <text x="150" y="350" class="percentage-label" text-anchor="middle" fill="white" style="font-weight: bold; font-size: 20px;">FEELING</text>
                        <text x="150" y="375" class="percentage-label" text-anchor="middle" fill="white" style="font-weight: bold; font-size: 24px;">${data.strengths.feeling}%</text>
                        
                        <text x="250" y="440" class="percentage-label" text-anchor="middle" fill="#333" style="font-weight: bold; font-size: 20px;">PLANNING</text>
                        <text x="250" y="465" class="percentage-label" text-anchor="middle" fill="#333" style="font-weight: bold; font-size: 24px;">${data.strengths.planning}%</text>
                    </svg>
                </div>
            </div>

            <!-- Strengths Details Grid -->
            <div class="strengths-grid">
                <div class="strength-card thinking">
                    <div class="strength-header">
                        <div class="strength-number" style="background: #01a252;">1</div>
                        <div>
                            <div class="strength-title">THINKING</div>
                            <div class="strength-percentage">${data.strengths.thinking}%</div>
                        </div>
                    </div>
                    <div class="strength-description">
                        Your analytical powerhouse. You naturally approach challenges systematically, design elegant solutions, and see patterns others miss. This isn't just problem-solving - it's solution architecture.
                    </div>
                </div>

                <div class="strength-card planning">
                    <div class="strength-header">
                        <div class="strength-number" style="background: #ffcb2f; color: #333;">2</div>
                        <div>
                            <div class="strength-title">PLANNING</div>
                            <div class="strength-percentage">${data.strengths.planning}%</div>
                        </div>
                    </div>
                    <div class="strength-description">
                        Your organizational excellence. You create realistic timelines, anticipate dependencies, and build systems that actually work in the real world. This is strategic thinking in action.
                    </div>
                </div>

                <div class="strength-card feeling">
                    <div class="strength-header">
                        <div class="strength-number" style="background: #167efd;">3</div>
                        <div>
                            <div class="strength-title">FEELING</div>
                            <div class="strength-percentage">${data.strengths.feeling}%</div>
                        </div>
                    </div>
                    <div class="strength-description">
                        Your empathetic leadership edge. You ensure everyone feels heard, mediate conflicts gracefully, and bring diverse perspectives together. This is what transforms good teams into great ones.
                    </div>
                </div>

                <div class="strength-card acting">
                    <div class="strength-header">
                        <div class="strength-number" style="background: #f14040;">4</div>
                        <div>
                            <div class="strength-title">ACTING</div>
                            <div class="strength-percentage">${data.strengths.acting}%</div>
                        </div>
                    </div>
                    <div class="strength-description">
                        Your decisive moment capability. When urgency strikes, you shift gears and drive execution. This complements your thoughtful approach with the ability to act decisively when needed.
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- AI-Generated Professional Report -->
    ${data.professionalProfile ? `
    <div class="section">
        <h2 class="section-title">${isPersonalReport ? 'Personal Development Insights' : 'Professional Development Analysis'}</h2>
        <div class="ai-generated-content">
            ${this.formatAIContent(data.professionalProfile)}
        </div>
    </div>
    ` : ''}

    <!-- AI-Generated Personal Report (Personal Reports Only) -->
    ${isPersonalReport && data.personalReport ? `
    <div class="section personal-section">
        <h2 class="section-title">Personal Reflection & Development Guidance</h2>
        <div class="ai-generated-content">
            ${this.formatAIContent(data.personalReport)}
        </div>
    </div>
    ` : ''}

    ${isPersonalReport && data.personalReflections ? this.generatePersonalReflectionsSection(data.personalReflections) : ''}

    <!-- Footer -->
    <div class="footer">
        <p>Generated by AllStarTeams Workshop | ${data.workshopVersion}</p>
        <p>${isPersonalReport ? 'Personal Report - For Your Private Use' : 'Professional Report - Suitable for Sharing'}</p>
    </div>
</body>
</html>`;
    }
    formatAIContent(content) {
        if (!content || !content.trim())
            return '';
        const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
        return paragraphs.map(paragraph => {
            const trimmed = paragraph.trim();
            if (trimmed.startsWith('###')) {
                const title = trimmed.replace(/^###\s*/, '').trim();
                return `<h4 class="report-subheading">${title}</h4>`;
            }
            if (trimmed.startsWith('##')) {
                const title = trimmed.replace(/^##\s*/, '').trim();
                return `<h3 class="report-section-title">${title}</h3>`;
            }
            if (trimmed.startsWith('#')) {
                const title = trimmed.replace(/^#\s*/, '').trim();
                return `<h2 class="report-major-title">${title}</h2>`;
            }
            if (trimmed.includes('\n- ') || trimmed.startsWith('- ')) {
                const items = trimmed.split(/\n?- /).filter(item => item.trim()).map(item => item.trim());
                return `
          <ul class="professional-list">
            ${items.map(item => `<li>${item}</li>`).join('')}
          </ul>
        `;
            }
            if (/^\d+\./.test(trimmed) || /\n\d+\./.test(trimmed)) {
                const items = trimmed.split(/\n?\d+\./).filter(item => item.trim()).map(item => item.trim());
                return `
          <ol class="professional-list">
            ${items.map(item => `<li>${item}</li>`).join('')}
          </ol>
        `;
            }
            if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
                return `<blockquote class="report-quote">${trimmed.slice(1, -1)}</blockquote>`;
            }
            return `<p class="report-paragraph">${trimmed}</p>`;
        }).join('');
    }
    formatSectionContent(content) {
        if (!content || !content.trim())
            return '';
        const paragraphs = content.split('\n\n').filter(p => p.trim());
        return paragraphs.map(paragraph => {
            const trimmed = paragraph.trim();
            if (trimmed.includes('\n- ') || trimmed.startsWith('- ')) {
                const items = trimmed.split(/\n?- /).filter(item => item.trim()).map(item => item.trim());
                return `
          <div class="insights-container">
            ${items.map(item => `<div class="insight-item"><span class="insight-bullet">•</span>${item}</div>`).join('')}
          </div>
        `;
            }
            if (/^\d+\./.test(trimmed) || /\n\d+\./.test(trimmed)) {
                const items = trimmed.split(/\n?\d+\./).filter(item => item.trim()).map(item => item.trim());
                return `
          <div class="recommendations-container">
            ${items.map((item, index) => `
              <div class="recommendation-item">
                <span class="recommendation-number">${index + 1}</span>
                <div class="recommendation-text">${item}</div>
              </div>
            `).join('')}
          </div>
        `;
            }
            if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
                return `<blockquote class="report-quote">${trimmed.slice(1, -1)}</blockquote>`;
            }
            return `<p class="report-paragraph">${trimmed}</p>`;
        }).join('');
    }
    generatePersonalReflectionsSection(reflections) {
        return `
    <!-- Personal Reflections Section -->
    <div class="section personal-section">
        <h2 class="section-title">Personal Reflections</h2>
        <div class="personal-disclaimer">
            <p><strong>Note:</strong> This section contains your private reflections and is for your personal use only.</p>
        </div>
        
        <div class="reflection-item">
            <h3>Personal Challenges</h3>
            <ul>
                ${reflections.challenges.map(challenge => `<li>${challenge}</li>`).join('')}
            </ul>
        </div>
        
        <div class="reflection-item">
            <h3>Well-Being Factors</h3>
            <ul>
                ${reflections.wellBeingFactors.map(factor => `<li>${factor}</li>`).join('')}
            </ul>
        </div>
        
        <div class="reflection-item">
            <h3>Personal Growth Areas</h3>
            <ul>
                ${reflections.personalGrowthAreas.map(area => `<li>${area}</li>`).join('')}
            </ul>
        </div>
        
        <div class="reflection-quotes">
            <h3>Your Reflection Insights</h3>
            ${reflections.reflectionQuotes.map(quote => `
                <blockquote>"${quote}"</blockquote>
            `).join('')}
        </div>
    </div>`;
    }
    getCSSStyles() {
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
            background: white;
        }
        
        .header {
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: white;
            padding: 40px 30px;
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 20px;
            font-weight: 300;
        }
        
        .participant-info h2 {
            font-size: 2rem;
            margin-bottom: 10px;
        }
        
        .title {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 5px;
        }
        
        .organization {
            font-size: 1.1rem;
            opacity: 0.8;
            margin-bottom: 15px;
        }
        
        .date {
            font-size: 1rem;
            opacity: 0.7;
        }
        
        .section {
            margin: 30px 30px 40px 30px;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 1.8rem;
            color: #2563eb;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .star-card-container {
            text-align: center;
            margin: 20px 0;
        }
        
        .star-card-image {
            max-width: 100%;
            height: auto;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .star-card-description {
            font-style: italic;
            color: #6b7280;
            text-align: center;
            margin-top: 15px;
        }
        
        .pie-chart-container {
            text-align: center;
            margin: 20px 0;
        }
        
        .pie-chart-image {
            max-width: 100%;
            height: auto;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        /* Page Layout */
        .page {
            padding: 40px;
            min-height: 11in;
            page-break-after: always;
        }
        
        .page:last-child {
            page-break-after: avoid;
        }
        
        /* Introduction Text */
        .intro-text {
            font-style: italic;
            color: #6c757d;
            border-left: 4px solid #e2e8f0;
            padding-left: 20px;
            margin-bottom: 30px;
            font-size: 1.1rem;
            line-height: 1.7;
        }
        
        /* Pie Chart Section */
        .pie-chart-section {
            text-align: center;
            margin: 30px 0;
        }
        
        .pie-container {
            position: relative;
            width: 700px;
            height: 500px;
            margin: 0 auto;
        }
        
        .pie-svg {
            width: 100%;
            height: 100%;
        }
        
        .strength-label {
            font-family: 'Segoe UI', sans-serif;
            font-weight: 600;
            font-size: 14px;
            text-anchor: middle;
        }
        
        .percentage-label {
            font-family: 'Segoe UI', sans-serif;
            font-weight: 700;
            font-size: 12px;
            text-anchor: middle;
        }
        
        /* Strengths Grid */
        .strengths-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 30px 0;
        }
        
        .strength-card {
            padding: 20px;
            border-radius: 12px;
            border-left: 5px solid;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .strength-card.thinking {
            background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
            border-left-color: #01a252;
        }
        
        .strength-card.planning {
            background: linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%);
            border-left-color: #ffcb2f;
        }
        
        .strength-card.feeling {
            background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%);
            border-left-color: #167efd;
        }
        
        .strength-card.acting {
            background: linear-gradient(135deg, #ffebee 0%, #fff5f5 100%);
            border-left-color: #f14040;
        }
        
        .strength-header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .strength-number {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 12px;
            font-size: 1rem;
        }
        
        .strength-title {
            font-size: 16px;
            font-weight: 600;
            flex: 1;
            color: #374151;
        }
        
        .strength-percentage {
            font-size: 18px;
            font-weight: 700;
            color: #2563eb;
        }
        
        .strength-description {
            font-size: 14px;
            line-height: 1.6;
            color: #4a5568;
        }
        
        /* Professional Lists */
        .professional-list {
            margin: 15px 0;
            padding-left: 20px;
        }
        
        .professional-list li {
            margin-bottom: 8px;
            line-height: 1.6;
        }
        
        .profile-summary {
            background: #fefbf3;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin-top: 20px;
            border-radius: 0 8px 8px 0;
        }
        
        .profile-summary p {
            margin: 8px 0;
            line-height: 1.6;
        }
        
        .strengths-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 20px 0;
        }
        
        .quadrant {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
        }
        
        .quadrant h3 {
            font-size: 1.2rem;
            color: #374151;
            margin-bottom: 10px;
        }
        
        .score {
            font-size: 2rem;
            font-weight: bold;
            color: #2563eb;
        }
        
        .quadrant-description {
            font-size: 0.9rem;
            color: #6b7280;
            margin-top: 8px;
            line-height: 1.4;
        }
        
        .insights, .work-style, .recommendations, .collaboration-tips {
            margin: 25px 0;
        }
        
        .insights h3, .work-style h3, .recommendations h3, .collaboration-tips h3 {
            font-size: 1.3rem;
            color: #374151;
            margin-bottom: 15px;
        }
        
        .insights ul, .work-style ul, .recommendations ul, .collaboration-tips ul {
            list-style-type: none;
            padding-left: 0;
        }
        
        .insights li, .work-style li, .recommendations li, .collaboration-tips li {
            padding: 8px 0;
            padding-left: 20px;
            border-left: 3px solid #2563eb;
            margin-bottom: 8px;
            background: #f8fafc;
            border-radius: 0 6px 6px 0;
        }
        
        .flow-attributes {
            margin: 20px 0;
        }
        
        .attributes-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin: 15px 0;
        }
        
        .attribute-card {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
        }
        
        .attribute-card h4 {
            color: #92400e;
            margin-bottom: 8px;
        }
        
        .attribute-card p {
            color: #a16207;
            font-size: 0.9rem;
        }
        
        .vision-item {
            margin: 20px 0;
        }
        
        .vision-item h3 {
            font-size: 1.3rem;
            color: #374151;
            margin-bottom: 10px;
        }
        
        .vision-item p {
            background: #f0f9ff;
            border-left: 4px solid #0ea5e9;
            padding: 15px;
            border-radius: 0 6px 6px 0;
        }
        
        .two-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 25px 0;
        }
        
        .column h3 {
            font-size: 1.3rem;
            color: #374151;
            margin-bottom: 15px;
        }
        
        .action-steps ol {
            counter-reset: step-counter;
            list-style: none;
            padding-left: 0;
        }
        
        .action-steps li {
            counter-increment: step-counter;
            margin: 12px 0;
            padding: 12px;
            background: #ecfdf5;
            border-left: 4px solid #10b981;
            border-radius: 0 6px 6px 0;
        }
        
        .action-steps li::before {
            content: counter(step-counter);
            background: #10b981;
            color: white;
            font-weight: bold;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            font-size: 0.9rem;
        }
        
        .development-areas {
            margin: 20px 0;
        }
        
        .areas-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin: 15px 0;
        }
        
        .area-card {
            background: #fdf2f8;
            border: 2px solid #ec4899;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            font-weight: 600;
            color: #be185d;
        }
        
        .personal-section {
            background: #fefbf3;
            border: 2px solid #f59e0b;
            border-radius: 12px;
            padding: 25px;
            margin: 40px 30px;
        }
        
        .personal-disclaimer {
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 25px;
        }
        
        .personal-disclaimer p {
            color: #856404;
            font-weight: 600;
        }
        
        .reflection-item {
            margin: 25px 0;
        }
        
        .reflection-item h3 {
            color: #92400e;
            font-size: 1.3rem;
            margin-bottom: 15px;
        }
        
        .reflection-quotes blockquote {
            background: #f0f9ff;
            border-left: 4px solid #0ea5e9;
            padding: 15px;
            margin: 15px 0;
            font-style: italic;
            border-radius: 0 6px 6px 0;
        }
        
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            margin-top: 40px;
        }
        
        .footer p {
            margin: 5px 0;
        }
        
        /* Professional AI Content Styles */
        .ai-generated-content {
            background: #fdfdfd;
            border-radius: 12px;
            padding: 30px;
            margin: 20px 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
        
        .report-section {
            margin: 30px 0;
            page-break-inside: avoid;
        }
        
        .report-header {
            color: #1e40af;
            font-size: 1.6rem;
            font-weight: 700;
            margin-bottom: 20px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .report-content {
            margin: 15px 0;
        }
        
        .report-subsection {
            margin: 25px 0;
            padding-left: 15px;
            border-left: 3px solid #f3f4f6;
        }
        
        .report-subheader {
            color: #374151;
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .report-subcontent {
            margin: 10px 0;
        }
        
        .report-block {
            margin: 20px 0;
        }
        
        .report-paragraph {
            margin: 15px 0;
            line-height: 1.7;
            color: #374151;
            text-align: justify;
        }
        
        .report-major-title {
            font-size: 1.8rem;
            font-weight: 600;
            color: #1f2937;
            margin: 30px 0 20px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .report-section-title {
            font-size: 1.4rem;
            font-weight: 600;
            color: #374151;
            margin: 25px 0 15px 0;
            padding-bottom: 5px;
        }
        
        .report-subheading {
            font-size: 1.2rem;
            font-weight: 500;
            color: #4b5563;
            margin: 20px 0 10px 0;
        }
        
        .insights-container {
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
        }
        
        .insight-item {
            display: flex;
            align-items: flex-start;
            margin: 12px 0;
            line-height: 1.6;
        }
        
        .insight-bullet {
            color: #2563eb;
            font-weight: bold;
            margin-right: 12px;
            font-size: 1.2rem;
            flex-shrink: 0;
        }
        
        .recommendations-container {
            margin: 20px 0;
        }
        
        .recommendation-item {
            display: flex;
            align-items: flex-start;
            margin: 15px 0;
            padding: 15px;
            background: #ecfdf5;
            border-radius: 8px;
            border-left: 4px solid #10b981;
        }
        
        .recommendation-number {
            background: #10b981;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 0.9rem;
            margin-right: 15px;
            flex-shrink: 0;
        }
        
        .recommendation-text {
            line-height: 1.6;
            color: #374151;
        }
        
        .report-quote {
            background: #f0f9ff;
            border-left: 4px solid #0ea5e9;
            padding: 20px;
            margin: 20px 0;
            font-style: italic;
            border-radius: 0 8px 8px 0;
            color: #0c4a6e;
        }
        
        .personal-section .ai-generated-content {
            background: #fefbf3;
            border: 2px solid #f59e0b;
        }
        
        @media print {
            .section {
                page-break-inside: avoid;
            }
            
            .header {
                page-break-after: avoid;
            }
            
            .ai-generated-content {
                page-break-inside: avoid;
            }
        }
    `;
    }
}
export const pdfReportService = new PDFReportService();
