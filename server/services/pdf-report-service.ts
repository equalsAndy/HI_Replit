import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { 
  HolisticReportData, 
  ReportTemplateData, 
  PDFGenerationService 
} from '../../shared/holistic-report-types';

/**
 * PDF generation service for holistic reports
 * Uses Puppeteer to generate high-quality PDF reports from HTML templates
 */
export class PDFReportService implements PDFGenerationService {
  private reportsDir: string;

  constructor() {
    this.reportsDir = path.join(process.cwd(), 'storage', 'reports');
    this.ensureReportsDirectory();
  }

  private async ensureReportsDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.reportsDir, { recursive: true });
      console.log('📁 Reports directory ready:', this.reportsDir);
    } catch (error) {
      console.error('❌ Failed to create reports directory:', error);
    }
  }

  async generatePDF(reportData: HolisticReportData, starCardImagePath: string): Promise<Buffer> {
    let browser;
    
    try {
      console.log('🚀 Starting PDF generation for user:', reportData.participant.name);
      
      // Convert star card image to base64
      const starCardImageBase64 = await this.convertImageToBase64(starCardImagePath);
      
      // Prepare template data
      const templateData: ReportTemplateData = {
        ...reportData,
        starCardImageBase64,
        generatedAt: reportData.generatedAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long', 
          day: 'numeric'
        })
      };

      // Generate HTML content
      const htmlContent = this.generateHTMLReport(templateData);
      
      // Launch Puppeteer
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      
      // Set viewport for consistent rendering
      await page.setViewport({ width: 1200, height: 1600 });
      
      // Load HTML content
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // Generate PDF
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
        headerTemplate: '<div></div>', // Empty header
        footerTemplate: `
          <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
            <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
          </div>
        `
      });

      console.log('✅ PDF generated successfully, size:', pdfBuffer.length, 'bytes');
      return pdfBuffer;

    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async savePDF(pdfBuffer: Buffer, userId: number, reportType: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `user-${userId}-${reportType}-report-${timestamp}.pdf`;
    const filePath = path.join(this.reportsDir, fileName);
    
    try {
      await fs.writeFile(filePath, pdfBuffer);
      console.log('💾 PDF saved to:', filePath);
      return filePath;
    } catch (error) {
      console.error('❌ Failed to save PDF:', error);
      throw new Error(`Failed to save PDF: ${error.message}`);
    }
  }

  getPDFPath(userId: number, reportType: string): string {
    // In a real implementation, this would query the database for the actual file path
    return path.join(this.reportsDir, `user-${userId}-${reportType}-report.pdf`);
  }

  private async convertImageToBase64(imagePath: string): Promise<string> {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      const base64 = imageBuffer.toString('base64');
      const mimeType = this.getMimeType(imagePath);
      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.warn('⚠️ Could not load star card image:', imagePath, error.message);
      // Return a placeholder or empty image
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }
  }

  private getMimeType(filePath: string): string {
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

  private generateHTMLReport(data: ReportTemplateData): string {
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

    <!-- Star Card Section -->
    <div class="section">
        <h2 class="section-title">Your Star Card</h2>
        <div class="star-card-container">
            <img src="${data.starCardImageBase64}" alt="Personal Star Card" class="star-card-image">
        </div>
        <p class="star-card-description">
            Your Star Card represents your unique combination of strengths, flow attributes, and professional identity.
            ${isPersonalReport ? 'This personal version includes private insights from your reflections.' : 'This version is optimized for professional sharing and collaboration.'}
        </p>
    </div>

    <!-- Strengths Analysis -->
    <div class="section">
        <h2 class="section-title">Strengths Analysis</h2>
        <div class="strengths-grid">
            <div class="quadrant">
                <h3>Thinking</h3>
                <div class="score">${data.strengths.thinking}%</div>
            </div>
            <div class="quadrant">
                <h3>Acting</h3>
                <div class="score">${data.strengths.acting}%</div>
            </div>
            <div class="quadrant">
                <h3>Feeling</h3>
                <div class="score">${data.strengths.feeling}%</div>
            </div>
            <div class="quadrant">
                <h3>Planning</h3>
                <div class="score">${data.strengths.planning}%</div>
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

  private formatAIContent(content: string): string {
    // Convert the AI-generated content to HTML
    // Handle basic formatting like line breaks and paragraphs
    const paragraphs = content.split('\n\n');
    return paragraphs
      .filter(p => p.trim().length > 0)
      .map(paragraph => {
        const trimmed = paragraph.trim();
        
        // Handle headers (lines starting with #)
        if (trimmed.startsWith('# ')) {
          return `<h3 class="ai-header">${trimmed.substring(2)}</h3>`;
        }
        if (trimmed.startsWith('## ')) {
          return `<h4 class="ai-subheader">${trimmed.substring(3)}</h4>`;
        }
        
        // Handle bullet points
        if (trimmed.includes('\n- ') || trimmed.startsWith('- ')) {
          const items = trimmed.split('\n- ').map(item => item.startsWith('- ') ? item.substring(2) : item);
          return `<ul class="ai-list">${items.map(item => `<li>${item.trim()}</li>`).join('')}</ul>`;
        }
        
        // Handle numbered lists
        if (/^\d+\./.test(trimmed)) {
          const items = trimmed.split(/\n\d+\./).map((item, index) => {
            if (index === 0) return item.replace(/^\d+\./, '').trim();
            return item.trim();
          }).filter(item => item.length > 0);
          return `<ol class="ai-numbered-list">${items.map(item => `<li>${item}</li>`).join('')}</ol>`;
        }
        
        // Regular paragraphs
        return `<p class="ai-paragraph">${trimmed}</p>`;
      })
      .join('');
  }

  private generatePersonalReflectionsSection(reflections: any): string {
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

  private getCSSStyles(): string {
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
        
        /* AI-Generated Content Styles */
        .ai-generated-content {
            background: #fdfdfd;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 25px;
            margin: 20px 0;
        }
        
        .ai-paragraph {
            margin: 15px 0;
            line-height: 1.7;
            text-align: justify;
        }
        
        .ai-header {
            color: #2563eb;
            font-size: 1.4rem;
            margin: 25px 0 15px 0;
            font-weight: 600;
        }
        
        .ai-subheader {
            color: #374151;
            font-size: 1.2rem;
            margin: 20px 0 12px 0;
            font-weight: 600;
        }
        
        .ai-list {
            margin: 15px 0;
            padding-left: 20px;
        }
        
        .ai-list li {
            margin: 8px 0;
            padding: 5px 0;
            line-height: 1.6;
        }
        
        .ai-numbered-list {
            margin: 15px 0;
            padding-left: 20px;
        }
        
        .ai-numbered-list li {
            margin: 10px 0;
            padding: 5px 0;
            line-height: 1.6;
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