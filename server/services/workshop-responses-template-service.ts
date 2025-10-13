/**
 * Workshop Responses Template Service
 * ====================================
 * Generates professional HTML documents showing all workshop questions and answers.
 * Similar to AllStarTeams report format with StarCard header.
 */

import { WorkshopResponsesData } from './workshop-responses-service.js';
import { rmlRenderer } from './rml-renderer.js';

export class WorkshopResponsesTemplateService {

  /**
   * Generate complete HTML document from workshop responses
   */
  generateHTML(data: WorkshopResponsesData): string {
    const title = `${data.participant.name}'s Responses in the AllStarTeams Individual Workshop`;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          ${this.generateCSS()}
      </head>
      <body>
          <div class="report-container">
              ${this.generateHeader(data)}
              ${this.generateContent(data)}
              ${this.generateFooter()}
          </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate professional CSS with purple/indigo gradient header
   */
  private generateCSS(): string {
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
              background: linear-gradient(135deg, #7c3aed, #6366f1);
              color: white;
              padding: 40px 30px;
              text-align: center;
          }

          .header h1 {
              font-size: 2.2rem;
              margin: 0 0 20px 0;
              font-weight: 400;
              line-height: 1.3;
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

          .module-container {
              margin-bottom: 50px;
              padding-bottom: 30px;
              border-bottom: 2px solid #e5e7eb;
          }

          .module-container:last-child {
              border-bottom: none;
              margin-bottom: 0;
          }

          .module-title {
              font-size: 1.8rem;
              color: #7c3aed;
              margin: 0 0 30px 0;
              padding-bottom: 10px;
              border-bottom: 2px solid #e5e7eb;
              position: relative;
          }

          .module-title::before {
              content: '';
              position: absolute;
              bottom: -2px;
              left: 0;
              width: 60px;
              height: 2px;
              background: #7c3aed;
          }

          .subsection {
              margin: 30px 0;
          }

          .subsection-title {
              font-size: 1.4rem;
              font-weight: 600;
              color: #4b5563;
              margin: 20px 0 15px 0;
              padding-bottom: 8px;
              border-bottom: 1px solid #e5e7eb;
          }

          .question-answer {
              margin: 20px 0;
              background: #f8fafc;
              border-left: 4px solid #7c3aed;
              padding: 15px 20px;
              border-radius: 0 8px 8px 0;
          }

          .question {
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 8px;
              font-size: 1.05rem;
          }

          .answer {
              color: #374151;
              line-height: 1.7;
              white-space: pre-wrap;
          }

          /* Strengths visualization */
          .strengths-display {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
              margin: 30px 0;
          }

          .strength-box {
              background: white;
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              padding: 20px;
              text-align: center;
              box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          }

          .strength-box.thinking { border-color: #f59e0b; }
          .strength-box.acting { border-color: #ef4444; }
          .strength-box.feeling { border-color: #3b82f6; }
          .strength-box.planning { border-color: #10b981; }

          .strength-name {
              font-size: 1rem;
              font-weight: 600;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 10px;
          }

          .strength-percentage {
              font-size: 2.5rem;
              font-weight: bold;
              color: #1f2937;
          }

          .strength-rank {
              font-size: 0.875rem;
              color: #9ca3af;
              margin-top: 5px;
          }

          /* RML strength squares */
          .rml-strength-squares {
              display: flex;
              justify-content: center;
              gap: 20px;
              margin: 30px 0;
              flex-wrap: wrap;
          }

          .rml-strength-squares > div {
              width: 120px !important;
              height: 120px !important;
          }

          /* RML Flow attributes row */
          .rml-flow-attributes-row {
              display: flex;
              justify-content: center;
              gap: 15px;
              margin: 30px 0;
              flex-wrap: wrap;
          }

          .rml-flow-attr-square {
              width: 120px;
              height: 120px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-center: center;
              padding: 10px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }

          .rml-flow-attr-label {
              font-size: 0.9rem;
              font-weight: bold;
              color: white;
              text-align: center;
              line-height: 1.2;
          }

          .flow-score {
              background: linear-gradient(135deg, #eff6ff, #dbeafe);
              border: 2px solid #3b82f6;
              border-radius: 12px;
              padding: 25px;
              text-align: center;
              margin: 20px 0;
          }

          .flow-score-value {
              font-size: 3rem;
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 10px;
          }

          .flow-score-label {
              font-size: 1.2rem;
              color: #3b82f6;
              font-weight: 600;
          }

          /* Wellbeing ladder */
          .wellbeing-levels {
              display: flex;
              justify-content: center;
              gap: 40px;
              margin: 30px 0;
          }

          .level-display {
              text-align: center;
              padding: 20px;
              border-radius: 12px;
              min-width: 150px;
          }

          .level-display.current {
              background: linear-gradient(135deg, #dbeafe, #bfdbfe);
              border: 2px solid #3b82f6;
          }

          .level-display.future {
              background: linear-gradient(135deg, #d1fae5, #a7f3d0);
              border: 2px solid #10b981;
          }

          .level-label {
              font-size: 0.875rem;
              font-weight: 600;
              text-transform: uppercase;
              color: #6b7280;
              margin-bottom: 10px;
          }

          .level-value {
              font-size: 3rem;
              font-weight: bold;
              color: #1f2937;
          }

          .level-scale {
              font-size: 0.75rem;
              color: #9ca3af;
              margin-top: 5px;
          }

          /* Future self images */
          .future-images {
              display: flex;
              flex-wrap: wrap;
              gap: 15px;
              margin: 20px 0;
          }

          .future-image {
              max-width: 200px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
                  font-size: 1.5rem;
              }
              .strengths-display {
                  grid-template-columns: repeat(2, 1fr);
                  gap: 15px;
              }
              .shape-roles {
                  grid-template-columns: 1fr;
              }
              .wellbeing-levels {
                  flex-direction: column;
                  gap: 20px;
              }
          }
      </style>
    `;
  }

  /**
   * Generate header with StarCard
   */
  private generateHeader(data: WorkshopResponsesData): string {
    const timestamp = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <div class="header">
          <h1>${data.participant.name}'s Responses in the AllStarTeams Individual Workshop</h1>
          <div class="participant-info">
              <p class="report-timestamp">Generated ${timestamp}</p>
          </div>
          <div class="starcard-header">
              <img
                src="/api/starcard/${data.participant.id}?v=${Date.now()}"
                alt="${data.participant.name}'s StarCard"
                class="header-starcard-img"
                onerror="this.style.display='none'; this.parentElement.innerHTML='<p style=\\'color: rgba(255,255,255,0.7); font-style: italic;\\'>StarCard not available</p>';"
              />
          </div>
      </div>
    `;
  }

  /**
   * Generate main content sections
   */
  private generateContent(data: WorkshopResponsesData): string {
    return `
      <div class="content-section">
        ${this.generateIntroduction()}
        ${this.generateStrengthsModule(data)}
        ${this.generateFlowModule(data)}
        ${this.generateWellbeingModule(data)}
        ${this.generateFutureSelfModule(data)}
        ${this.generateFinalReflectionModule(data)}
      </div>
    `;
  }

  /**
   * Generate introduction section
   */
  private generateIntroduction(): string {
    return `
      <div class="module-container">
        <div class="question-answer" style="background: linear-gradient(135deg, #ede9fe, #ddd6fe); border-left-color: #7c3aed;">
          <p style="color: #5b21b6; font-size: 1.1rem; line-height: 1.7; margin: 0;">
            This document contains all of your responses from the AllStarTeams Individual Workshop.
            It provides a comprehensive record of your reflections, assessments, and insights throughout
            the journey. Use this as a reference for your continued growth and development.
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Generate Module 2: Strengths & Imagination
   */
  private generateStrengthsModule(data: WorkshopResponsesData): string {
    const { strengths, strengthReflections } = data;

    // Use RML renderer for strength squares
    const strengthSquaresHTML = rmlRenderer.render({
      type: 'strength_squares',
      id: 'strength_squares',
      strengths: {
        thinking: strengths.thinking,
        acting: strengths.acting,
        feeling: strengths.feeling,
        planning: strengths.planning
      }
    });

    return `
      <div class="module-container">
        <h2 class="module-title">Module 2: Your Star Strengths</h2>

        <div class="subsection">
          <h3 class="subsection-title">Your Strength Profile</h3>
          ${strengthSquaresHTML}
        </div>

        <div class="subsection">
          <h3 class="subsection-title">Your Reflections on Strengths</h3>
          ${strengthReflections.map(item => `
            <div class="question-answer">
              <div class="question">${item.question}</div>
              <div class="answer">${this.escapeHtml(item.answer)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Generate Module 3: Flow Experiences
   */
  private generateFlowModule(data: WorkshopResponsesData): string {
    const { flowAssessment, flowAttributes, flowReflections } = data;

    // Use RML renderer for flow attributes
    let flowAttributesHTML = '';
    if (flowAttributes.length > 0) {
      flowAttributesHTML = rmlRenderer.render({
        type: 'flow_attributes_row',
        id: 'flow_attributes',
        attributes: flowAttributes
      });
    }

    return `
      <div class="module-container">
        <h2 class="module-title">Module 3: Flow Experiences</h2>

        <div class="subsection">
          <h3 class="subsection-title">Flow Assessment Results</h3>

          <div class="flow-score">
            <div class="flow-score-value">${flowAssessment.totalScore}/70</div>
            <div class="flow-score-label">${flowAssessment.interpretation}</div>
          </div>
        </div>

        ${flowAttributes.length > 0 ? `
          <div class="subsection">
            <h3 class="subsection-title">Your Flow Attributes</h3>
            <p style="color: #6b7280; margin-bottom: 15px;">The words you selected to describe your flow experiences:</p>
            ${flowAttributesHTML}
          </div>
        ` : ''}

        <div class="subsection">
          <h3 class="subsection-title">Your Flow Reflections</h3>
          ${flowReflections.map(item => `
            <div class="question-answer">
              <div class="question">${item.question}</div>
              <div class="answer">${this.escapeHtml(item.answer)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Generate Module 4: Well-being & Future Vision
   */
  private generateWellbeingModule(data: WorkshopResponsesData): string {
    const { wellbeing } = data;

    return `
      <div class="module-container">
        <h2 class="module-title">Module 4: Well-being Ladder</h2>

        <div class="subsection">
          <h3 class="subsection-title">Your Well-being Levels</h3>

          <div class="wellbeing-levels">
            <div class="level-display current">
              <div class="level-label">Current Level</div>
              <div class="level-value">${wellbeing.currentLevel}</div>
              <div class="level-scale">out of 10</div>
            </div>
            <div class="level-display future">
              <div class="level-label">Future Level (1 Year)</div>
              <div class="level-value">${wellbeing.futureLevel}</div>
              <div class="level-scale">out of 10</div>
            </div>
          </div>
        </div>

        <div class="subsection">
          <h3 class="subsection-title">Your Well-being Reflections</h3>
          ${wellbeing.reflections.map(item => `
            <div class="question-answer">
              <div class="question">${item.question}</div>
              <div class="answer">${this.escapeHtml(item.answer)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Generate Future Self Module
   */
  private generateFutureSelfModule(data: WorkshopResponsesData): string {
    const { futureSelf } = data;

    // Generate image HTML - handle both photoId and url formats
    let imagesHTML = '';
    if (futureSelf.images.length > 0) {
      imagesHTML = futureSelf.images.map((img: any) => {
        // Support both database photos (photoId) and external URLs (url)
        let imageSrc = '';
        if (typeof img === 'string') {
          // Legacy format: direct URL string
          imageSrc = img;
        } else if (img.photoId) {
          // Database photo reference
          imageSrc = `/api/photos/${img.photoId}`;
        } else if (img.url) {
          // External URL
          imageSrc = img.url;
        }

        return imageSrc ? `<img src="${imageSrc}" alt="Future self visualization" class="future-image" onerror="this.style.display='none';" />` : '';
      }).join('');
    }

    return `
      <div class="module-container">
        <h2 class="module-title">Your Future Self Vision</h2>

        ${imagesHTML ? `
          <div class="subsection">
            <h3 class="subsection-title">Selected Images</h3>
            <div class="future-images">
              ${imagesHTML}
            </div>
          </div>
        ` : ''}

        <div class="subsection">
          <h3 class="subsection-title">Your Future Self Reflections</h3>
          ${futureSelf.reflections.map(item => `
            <div class="question-answer">
              <div class="question">${item.question}</div>
              <div class="answer">${this.escapeHtml(item.answer)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Generate Final Reflection Module
   */
  private generateFinalReflectionModule(data: WorkshopResponsesData): string {
    const { finalReflection } = data;

    return `
      <div class="module-container">
        <h2 class="module-title">Final Reflection</h2>

        <div class="question-answer" style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-left-color: #f59e0b;">
          <div class="question" style="color: #92400e;">${finalReflection.question}</div>
          <div class="answer" style="color: #78350f; font-size: 1.1rem; font-weight: 500;">${this.escapeHtml(finalReflection.answer)}</div>
        </div>
      </div>
    `;
  }

  /**
   * Generate footer
   */
  private generateFooter(): string {
    return `
      <div class="footer">
          <p><strong>AllStarTeams Workshop Responses</strong></p>
          <p>Powered by Heliotrope Imaginal | Confidential Document</p>
          <p>This document contains your personal workshop responses and reflections.</p>
      </div>
    `;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

export const workshopResponsesTemplateService = new WorkshopResponsesTemplateService();
