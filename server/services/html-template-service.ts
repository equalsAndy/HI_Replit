/**
 * HTML Template Service
 * =====================
 * Shared service for generating professional HTML reports from sectional content.
 * Extracted from legacy holistic-report-routes.ts and adapted for sectional reports.
 */

import { rmlProcessor } from './rml-processor.js';

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
  userId?: string;
  generationTimeSeconds?: number;
  assistantId?: string;
  assistantModel?: string;
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
              ${this.generateFooter(metadata)}
          </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate professional CSS framework
   * Extracted and adapted from legacy system
   * Now includes RML component styles
   */
  generateCSS(): string {
    // Import RML processor for component styles
    let rmlCSS = '';
    try {
      rmlCSS = rmlProcessor.getCSS();
      console.log('✅ RML CSS loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load RML CSS:', error);
      // Fallback: include basic RML styles inline
      rmlCSS = this.getFallbackRMLCSS();
    }

    return `
      ${rmlCSS}
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

          .participant-info .report-timestamp {
              margin: 5px 0;
              opacity: 0.9;
              font-size: 1rem;
              font-weight: 500;
          }

          .participant-info .report-subtitle {
              margin: 5px 0;
              opacity: 0.9;
              font-style: italic;
          }

          .starcard-header {
              text-align: center;
              margin-top: 20px;
          }

          .header-starcard-img {
              max-width: 400px;
              height: auto;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(255,255,255,0.3);
              border: 3px solid rgba(255,255,255,0.4);
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

    // Handle code fence blocks with embedded HTML tags (``<code>markdown\ncontent\n</code>``)
    // Remove the outer markdown syntax but preserve the actual content inside
    processed = processed.replace(/``<code>([a-z]*)\n([\s\S]*?)<\/code>``/g, '$2');

    // Handle standard code fence blocks (```lang\ncode\n``` -> remove fence, keep content)
    processed = processed.replace(/```[a-z]*\n([\s\S]*?)```/g, '$1');

    // Handle double backtick code blocks (``code`` -> remove backticks, keep content)
    processed = processed.replace(/``([^`]+)``/g, '$1');

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
      ? 'AllStarTeams Report'
      : 'Professional Profile Report';
  }

  private generateHeader(title: string, metadata: ReportMetadata): string {
    const generatedAt = metadata.generatedAt || new Date();
    const staticTimestamp = generatedAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) + ' at ' + generatedAt.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    return `
      <div class="header">
          <h1>${title}</h1>
          <div class="participant-info">
              <h2>${metadata.userName}</h2>
              <p class="report-timestamp">${staticTimestamp}</p>
              ${metadata.subtitle ? `<p class="report-subtitle">${metadata.subtitle}</p>` : ''}
          </div>
          <div class="starcard-header">
              <img
                src="/api/starcard/${metadata.userId || 'current'}?v=${Date.now()}"
                alt="${metadata.userName}'s StarCard"
                class="header-starcard-img"
                onerror="this.style.display='none'; this.parentElement.innerHTML='<p style=\\'color: rgba(255,255,255,0.7); font-style: italic;\\'>StarCard not available</p>';"
              />
          </div>
      </div>
    `;
  }

  private generateSectionsHTML(sections: ReportSection[], isPersonal: boolean): string {
    // Auto-insert "About This Report" intro section before all sections
    const introHTML = this.generateReportIntro();

    return `
      <div class="content-section">
          ${introHTML}
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

  /**
   * Generate automatic "About This Report" introduction
   * This is inserted before all report sections
   */
  private generateReportIntro(): string {
    return `
      <div class="section-container report-intro-section">
        <div class="section-content">
          <div class="rml-report-introduction">
            <h1>About This Report</h1>

            <p>This report is meant as a mirror, reflecting the living patterns of your strengths, flow, imagination, and reflections. It is not a fixed portrait—any more than you are. Strengths show up differently depending on context: at work, at home, in relationships. Some rise naturally in urgency, others surface more quietly with intention. What matters is not a static label but the dynamic interplay of patterns.</p>

            <p>The purpose here is not to define you, but to offer a lens—a way to notice how your strengths combine, how you step into flow, and how imagination shapes your choices. The insights you will read are not prescriptive instructions. They are invitations: invitations to awareness, to reflection, and to conversation with others whose perspectives may complement your own.</p>

            <p>Rather than boxing you in, this report highlights tendencies, rhythms, and shapes that emerge from your responses. Think of it like observing a constellation. Each star matters on its own, but the meaning becomes clearer when you connect them together. In the same way, your strengths, flow experiences, and reflections gain depth when seen in relationship, not isolation.</p>

            <p>This is a holistic report because it pulls together multiple threads into a single picture:</p>

            <ul>
              <li><strong>Star Strengths:</strong> How your energy distributes across Acting, Planning, Thinking, and Feeling.</li>
              <li><strong>Flow Experiences:</strong> The conditions and qualities that spark your deepest engagement.</li>
              <li><strong>Strengths + Flow Together:</strong> How patterns of energy and experience reinforce each other.</li>
              <li><strong>Well-being Ladder:</strong> A snapshot of how you view life today and where you hope to be in the future.</li>
              <li><strong>Future Self & One Insight:</strong> How imagination connects your present with possibility.</li>
            </ul>

            <p>You may already recognize some of these themes in yourself. Others may feel new or only partly familiar. Both are valuable. What matters most is not whether you agree with every line, but whether the report gives you language to explore your own patterns more deeply.</p>

            <p>Finally, remember that this is a snapshot. Just as your mood changes across a day or a season, your strengths and experiences shift over time. This living picture is meant to help you pause and reflect in this moment, knowing that the next chapter may reveal a different constellation of strengths, flows, and visions.</p>
          </div>
        </div>
      </div>
    `;
  }

  private generateFooter(metadata?: ReportMetadata): string {
    // Format generation time
    let generationInfo = '';
    if (metadata?.generationTimeSeconds) {
      const minutes = Math.floor(metadata.generationTimeSeconds / 60);
      const seconds = Math.round(metadata.generationTimeSeconds % 60);
      if (minutes > 0) {
        generationInfo = `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
      } else {
        generationInfo = `${seconds} second${seconds !== 1 ? 's' : ''}`;
      }
    }

    return `
      <div class="footer">
          <p><strong>AllStarTeams Report</strong></p>
          <p>Powered by Heliotrope Imaginal | Confidential Report</p>
          <p>This report contains personalized insights based on your unique strengths assessment.</p>
          ${metadata?.generationTimeSeconds || metadata?.assistantId || metadata?.assistantModel ? `
          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 0.85rem; color: #9ca3af;">
              <p style="margin: 3px 0; font-style: italic;">Report Generation Details</p>
              ${generationInfo ? `<p style="margin: 3px 0;">Generation Time: ${generationInfo}</p>` : ''}
              ${metadata?.assistantId ? `<p style="margin: 3px 0;">Assistant ID: ${metadata.assistantId}</p>` : ''}
              ${metadata?.assistantModel ? `<p style="margin: 3px 0;">Model: ${metadata.assistantModel}</p>` : ''}
          </div>
          ` : ''}
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

  /**
   * Fallback RML CSS for when the RML processor fails to load
   */
  private getFallbackRMLCSS(): string {
    return `
      <style>
        /* Fallback RML Components Styles */
        .rml-starcard {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          background: white;
          margin: 20px 0;
        }

        .rml-starcard-header h4 {
          margin: 0 0 15px 0;
          font-size: 1.25rem;
          color: #1f2937;
        }

        .rml-strength-squares {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 12px;
          margin: 20px 0;
        }

        .rml-square {
          aspect-ratio: 1;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .rml-square-label {
          font-size: 0.875rem;
          margin-bottom: 8px;
        }

        .rml-square-value {
          font-size: 1.5rem;
        }

        .rml-pie-chart {
          display: flex;
          align-items: center;
          gap: 30px;
          margin: 20px 0;
        }

        .rml-pie-svg {
          width: 200px;
          height: 200px;
        }

        .rml-pie-legend {
          flex: 1;
        }

        .rml-legend-item {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 8px 0;
        }

        .rml-legend-color {
          width: 20px;
          height: 20px;
          border-radius: 4px;
        }

        .rml-legend-label {
          flex: 1;
          font-weight: 500;
        }

        .rml-legend-value {
          font-weight: bold;
          color: #6b7280;
        }

        .rml-imagination-circle {
          display: inline-flex;
          align-items: center;
          margin: 5px 15px;
          vertical-align: middle;
        }

        .rml-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 2px 6px rgba(138, 43, 226, 0.3);
          flex-shrink: 0;
        }

        .rml-star-icon {
          width: 20px;
          height: 20px;
          margin-bottom: 2px;
        }

        .rml-circle-label {
          font-size: 0.5rem;
          font-weight: bold;
          text-align: center;
          line-height: 1;
        }

        .rml-flow-conditions {
          margin: 20px 0;
        }

        .rml-condition {
          margin: 15px 0;
        }

        .rml-condition-label {
          display: block;
          font-weight: 500;
          margin-bottom: 5px;
          color: #374151;
        }

        .rml-condition-bar {
          width: 100%;
          height: 24px;
          background: #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }

        .rml-condition-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #2563eb);
          transition: width 0.3s ease;
        }

        .rml-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .rml-badge-category {
          background: #dbeafe;
          color: #1e40af;
        }

        .rml-badge-attribute {
          background: #dcfce7;
          color: #166534;
        }

        .rml-ladder {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin: 20px auto;
          max-width: 300px;
        }

        .rml-ladder-rung {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          transition: all 0.2s;
        }

        .rml-ladder-rung.rml-current {
          background: #dbeafe;
          border-color: #3b82f6;
          font-weight: 600;
        }

        .rml-ladder-rung.rml-future {
          background: #dcfce7;
          border-color: #22c55e;
          font-weight: 600;
        }

        .rml-rung-number {
          font-size: 1.25rem;
          font-weight: bold;
          min-width: 30px;
        }

        .rml-rung-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .rml-pattern-gallery,
        .rml-unknown {
          padding: 20px;
          background: #f9fafb;
          border: 1px dashed #d1d5db;
          border-radius: 8px;
          text-align: center;
          color: #6b7280;
          margin: 20px 0;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .rml-pie-chart {
            flex-direction: column;
          }

          .rml-strength-squares {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      </style>
    `;
  }
}

// Export singleton instance
export const htmlTemplateService = new HtmlTemplateService();