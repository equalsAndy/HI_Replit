/**
 * HTML Template Service
 * =====================
 * Shared service for generating professional HTML reports from sectional content.
 * Extracted from legacy holistic-report-routes.ts and adapted for sectional reports.
 */

export interface ReportSection {
  id: number;
  title: string;
  content: string;
}

export interface ReportMetadata {
  userName: string;
  reportType: 'ast_personal' | 'ast_professional';
  generatedAt?: Date;
  subtitle?: string;
}

export class HtmlTemplateService {

  /**
   * Generate complete HTML report from sections
   */
  generateReportHTML(sections: ReportSection[], metadata: ReportMetadata): string {
    const title = this.getReportTitle(metadata.reportType);
    const isPersonal = metadata.reportType === 'ast_personal';

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title} - ${metadata.userName}</title>
          ${this.generateCSS()}
      </head>
      <body>
          <div class="report-container">
              ${this.generateHeader(title, metadata)}
              ${this.generateSectionsHTML(sections, isPersonal)}
              ${this.generateFooter()}
          </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate professional CSS framework
   * Extracted and adapted from legacy system
   */
  generateCSS(): string {
    return `
      <style>
          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background: #f9f9f9;
              margin: 0;
              padding: 20px;
          }

          .report-container {
              max-width: 1000px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              overflow: hidden;
          }

          .header {
              background: linear-gradient(135deg, #2563eb, #1d4ed8);
              color: white;
              padding: 40px 30px;
              text-align: center;
          }

          .header h1 {
              font-size: 2.5rem;
              margin: 0 0 20px 0;
              font-weight: 300;
          }

          .participant-info h2 {
              font-size: 2rem;
              margin: 0 0 10px 0;
          }

          .participant-info p {
              margin: 5px 0;
              opacity: 0.9;
          }

          .content-section {
              padding: 40px;
          }

          .section-container {
              margin-bottom: 50px;
              padding-bottom: 30px;
              border-bottom: 1px solid #e5e7eb;
          }

          .section-container:last-child {
              border-bottom: none;
              margin-bottom: 0;
          }

          .section-title {
              font-size: 1.8rem;
              color: #2563eb;
              margin: 0 0 30px 0;
              padding-bottom: 10px;
              border-bottom: 2px solid #e5e7eb;
              position: relative;
          }

          .section-title::before {
              content: '';
              position: absolute;
              bottom: -2px;
              left: 0;
              width: 50px;
              height: 2px;
              background: #2563eb;
          }

          /* Section content styling */
          .section-content {
              color: #374151;
              line-height: 1.7;
          }

          .section-content h2 {
              font-size: 1.6rem;
              font-weight: 700;
              color: #1f2937;
              margin: 24px 0 16px 0;
              padding-bottom: 8px;
              border-bottom: 2px solid #e5e7eb;
          }

          .section-content h3 {
              font-size: 1.4rem;
              font-weight: 600;
              color: #374151;
              margin: 20px 0 12px 0;
              padding-bottom: 5px;
              border-bottom: 1px solid #e5e7eb;
          }

          .section-content h4 {
              font-size: 1.2rem;
              font-weight: 600;
              color: #4b5563;
              margin: 16px 0 8px 0;
          }

          .section-content h5 {
              font-size: 1.1rem;
              font-weight: 600;
              color: #6b7280;
              margin: 12px 0 6px 0;
          }

          .section-content p {
              margin: 12px 0;
              line-height: 1.6;
              color: #374151;
              text-align: justify;
          }

          .section-content ul, .section-content ol {
              margin: 12px 0;
              padding-left: 20px;
          }

          .section-content li {
              margin: 6px 0;
              line-height: 1.6;
          }

          .section-content ul {
              list-style-type: disc;
          }

          .section-content blockquote {
              border-left: 4px solid #2563eb;
              padding-left: 20px;
              margin: 16px 0;
              font-style: italic;
              color: #4b5563;
              background-color: #f8fafc;
              padding: 12px 20px;
              border-radius: 0 4px 4px 0;
          }

          .section-content code {
              background-color: #f1f5f9;
              padding: 2px 4px;
              border-radius: 3px;
              font-family: monospace;
              font-size: 0.9em;
          }

          .section-content hr {
              border: none;
              border-top: 2px solid #e5e7eb;
              margin: 24px 0;
          }

          .section-content strong {
              font-weight: 600;
              color: #1f2937;
          }

          .section-content em {
              font-style: italic;
              color: #4b5563;
          }

          /* Special section styling */
          .personal-section {
              background: #fefbf3;
              border: 2px solid #f59e0b;
              border-radius: 12px;
              padding: 25px;
              margin: 40px 0;
          }

          .professional-section {
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              border: 2px solid #475569;
              border-radius: 12px;
              padding: 30px;
              margin: 40px 0;
              position: relative;
              overflow: hidden;
              box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          }

          .professional-section::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, #1e40af, #3b82f6, #06b6d4);
          }

          .highlight-box {
              background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
              border: 1px solid #3b82f6;
              border-radius: 8px;
              padding: 20px;
              margin: 25px 0;
              position: relative;
          }

          .highlight-box::before {
              content: "💡";
              position: absolute;
              top: -10px;
              left: 20px;
              background: white;
              padding: 0 8px;
              font-size: 18px;
          }

          .action-items {
              background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
              border-left: 4px solid #22c55e;
              border-radius: 0 8px 8px 0;
              padding: 20px;
              margin: 25px 0;
          }

          .footer {
              background: #f8fafc;
              padding: 30px;
              text-align: center;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
          }

          .footer p {
              margin: 5px 0;
          }

          /* Responsive design */
          @media print {
              body {
                  background: white;
                  padding: 0;
              }
              .report-container {
                  box-shadow: none;
              }
          }

          @media (max-width: 768px) {
              .content-section {
                  padding: 20px;
              }
              .header {
                  padding: 30px 20px;
              }
              .header h1 {
                  font-size: 2rem;
              }
              .participant-info h2 {
                  font-size: 1.5rem;
              }
              .section-title {
                  font-size: 1.5rem;
              }
              .professional-section,
              .personal-section {
                  padding: 20px;
                  margin: 20px 0;
              }
              .highlight-box,
              .action-items {
                  padding: 15px;
                  margin: 15px 0;
              }
              .footer {
                  padding: 20px;
              }
          }
      </style>
    `;
  }

  /**
   * Convert markdown-like content to HTML
   * Enhanced version of formatAIContentForHTML from legacy system
   */
  formatMarkdownContent(content: string): string {
    if (!content || !content.trim()) return '';

    let processed = content;

    // Handle bold text (**text** -> <strong>text</strong>)
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Handle italic text (*text* -> <em>text</em>)
    processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Handle inline code (`code` -> <code>code</code>)
    processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Split into paragraphs and format properly
    const paragraphs = processed.split(/\n\n+/).filter(p => p.trim());

    return paragraphs.map(paragraph => {
      const trimmed = paragraph.trim();

      // Handle markdown headers
      if (trimmed.startsWith('####')) {
        const title = trimmed.replace(/^####\s*/, '').trim();
        return `<h5>${title}</h5>`;
      }
      if (trimmed.startsWith('###')) {
        const title = trimmed.replace(/^###\s*/, '').trim();
        return `<h4>${title}</h4>`;
      }
      if (trimmed.startsWith('##')) {
        const title = trimmed.replace(/^##\s*/, '').trim();
        return `<h3>${title}</h3>`;
      }
      if (trimmed.startsWith('#')) {
        const title = trimmed.replace(/^#\s*/, '').trim();
        return `<h2>${title}</h2>`;
      }

      // Handle bullet points
      if (trimmed.includes('\\n- ') || trimmed.startsWith('- ')) {
        const items = trimmed.split(/\\n?- /).filter(item => item.trim()).map(item => item.trim());
        return `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
      }

      // Handle numbered lists
      if (/^\\d+\\./.test(trimmed) || /\\n\\d+\\./.test(trimmed)) {
        const items = trimmed.split(/\\n?\\d+\\./).filter(item => item.trim()).map(item => item.trim());
        return `<ol>${items.map(item => `<li>${item}</li>`).join('')}</ol>`;
      }

      // Handle blockquotes
      if (trimmed.startsWith('> ')) {
        const quote = trimmed.replace(/^>\\s*/, '').trim();
        return `<blockquote>${quote}</blockquote>`;
      }

      // Handle horizontal rules
      if (trimmed === '---' || trimmed === '***') {
        return `<hr>`;
      }

      // Handle line breaks within paragraphs
      const processedParagraph = trimmed.replace(/\\n(?!\\n)/g, '<br>');

      // Regular paragraphs
      if (processedParagraph.trim()) {
        return `<p>${processedParagraph}</p>`;
      }

      return '';
    }).filter(p => p).join('');
  }

  private getReportTitle(reportType: 'ast_personal' | 'ast_professional'): string {
    return reportType === 'ast_personal'
      ? 'Personal Development Report'
      : 'Professional Profile Report';
  }

  private generateHeader(title: string, metadata: ReportMetadata): string {
    const generatedAt = metadata.generatedAt || new Date();

    return `
      <div class="header">
          <h1>${title}</h1>
          <div class="participant-info">
              <h2>${metadata.userName}</h2>
              <p>Generated on ${generatedAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} at ${generatedAt.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                timeZoneName: 'short'
              })}</p>
              ${metadata.subtitle ? `<p>${metadata.subtitle}</p>` : ''}
          </div>
      </div>
    `;
  }

  private generateSectionsHTML(sections: ReportSection[], isPersonal: boolean): string {
    return `
      <div class="content-section">
          ${sections.map((section, index) => `
              <div class="section-container">
                  <h2 class="section-title">${section.title}</h2>
                  <div class="section-content">
                      ${this.formatMarkdownContent(section.content)}
                  </div>
              </div>
          `).join('')}
      </div>
    `;
  }

  private generateFooter(): string {
    return `
      <div class="footer">
          <p><strong>AllStarTeams Report</strong></p>
          <p>Powered by Heliotrope Imaginal | Confidential Report</p>
          <p>This report contains personalized insights based on your unique strengths assessment.</p>
      </div>
    `;
  }

  /**
   * Generate specific section wrapper based on content type
   */
  generateSectionWrapper(content: string, sectionType: 'default' | 'personal' | 'professional' | 'highlight' | 'action'): string {
    const formattedContent = this.formatMarkdownContent(content);

    switch (sectionType) {
      case 'personal':
        return `<div class="personal-section">${formattedContent}</div>`;
      case 'professional':
        return `<div class="professional-section">${formattedContent}</div>`;
      case 'highlight':
        return `<div class="highlight-box">${formattedContent}</div>`;
      case 'action':
        return `<div class="action-items">${formattedContent}</div>`;
      default:
        return formattedContent;
    }
  }
}

// Export singleton instance
export const htmlTemplateService = new HtmlTemplateService();