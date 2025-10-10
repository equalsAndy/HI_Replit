/**
 * RML Renderer
 * =============
 * Renders visual components from RML declarations with AST branding.
 * Generates HTML+CSS for various chart types and visual elements.
 */

import { RMLVisualDeclaration } from './rml-parser.js';

export class RMLRenderer {
  // AST brand colors
  private colors = {
    thinking: 'rgb(1, 162, 82)',    // Green
    acting: 'rgb(241, 64, 64)',      // Red
    feeling: 'rgb(22, 126, 253)',    // Blue
    planning: 'rgb(255, 203, 47)',   // Yellow
    imagination: 'rgb(138, 43, 226)'  // Purple
  };

  /**
   * Render a visual component based on its declaration
   */
  render(declaration: RMLVisualDeclaration): string {
    const { type } = declaration;
    
    console.log(`🎨 RML Renderer: Processing type "${type}"`);
    console.log(`   Declaration:`, JSON.stringify(declaration, null, 2));
    
    let result: string;

    switch (type) {
      case 'starcard':
        return this.renderStarCard(declaration);
      case 'vision1':
        return this.renderVisionImage(declaration, 1);
      case 'vision2':
        return this.renderVisionImage(declaration, 2);
      case 'vision3':
        return this.renderVisionImage(declaration, 3);
      case 'vision4':
        return this.renderVisionImage(declaration, 4);
      case 'starcard_img':
        return this.renderStarCard(declaration);
      case 'strength_squares':
        return this.renderStrengthSquares(declaration);
      case 'strength_pie':
        return this.renderStrengthPie(declaration);
      case 'pattern_gallery':
        return this.renderPatternGallery(declaration);
      case 'imagination_circle':
        return this.renderImaginationCircle(declaration);
      case 'report_intro_content':
        return this.renderReportIntroContent(declaration);
      case 'shapes_intro_content':
        return this.renderShapesIntroContent(declaration);
      case 'user_strength_chart':
        return this.renderUserStrengthChart(declaration);
      case 'flow_attribute':
        return this.renderFlowAttributeSquare(declaration);
      case 'flow_attributes_row':
        return this.renderFlowAttributesRow(declaration);
      case 'future_self_image':
        return this.renderFutureSelfImage(declaration);
      case 'ladder':
        return this.renderLadder(declaration);
      case 'thinking_square':
        return this.renderThinkingSquare(declaration);
      case 'feeling_square':
        return this.renderFeelingSquare(declaration);
      case 'acting_square':
        return this.renderActingSquare(declaration);
      case 'planning_square':
        return this.renderPlanningSquare(declaration);
      default:
        console.warn(`⚠️ Unknown visual type: ${type}`);
        return `<div class="rml-unknown">Unknown visual type: ${type}</div>`;
    }
  }

  /**
   * Render StarCard - use actual user's StarCard image from database
   */
  private renderStarCard(decl: RMLVisualDeclaration): string {
    const { participant, user_id } = decl;

    // StarCard should reference the actual PNG file from the database
    // Add cache-busting timestamp to prevent browser caching issues
    const starCardPath = `/api/starcard/${user_id || 'current'}?v=${Date.now()}`;

    return `
      <div class="rml-starcard">
        <div class="rml-starcard-header">
          <h4>${participant || 'Your'} StarCard</h4>
        </div>
        <div class="rml-starcard-image">
          <img src="${starCardPath}" alt="${participant}'s StarCard" class="rml-starcard-img" />
        </div>
      </div>
    `;
  }

  /**
   * Render colored strength squares - matches AST workshop styling
   */
  private renderStrengthSquares(decl: RMLVisualDeclaration): string {
    const { strengths } = decl;
    if (!strengths) return '';

    const squares = [
      { label: 'THINKING', value: strengths.thinking, color: this.colors.thinking },
      { label: 'ACTING', value: strengths.acting, color: this.colors.acting },
      { label: 'FEELING', value: strengths.feeling, color: this.colors.feeling },
      { label: 'PLANNING', value: strengths.planning, color: this.colors.planning }
    ].sort((a, b) => b.value - a.value);

    return `
      <div class="rml-strength-squares">
        ${squares.map(s => `
          <div class="w-20 h-20 rounded flex items-center justify-center text-xs font-bold text-white mr-3" style="background-color: ${s.color};">
            <div class="relative flex items-center justify-center w-full h-full">
              <span class="text-center leading-tight relative z-10">${s.label}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Render strength pie chart using SVG
   */
  private renderStrengthPie(decl: RMLVisualDeclaration): string {
    const { strengths } = decl;
    if (!strengths) return '';

    const total = strengths.thinking + strengths.acting + strengths.feeling + strengths.planning;
    if (total === 0) return '';

    // Calculate percentages and angles
    const data = [
      { label: 'Thinking', value: strengths.thinking, color: this.colors.thinking },
      { label: 'Acting', value: strengths.acting, color: this.colors.acting },
      { label: 'Feeling', value: strengths.feeling, color: this.colors.feeling },
      { label: 'Planning', value: strengths.planning, color: this.colors.planning }
    ];

    let currentAngle = 0;
    const slices = data.map(d => {
      const percentage = (d.value / total) * 100;
      const angle = (d.value / total) * 360;
      const slice = this.createPieSlice(currentAngle, angle, d.color);
      currentAngle += angle;
      return { ...d, percentage, slice };
    });

    return `
      <div class="rml-pie-chart">
        <svg viewBox="0 0 200 200" class="rml-pie-svg">
          <circle cx="100" cy="100" r="90" fill="none" stroke="#e5e7eb" stroke-width="2"/>
          ${slices.map(s => s.slice).join('')}
        </svg>
        <div class="rml-pie-legend">
          ${slices.map(s => `
            <div class="rml-legend-item">
              <span class="rml-legend-color" style="background-color: ${s.color}"></span>
              <span class="rml-legend-label">${s.label}</span>
              <span class="rml-legend-value">${s.percentage.toFixed(1)}%</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Create SVG pie slice path
   */
  private createPieSlice(startAngle: number, angle: number, color: string): string {
    const radius = 90;
    const cx = 100;
    const cy = 100;

    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (startAngle + angle - 90) * Math.PI / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    return `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${color}" stroke="white" stroke-width="2"/>`;
  }

  /**
   * Render pattern gallery - SVG strength pattern visualization
   */
  private renderPatternGallery(decl: RMLVisualDeclaration): string {
    const { pattern_number, strengths } = decl;
    
    // If pattern_number is specified, render individual pattern
    if (pattern_number) {
      return this.renderIndividualPattern(pattern_number, strengths);
    }
    
    // Otherwise render full gallery
    return this.renderFullPatternGallery(strengths);
  }
  
  /**
   * Render individual strength pattern
   */
  private renderIndividualPattern(patternNumber: number, strengths?: any): string {
    const patterns = this.getPatternDefinitions();
    const pattern = patterns[patternNumber - 1];
    
    if (!pattern) {
      return `<div class="rml-unknown">Pattern ${patternNumber} not found</div>`;
    }
    
    // Use user's strength data if provided, otherwise use grayscale
    const useColors = strengths ? this.getStrengthColors(strengths) : null;
    
    return `
      <div class="rml-pattern-single">
        <svg xmlns="http://www.w3.org/2000/svg" width="140" height="200" viewBox="0 0 140 200">
          ${this.generatePatternStyles(useColors)}
          <g transform="translate(12,8)">
            ${pattern.bars.map((bar, index) => `
              <rect class="bar ${bar.type}" x="${bar.x}" y="${bar.y}" width="25.20" height="${bar.height}" />
            `).join('')}
            <text class="label" x="70.00" y="174" text-anchor="middle">${pattern.label}</text>
            ${pattern.sublabel ? `<text class="label" x="70.00" y="186" text-anchor="middle">${pattern.sublabel}</text>` : ''}
          </g>
        </svg>
      </div>
    `;
  }
  
  /**
   * Render full pattern gallery
   */
  private renderFullPatternGallery(strengths?: any): string {
    const useColors = strengths ? this.getStrengthColors(strengths) : null;
    
    return `
      <div class="rml-pattern-gallery">
        <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="200" viewBox="0 0 1200 200">
          ${this.generatePatternStyles(useColors)}
          
          <!-- Pattern 1: Balanced -->
          <g id="pattern-1" transform="translate(12,8)">
            <rect class="bar acting" x="11.20" y="46.29" width="25.20" height="115.71" />
            <rect class="bar planning" x="42.00" y="50.91" width="25.20" height="111.09" />
            <rect class="bar thinking" x="72.80" y="41.66" width="25.20" height="120.34" />
            <rect class="bar feeling" x="103.60" y="46.29" width="25.20" height="115.71" />
            <text class="label" x="70.00" y="174" text-anchor="middle">1. Balanced</text>
          </g>
          
          <!-- Pattern 2: One High -->
          <g id="pattern-2" transform="translate(160,8)">
            <rect class="bar acting" x="11.20" y="23.14" width="25.20" height="138.86" />
            <rect class="bar planning" x="42.00" y="60.17" width="25.20" height="101.83" />
            <rect class="bar thinking" x="72.80" y="64.80" width="25.20" height="97.20" />
            <rect class="bar feeling" x="103.60" y="55.54" width="25.20" height="106.46" />
            <text class="label" x="70.00" y="174" text-anchor="middle">2. One High</text>
          </g>
          
          <!-- Pattern 3: One Low -->
          <g id="pattern-3" transform="translate(308,8)">
            <rect class="bar acting" x="11.20" y="37.03" width="25.20" height="124.97" />
            <rect class="bar planning" x="42.00" y="41.66" width="25.20" height="120.34" />
            <rect class="bar thinking" x="72.80" y="46.29" width="25.20" height="115.71" />
            <rect class="bar feeling" x="103.60" y="87.94" width="25.20" height="74.06" />
            <text class="label" x="70.00" y="174" text-anchor="middle">3. One Low</text>
          </g>
          
          <!-- Pattern 4: Two High + Two Low -->
          <g id="pattern-4" transform="translate(456,8)">
            <rect class="bar acting" x="11.20" y="27.77" width="25.20" height="134.23" />
            <rect class="bar planning" x="42.00" y="32.40" width="25.20" height="129.60" />
            <rect class="bar thinking" x="72.80" y="78.69" width="25.20" height="83.31" />
            <rect class="bar feeling" x="103.60" y="83.31" width="25.20" height="78.69" />
            <text class="label" x="70.00" y="174" text-anchor="middle">4. Two High +</text>
            <text class="label" x="70.00" y="186" text-anchor="middle">Two Low</text>
          </g>
          
          <!-- Pattern 5: Three High + One Low -->
          <g id="pattern-5" transform="translate(604,8)">
            <rect class="bar acting" x="11.20" y="32.40" width="25.20" height="129.60" />
            <rect class="bar planning" x="42.00" y="37.03" width="25.20" height="124.97" />
            <rect class="bar thinking" x="72.80" y="41.66" width="25.20" height="120.34" />
            <rect class="bar feeling" x="103.60" y="83.31" width="25.20" height="78.69" />
            <text class="label" x="70.00" y="174" text-anchor="middle">5. Three High +</text>
            <text class="label" x="70.00" y="186" text-anchor="middle">One Low</text>
          </g>
          
          <!-- Pattern 6: Three Low + One High -->
          <g id="pattern-6" transform="translate(752,8)">
            <rect class="bar acting" x="11.20" y="23.14" width="25.20" height="138.86" />
            <rect class="bar planning" x="42.00" y="69.43" width="25.20" height="92.57" />
            <rect class="bar thinking" x="72.80" y="74.06" width="25.20" height="87.94" />
            <rect class="bar feeling" x="103.60" y="78.69" width="25.20" height="83.31" />
            <text class="label" x="70.00" y="174" text-anchor="middle">6. Three Low +</text>
            <text class="label" x="70.00" y="186" text-anchor="middle">One High</text>
          </g>
          
          <!-- Pattern 7: Two Middle + Two Outliers -->
          <g id="pattern-7" transform="translate(900,8)">
            <rect class="bar acting" x="11.20" y="23.14" width="25.20" height="138.86" />
            <rect class="bar planning" x="42.00" y="50.91" width="25.20" height="111.09" />
            <rect class="bar thinking" x="72.80" y="50.91" width="25.20" height="111.09" />
            <rect class="bar feeling" x="103.60" y="92.57" width="25.20" height="69.43" />
            <text class="label" x="70.00" y="174" text-anchor="middle">7. Two Middle +</text>
            <text class="label" x="70.00" y="186" text-anchor="middle">Two Outliers</text>
          </g>
          
          <!-- Pattern 8: Stair-step -->
          <g id="pattern-8" transform="translate(1048,8)">
            <rect class="bar acting" x="11.20" y="23.14" width="25.20" height="138.86" />
            <rect class="bar planning" x="42.00" y="46.29" width="25.20" height="115.71" />
            <rect class="bar thinking" x="72.80" y="69.43" width="25.20" height="92.57" />
            <rect class="bar feeling" x="103.60" y="92.57" width="25.20" height="69.43" />
            <text class="label" x="70.00" y="174" text-anchor="middle">8. Stair-step</text>
          </g>
        </svg>
      </div>
    `;
  }
  
  /**
   * Get pattern definitions for individual rendering
   */
  private getPatternDefinitions() {
    return [
      {
        label: "1. Balanced",
        bars: [
          { type: "acting", x: "11.20", y: "46.29", height: "115.71" },
          { type: "planning", x: "42.00", y: "50.91", height: "111.09" },
          { type: "thinking", x: "72.80", y: "41.66", height: "120.34" },
          { type: "feeling", x: "103.60", y: "46.29", height: "115.71" }
        ]
      },
      {
        label: "2. One High",
        bars: [
          { type: "acting", x: "11.20", y: "23.14", height: "138.86" },
          { type: "planning", x: "42.00", y: "60.17", height: "101.83" },
          { type: "thinking", x: "72.80", y: "64.80", height: "97.20" },
          { type: "feeling", x: "103.60", y: "55.54", height: "106.46" }
        ]
      },
      {
        label: "3. One Low",
        bars: [
          { type: "acting", x: "11.20", y: "37.03", height: "124.97" },
          { type: "planning", x: "42.00", y: "41.66", height: "120.34" },
          { type: "thinking", x: "72.80", y: "46.29", height: "115.71" },
          { type: "feeling", x: "103.60", y: "87.94", height: "74.06" }
        ]
      },
      {
        label: "4. Two High +",
        sublabel: "Two Low",
        bars: [
          { type: "acting", x: "11.20", y: "27.77", height: "134.23" },
          { type: "planning", x: "42.00", y: "32.40", height: "129.60" },
          { type: "thinking", x: "72.80", y: "78.69", height: "83.31" },
          { type: "feeling", x: "103.60", y: "83.31", height: "78.69" }
        ]
      },
      {
        label: "5. Three High +",
        sublabel: "One Low",
        bars: [
          { type: "acting", x: "11.20", y: "32.40", height: "129.60" },
          { type: "planning", x: "42.00", y: "37.03", height: "124.97" },
          { type: "thinking", x: "72.80", y: "41.66", height: "120.34" },
          { type: "feeling", x: "103.60", y: "83.31", height: "78.69" }
        ]
      },
      {
        label: "6. Three Low +",
        sublabel: "One High",
        bars: [
          { type: "acting", x: "11.20", y: "23.14", height: "138.86" },
          { type: "planning", x: "42.00", y: "69.43", height: "92.57" },
          { type: "thinking", x: "72.80", y: "74.06", height: "87.94" },
          { type: "feeling", x: "103.60", y: "78.69", height: "83.31" }
        ]
      },
      {
        label: "7. Two Middle +",
        sublabel: "Two Outliers",
        bars: [
          { type: "acting", x: "11.20", y: "23.14", height: "138.86" },
          { type: "planning", x: "42.00", y: "50.91", height: "111.09" },
          { type: "thinking", x: "72.80", y: "50.91", height: "111.09" },
          { type: "feeling", x: "103.60", y: "92.57", height: "69.43" }
        ]
      },
      {
        label: "8. Stair-step",
        bars: [
          { type: "acting", x: "11.20", y: "23.14", height: "138.86" },
          { type: "planning", x: "42.00", y: "46.29", height: "115.71" },
          { type: "thinking", x: "72.80", y: "69.43", height: "92.57" },
          { type: "feeling", x: "103.60", y: "92.57", height: "69.43" }
        ]
      }
    ];
  }
  
  /**
   * Generate CSS styles for patterns (colored or grayscale)
   */
  private generatePatternStyles(strengthColors?: any): string {
    if (strengthColors) {
      // Use actual strength colors based on user's data
      return `
        <style>
          .bar.acting   { fill: ${strengthColors.acting}; }
          .bar.planning { fill: ${strengthColors.planning}; }
          .bar.thinking { fill: ${strengthColors.thinking}; }
          .bar.feeling  { fill: ${strengthColors.feeling}; }
          .label { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; font-size: 10px; fill: #111; }
        </style>
      `;
    } else {
      // Use grayscale (original styling)
      return `
        <style>
          .bar.acting   { fill: #444; }
          .bar.planning { fill: #666; }
          .bar.thinking { fill: #888; }
          .bar.feeling  { fill: #aaa; }
          .label { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; font-size: 10px; fill: #111; }
        </style>
      `;
    }
  }
  
  /**
   * Get strength colors based on user's strength order
   */
  private getStrengthColors(strengths: any): any {
    const strengthArray = [
      { name: 'thinking', value: strengths.thinking, color: this.colors.thinking },
      { name: 'acting', value: strengths.acting, color: this.colors.acting },
      { name: 'feeling', value: strengths.feeling, color: this.colors.feeling },
      { name: 'planning', value: strengths.planning, color: this.colors.planning }
    ].sort((a, b) => b.value - a.value);
    
    // Return colors mapped by strength name
    return {
      thinking: strengthArray.find(s => s.name === 'thinking')?.color || this.colors.thinking,
      acting: strengthArray.find(s => s.name === 'acting')?.color || this.colors.acting,
      feeling: strengthArray.find(s => s.name === 'feeling')?.color || this.colors.feeling,
      planning: strengthArray.find(s => s.name === 'planning')?.color || this.colors.planning
    };
  }

  /**
   * Render imagination circle - matches AST workshop styling with purple circle background
   */
  private renderImaginationCircle(decl: RMLVisualDeclaration): string {
    return `
      <div class="rml-imagination-circle">
        <div class="w-24 h-24 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3" style="background-color: rgb(138, 43, 226);">
          <div class="relative flex items-center justify-center w-full h-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="absolute w-20 h-20 opacity-30" stroke-width="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span class="text-center leading-tight relative z-10">IMAGINATION</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render report introduction content - standard "About This Report" section
   * GENERIC - No user data required, same for all reports
   */
  private renderReportIntroContent(decl: RMLVisualDeclaration): string {
    return `
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
    `;
  }

  /**
   * Renders the complete shapes introduction with SVG pattern gallery
   * GENERIC - No user data required, just gray educational patterns
   */
  private renderShapesIntroContent(decl: RMLVisualDeclaration): string {
    return `
      <div class="rml-shapes-introduction">
        <h3>Your Strengths Shape</h3>
        <p>Beyond percentages, your strengths create a unique <strong>shape</strong>—a visual pattern that reveals how your energy naturally flows and focuses across the four core domains.</p>

        <p>Your shape is not a fixed category, but rather a mirror that helps you notice which strengths tend to lead, which provide steady support, and which operate more quietly in the background.</p>

        <h4>The Eight Core Patterns</h4>
        <p>Every strengths profile falls into one of eight fundamental shapes:</p>

        <div class="rml-patterns-gallery">
          <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="200" viewBox="0 0 1200 200" class="rml-patterns-svg">
            <style>
              .bar.acting   { fill: #444; }
              .bar.planning { fill: #666; }
              .bar.thinking { fill: #888; }
              .bar.feeling  { fill: #aaa; }
              .pattern-label { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; font-size: 10px; fill: #111; }
            </style>
            <g id="pattern-1" transform="translate(12,8)">
              <rect class="bar acting" x="11.20" y="46.29" width="25.20" height="115.71" />
              <rect class="bar planning" x="42.00" y="50.91" width="25.20" height="111.09" />
              <rect class="bar thinking" x="72.80" y="41.66" width="25.20" height="120.34" />
              <rect class="bar feeling" x="103.60" y="46.29" width="25.20" height="115.71" />
              <text class="pattern-label" x="70.00" y="174" text-anchor="middle">1. Balanced</text>
            </g>
            <g id="pattern-2" transform="translate(160,8)">
              <rect class="bar acting" x="11.20" y="23.14" width="25.20" height="138.86" />
              <rect class="bar planning" x="42.00" y="60.17" width="25.20" height="101.83" />
              <rect class="bar thinking" x="72.80" y="64.80" width="25.20" height="97.20" />
              <rect class="bar feeling" x="103.60" y="55.54" width="25.20" height="106.46" />
              <text class="pattern-label" x="70.00" y="174" text-anchor="middle">2. One High</text>
            </g>
            <g id="pattern-3" transform="translate(308,8)">
              <rect class="bar acting" x="11.20" y="37.03" width="25.20" height="124.97" />
              <rect class="bar planning" x="42.00" y="41.66" width="25.20" height="120.34" />
              <rect class="bar thinking" x="72.80" y="46.29" width="25.20" height="115.71" />
              <rect class="bar feeling" x="103.60" y="87.94" width="25.20" height="74.06" />
              <text class="pattern-label" x="70.00" y="174" text-anchor="middle">3. One Low</text>
            </g>
            <g id="pattern-4" transform="translate(456,8)">
              <rect class="bar acting" x="11.20" y="27.77" width="25.20" height="134.23" />
              <rect class="bar planning" x="42.00" y="32.40" width="25.20" height="129.60" />
              <rect class="bar thinking" x="72.80" y="78.69" width="25.20" height="83.31" />
              <rect class="bar feeling" x="103.60" y="83.31" width="25.20" height="78.69" />
              <text class="pattern-label" x="70.00" y="174" text-anchor="middle">4. Two High +</text>
              <text class="pattern-label" x="70.00" y="186" text-anchor="middle">Two Low</text>
            </g>
            <g id="pattern-5" transform="translate(604,8)">
              <rect class="bar acting" x="11.20" y="32.40" width="25.20" height="129.60" />
              <rect class="bar planning" x="42.00" y="37.03" width="25.20" height="124.97" />
              <rect class="bar thinking" x="72.80" y="41.66" width="25.20" height="120.34" />
              <rect class="bar feeling" x="103.60" y="83.31" width="25.20" height="78.69" />
              <text class="pattern-label" x="70.00" y="174" text-anchor="middle">5. Three High +</text>
              <text class="pattern-label" x="70.00" y="186" text-anchor="middle">One Low</text>
            </g>
            <g id="pattern-6" transform="translate(752,8)">
              <rect class="bar acting" x="11.20" y="23.14" width="25.20" height="138.86" />
              <rect class="bar planning" x="42.00" y="69.43" width="25.20" height="92.57" />
              <rect class="bar thinking" x="72.80" y="74.06" width="25.20" height="87.94" />
              <rect class="bar feeling" x="103.60" y="78.69" width="25.20" height="83.31" />
              <text class="pattern-label" x="70.00" y="174" text-anchor="middle">6. Three Low +</text>
              <text class="pattern-label" x="70.00" y="186" text-anchor="middle">One High</text>
            </g>
            <g id="pattern-7" transform="translate(900,8)">
              <rect class="bar acting" x="11.20" y="23.14" width="25.20" height="138.86" />
              <rect class="bar planning" x="42.00" y="50.91" width="25.20" height="111.09" />
              <rect class="bar thinking" x="72.80" y="50.91" width="25.20" height="111.09" />
              <rect class="bar feeling" x="103.60" y="92.57" width="25.20" height="69.43" />
              <text class="pattern-label" x="70.00" y="174" text-anchor="middle">7. Two Middle +</text>
              <text class="pattern-label" x="70.00" y="186" text-anchor="middle">Two Outliers</text>
            </g>
            <g id="pattern-8" transform="translate(1048,8)">
              <rect class="bar acting" x="11.20" y="23.14" width="25.20" height="138.86" />
              <rect class="bar planning" x="42.00" y="46.29" width="25.20" height="115.71" />
              <rect class="bar thinking" x="72.80" y="69.43" width="25.20" height="92.57" />
              <rect class="bar feeling" x="103.60" y="92.57" width="25.20" height="69.43" />
              <text class="pattern-label" x="70.00" y="174" text-anchor="middle">8. Stair-step</text>
            </g>
          </svg>
        </div>
      </div>
    `;
  }

  /**
   * Renders user's personalized strength chart with colorized bars
   * PERSONALIZED - Requires user's strengths data for colors and heights
   */
  private renderUserStrengthChart(decl: RMLVisualDeclaration): string {
    const { strengths } = decl;

    if (!strengths) {
      return '<div class="rml-error">Missing strengths data for user chart</div>';
    }

    const strengthsData = typeof strengths === 'string' ? JSON.parse(strengths) : strengths;

    // Calculate proportional heights (max 150px)
    const maxHeight = 150;
    const maxPercentage = Math.max(...(Object.values(strengthsData) as number[]));

    // Create array of strengths with their data and sort largest to smallest
    const strengthBars = [
      {
        name: 'thinking',
        label: 'Thinking',
        value: strengthsData.thinking,
        height: Math.round((strengthsData.thinking / maxPercentage) * maxHeight),
        color: this.colors.thinking
      },
      {
        name: 'acting',
        label: 'Acting',
        value: strengthsData.acting,
        height: Math.round((strengthsData.acting / maxPercentage) * maxHeight),
        color: this.colors.acting
      },
      {
        name: 'planning',
        label: 'Planning',
        value: strengthsData.planning,
        height: Math.round((strengthsData.planning / maxPercentage) * maxHeight),
        color: this.colors.planning
      },
      {
        name: 'feeling',
        label: 'Feeling',
        value: strengthsData.feeling,
        height: Math.round((strengthsData.feeling / maxPercentage) * maxHeight),
        color: this.colors.feeling
      }
    ].sort((a, b) => b.value - a.value); // Sort largest to smallest

    return `
      <div class="rml-user-strength-chart">
        <div class="rml-pattern-bars">
          ${strengthBars.map(bar => `
          <div class="rml-strength-bar rml-${bar.name}" style="height: ${bar.height}px;">
            <span class="rml-strength-label">${bar.label}</span>
          </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Renders flow attribute as colored square - matches thinking square style
   */
  private renderFlowAttributeSquare(decl: RMLVisualDeclaration): string {
    const { value } = decl;

    if (!value || value === 'undefined') {
      return '<div class="rml-error">Missing value for flow attribute</div>';
    }

    const attributeValue = typeof value === 'string' ? value : String(value);
    const strengthType = this.getFlowAttributeColor(attributeValue);
    const color = this.colors[strengthType as keyof typeof this.colors];

    // Scale font size based on word length
    const wordLength = attributeValue.length;
    let fontSize = '0.75rem'; // 12px default (text-xs)
    if (wordLength > 12) {
      fontSize = '0.5rem'; // 8px for very long words like COLLABORATIVE
    } else if (wordLength > 10) {
      fontSize = '0.625rem'; // 10px for long words
    }

    return `
      <div class="w-20 h-20 rounded flex items-center justify-center font-bold text-white mr-3" style="background-color: ${color};">
        <div class="relative flex items-center justify-center w-full h-full px-1">
          <span class="text-center leading-tight relative z-10" style="font-size: ${fontSize};">${attributeValue.toUpperCase()}</span>
        </div>
      </div>
    `;
  }

  /**
   * Renders multiple flow attributes as a horizontal row of colored squares
   * Uses actual user-selected attributes from their workshop data
   */
  private renderFlowAttributesRow(decl: RMLVisualDeclaration): string {
    const { attributes } = decl;

    if (!attributes || !Array.isArray(attributes)) {
      return '<div class="rml-error">Missing attributes data for flow attributes row</div>';
    }

    // Sort attributes by their order
    const sortedAttributes = [...attributes].sort((a, b) => a.order - b.order);

    // Map attribute names to colors based on strength category
    const attributeColors = sortedAttributes.map(attr => ({
      label: attr.name,
      color: this.getFlowAttributeColor(attr.name)
    }));

    // Render as horizontal row
    return `
      <div class="rml-flow-attributes-row">
        ${attributeColors.map(attr => `
          <div class="rml-flow-attr-square" style="background-color: ${this.colors[attr.color as keyof typeof this.colors]};">
            <span class="rml-flow-attr-label">${attr.label.toUpperCase()}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Renders a vision image (vision1 or vision2) from the user's future self data
   * Photo ID comes from user data's futureSelfImages array
   */
  private renderVisionImage(decl: RMLVisualDeclaration, imageNumber: number): string {
    const { photo_id } = decl;

    if (!photo_id) {
      return `<div class="rml-error">Missing photo_id for vision${imageNumber}</div>`;
    }

    const photoUrl = `/api/photos/${photo_id}`;

    return `
      <div class="rml-vision-image">
        <img
          src="${photoUrl}"
          alt="Vision ${imageNumber}"
          class="rml-vision-img"
          onerror="this.style.display='none'; this.parentElement.innerHTML='<p class=\\'rml-error\\'>Image not available</p>';"
        />
      </div>
    `;
  }

  /**
   * Renders a future self image from the user's vision board
   * Uses photo URLs from the database (/api/photos/{photoId})
   */
  private renderFutureSelfImage(decl: RMLVisualDeclaration): string {
    const { photo_id, caption } = decl;

    if (!photo_id) {
      return '<div class="rml-error">Missing photo_id for future self image</div>';
    }

    const photoUrl = `/api/photos/${photo_id}`;
    const captionText = caption || '';

    return `
      <div class="rml-future-self-image">
        <img
          src="${photoUrl}"
          alt="Future self vision"
          class="rml-future-img"
          onerror="this.style.display='none'; this.parentElement.innerHTML='<p class=\\'rml-error\\'>Image not available</p>';"
        />
        ${captionText ? `<p class="rml-future-caption">${captionText}</p>` : ''}
      </div>
    `;
  }

  /**
   * Maps flow attributes to strength colors based on AST methodology
   */
  private getFlowAttributeColor(attribute: string): string {
    const lowerAttribute = attribute.toLowerCase();

    // Green (Thinking/Strategic)
    const thinkingAttributes = [
      'analytic', 'strategic', 'insightful', 'investigative',
      'logical', 'rational', 'reflective'
    ];

    // Yellow (Structured/Organized)
    const planningAttributes = [
      'methodical', 'organized', 'precise', 'reliable',
      'thorough', 'systemic', 'diligent'
    ];

    // Red (Action/Dynamic)
    const actingAttributes = [
      'dynamic', 'energetic', 'practical', 'resilient',
      'optimistic', 'competitive', 'vigorous'
    ];

    // Blue (Feeling/People)
    const feelingAttributes = [
      'collaborative', 'empathic', 'creative', 'supportive',
      'inspiring', 'passionate', 'intuitive'
    ];

    if (thinkingAttributes.includes(lowerAttribute)) return 'thinking';
    if (planningAttributes.includes(lowerAttribute)) return 'planning';
    if (actingAttributes.includes(lowerAttribute)) return 'acting';
    if (feelingAttributes.includes(lowerAttribute)) return 'feeling';

    // Default to thinking if no match
    return 'thinking';
  }

  /**
   * Render well-being ladder - matches AST workshop SVG design
   */
  private renderLadder(decl: RMLVisualDeclaration): string {
    const { current_level, future_level } = decl;
    if (current_level === undefined) return '';

    // Calculate Y positions for dots (ladder goes from 0-10, with 10 at top)
    // Each rung is 55px apart, starting at y=80 for level 10
    const getCurrentY = (level: number) => 80 + ((10 - level) * 55);
    
    const currentY = getCurrentY(current_level);
    const futureY = future_level !== undefined ? getCurrentY(future_level) : currentY;

    // Generate ladder rungs (0-10)
    const rungs = [];
    for (let i = 10; i >= 0; i--) {
      const y = getCurrentY(i);
      rungs.push(`
        <g>
          <line x1="175" y1="${y}" x2="325" y2="${y}" stroke="#444" stroke-width="3"></line>
          <text x="160" y="${y + 5}" text-anchor="end" font-weight="bold" font-size="16">${i}</text>
        </g>
      `);
    }

    return `
      <div class="w-full xl:w-11/12 2xl:w-full">
        <svg width="100%" height="550" viewBox="0 0 500 700" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" class="mx-auto">
          <text x="250" y="30" text-anchor="middle" font-weight="bold" font-size="24">Your Well-Being Ladder</text>
          <text x="250" y="55" text-anchor="middle" font-size="14">Where are you now? Where do you want to be?</text>
          
          <!-- Ladder frame -->
          <rect x="175" y="80" width="150" height="550" fill="none" stroke="#444" stroke-width="4"></rect>
          
          <!-- Ladder rungs -->
          ${rungs.join('')}
          
          <!-- Labels -->
          <text x="335" y="90" font-size="14" font-weight="bold">Best possible life</text>
          <text x="335" y="630" font-size="14" font-weight="bold">Worst possible life</text>
          
          <!-- Current level marker -->
          <g>
            <circle cx="175" cy="${currentY}" r="12" fill="#3b82f6"></circle>
            <text x="160" y="${currentY + 35}" font-size="14" text-anchor="middle" fill="#3b82f6">Current</text>
          </g>
          
          ${future_level !== undefined && future_level !== current_level ? `
          <!-- Future level marker -->
          <g>
            <circle cx="325" cy="${futureY}" r="12" fill="#10b981"></circle>
            <text x="325" y="${futureY + 35}" font-size="14" text-anchor="middle" fill="#10b981">1 year from now</text>
          </g>
          ` : ''}
          
          <!-- Legend -->
          <g>
            <circle cx="175" cy="650" r="6" fill="#3b82f6"></circle>
            <text x="175" y="668" font-size="12" text-anchor="middle">Current</text>
          </g>
          ${future_level !== undefined ? `
          <g>
            <circle cx="325" cy="650" r="6" fill="#10b981"></circle>
            <text x="325" y="668" font-size="12" text-anchor="middle">1 year from now</text>
          </g>
          ` : ''}
        </svg>
      </div>
    `;
  }

  /**
   * Render individual thinking square
   */
  private renderThinkingSquare(decl: RMLVisualDeclaration): string {
    return `
      <div style="display: flex; justify-content: center; margin: 20px auto;">
        <div class="w-20 h-20 rounded flex items-center justify-center text-xs font-bold text-white" style="background-color: ${this.colors.thinking};">
          <div class="relative flex items-center justify-center w-full h-full">
            <span class="text-center leading-tight relative z-10">THINKING</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render individual feeling square
   */
  private renderFeelingSquare(decl: RMLVisualDeclaration): string {
    return `
      <div style="display: flex; justify-content: center; margin: 20px auto;">
        <div class="w-20 h-20 rounded flex items-center justify-center text-xs font-bold text-white" style="background-color: ${this.colors.feeling};">
          <div class="relative flex items-center justify-center w-full h-full">
            <span class="text-center leading-tight relative z-10">FEELING</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render individual acting square
   */
  private renderActingSquare(decl: RMLVisualDeclaration): string {
    return `
      <div style="display: flex; justify-content: center; margin: 20px auto;">
        <div class="w-20 h-20 rounded flex items-center justify-center text-xs font-bold text-white" style="background-color: ${this.colors.acting};">
          <div class="relative flex items-center justify-center w-full h-full">
            <span class="text-center leading-tight relative z-10">ACTING</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render individual planning square
   */
  private renderPlanningSquare(decl: RMLVisualDeclaration): string {
    return `
      <div style="display: flex; justify-content: center; margin: 20px auto;">
        <div class="w-20 h-20 rounded flex items-center justify-center text-xs font-bold text-white" style="background-color: ${this.colors.planning};">
          <div class="relative flex items-center justify-center w-full h-full">
            <span class="text-center leading-tight relative z-10">PLANNING</span>
          </div>
        </div>
      </div>
    `;
  }
  /**
   * Generate complete CSS for all RML components
   */
  generateCSS(): string {
    return `
      <style>
        /* RML Components Base Styles */
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

        .rml-starcard-image {
          text-align: center;
        }

        .rml-starcard-img {
          max-width: 400px;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          display: block;
          margin: 0 auto;
        }

        .rml-strength-squares {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
          margin: 20px auto;
          max-width: fit-content;
        }

        .rml-pie-chart {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 30px;
          margin: 20px auto;
          max-width: fit-content;
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
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 25px auto;
          width: fit-content;
        }

        /* Utility classes for the imagination circle layout */
        .relative {
          position: relative;
        }

        .absolute {
          position: absolute;
        }

        .flex {
          display: flex;
        }

        .items-center {
          align-items: center;
        }

        .justify-center {
          justify-content: center;
        }

        .w-full {
          width: 100%;
        }

        .h-full {
          height: 100%;
        }

        .w-24 {
          width: 6rem;
        }

        .h-24 {
          height: 6rem;
        }

        .w-20 {
          width: 5rem;
        }

        .h-20 {
          height: 5rem;
        }

        .w-14 {
          width: 3.5rem;
        }

        .h-14 {
          height: 3.5rem;
        }

        .rounded {
          border-radius: 0.25rem;
        }

        .rounded-full {
          border-radius: 9999px;
        }

        .text-xs {
          font-size: 0.75rem;
          line-height: 1rem;
        }

        .font-bold {
          font-weight: 700;
        }

        .text-white {
          color: rgb(255, 255, 255);
        }

        .mr-3 {
          margin-right: 0.75rem;
        }

        .opacity-30 {
          opacity: 0.3;
        }

        .text-center {
          text-align: center;
        }

        .leading-tight {
          line-height: 1.25;
        }

        .z-10 {
          z-index: 10;
        }

        .xl\:w-11\/12 {
          width: 91.666667%;
        }

        .xl\:w-full {
          width: 100%;
        }

        .mx-auto {
          margin-left: auto;
          margin-right: auto;
        }

        @media (min-width: 1280px) {
          .xl\:w-11\/12 {
            width: 91.666667%;
          }
        }

        @media (min-width: 1536px) {
          .\\32 xl\\:w-full {
            width: 100%;
          }
        }

        /* Report Introduction Styles */
        .rml-report-introduction {
          margin: 30px 0;
          padding: 30px;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .rml-report-introduction h1 {
          color: #1f2937;
          margin-bottom: 20px;
          font-size: 28px;
          font-weight: 700;
          border-bottom: 3px solid #667eea;
          padding-bottom: 10px;
        }

        .rml-report-introduction p {
          line-height: 1.8;
          color: #374151;
          margin-bottom: 18px;
          font-size: 16px;
        }

        .rml-report-introduction ul {
          margin: 20px 0;
          padding-left: 25px;
          list-style-type: none;
        }

        .rml-report-introduction ul li {
          margin-bottom: 12px;
          color: #374151;
          font-size: 16px;
          line-height: 1.6;
          position: relative;
          padding-left: 10px;
        }

        .rml-report-introduction ul li::before {
          content: "•";
          color: #667eea;
          font-weight: bold;
          position: absolute;
          left: -15px;
        }

        .rml-report-introduction strong {
          color: #1f2937;
          font-weight: 600;
        }

        /* Shapes Introduction Styles */
        .rml-shapes-introduction {
          margin: 30px 0;
          padding: 25px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 15px;
          border-left: 5px solid #667eea;
        }

        .rml-shapes-introduction h3 {
          color: #2c3e50;
          margin-bottom: 15px;
          font-size: 20px;
        }

        .rml-shapes-introduction h4 {
          color: #2c3e50;
          margin: 25px 0 15px 0;
          font-size: 16px;
        }

        .rml-shapes-introduction p {
          line-height: 1.6;
          color: #495057;
          margin-bottom: 15px;
        }

        .rml-patterns-gallery {
          display: flex;
          justify-content: center;
          margin: 20px 0;
        }

        .rml-patterns-svg {
          max-width: 100%;
          height: auto;
        }

        /* User Strength Chart Styles */
        .rml-user-strength-chart {
          display: flex;
          justify-content: center;
          margin: 20px 0;
        }

        .rml-pattern-bars {
          display: flex;
          align-items: end;
          justify-content: center;
          gap: 8px;
          height: 180px;
          padding: 20px;
        }

        .rml-strength-bar {
          width: 30px;
          border-radius: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          color: white;
          font-weight: 600;
          padding: 8px 0;
          position: relative;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .rml-strength-bar:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .rml-strength-bar.rml-thinking {
          background: linear-gradient(180deg, rgb(1, 162, 82) 0%, #018a45 100%);
        }

        .rml-strength-bar.rml-acting {
          background: linear-gradient(180deg, rgb(241, 64, 64) 0%, #d63031 100%);
        }

        .rml-strength-bar.rml-planning {
          background: linear-gradient(180deg, rgb(255, 203, 47) 0%, #f39c12 100%);
        }

        .rml-strength-bar.rml-feeling {
          background: linear-gradient(180deg, rgb(22, 126, 253) 0%, #0056b3 100%);
        }

        .rml-strength-label {
          font-size: 10px;
          font-weight: 500;
          text-align: center;
          line-height: 1;
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
          white-space: nowrap;
          margin-bottom: 8px;
        }

        /* Flow Attribute Square Styles (FIXED) */
        .rml-flow-attribute-square {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 60px;
          margin: 5px;
          border-radius: 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        }

        .rml-flow-attribute-square:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .rml-flow-attribute-square.rml-thinking {
          background: linear-gradient(135deg, rgb(1, 162, 82) 0%, #018a45 100%);
        }

        .rml-flow-attribute-square.rml-acting {
          background: linear-gradient(135deg, rgb(241, 64, 64) 0%, #d63031 100%);
        }

        .rml-flow-attribute-square.rml-planning {
          background: linear-gradient(135deg, rgb(255, 203, 47) 0%, #f39c12 100%);
        }

        .rml-flow-attribute-square.rml-feeling {
          background: linear-gradient(135deg, rgb(22, 126, 253) 0%, #0056b3 100%);
        }

        .rml-flow-attribute-text {
          color: white;
          font-weight: 600;
          font-size: 12px;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Flow Attributes Row Styles */
        .rml-flow-attributes-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 15px;
          margin: 25px 0;
          padding: 20px 0;
        }

        .rml-flow-attr-square {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 120px;
          height: 60px;
          padding: 10px 15px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        }

        .rml-flow-attr-square:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        .rml-flow-attr-label {
          color: white;
          font-weight: 700;
          font-size: 13px;
          text-align: center;
          letter-spacing: 0.5px;
        }

        .rml-error {
          padding: 15px;
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          text-align: center;
          margin: 10px 0;
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

        .rml-pattern-gallery {
          margin: 20px 0;
          text-align: center;
        }

        .rml-pattern-single {
          margin: 20px 0;
          text-align: center;
        }

        .rml-pattern-gallery svg,
        .rml-pattern-single svg {
          max-width: 100%;
          height: auto;
        }

        /* Vision Image Styles (vision1, vision2) */
        .rml-vision-image {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 25px auto;
          width: fit-content;
        }

        .rml-vision-img {
          width: 200px;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          border: 3px solid rgba(255,255,255,0.6);
          transition: all 0.3s ease;
        }

        .rml-vision-img:hover {
          transform: scale(1.02);
          box-shadow: 0 6px 25px rgba(0,0,0,0.2);
        }

        /* Future Self Image Styles */
        .rml-future-self-image {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 25px auto;
          width: fit-content;
        }

        .rml-future-img {
          width: 200px;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          border: 3px solid rgba(255,255,255,0.6);
          transition: all 0.3s ease;
        }

        .rml-future-img:hover {
          transform: scale(1.02);
          box-shadow: 0 6px 25px rgba(0,0,0,0.2);
        }

        .rml-future-caption {
          margin-top: 15px;
          font-size: 14px;
          font-style: italic;
          color: #6b7280;
          text-align: center;
          max-width: 80%;
        }

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

          .rml-pattern-bars {
            gap: 6px;
            height: 150px;
          }

          .rml-strength-bar {
            width: 25px;
            padding: 6px 0;
          }

          .rml-flow-attribute-square {
            width: 100px;
            height: 50px;
          }

          .rml-flow-attribute-text {
            font-size: 11px;
          }
        }
      </style>
    `;
  }
}

// Export singleton
export const rmlRenderer = new RMLRenderer();
