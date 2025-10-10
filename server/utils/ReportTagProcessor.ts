/**
 * Complete Report Tag System Implementation
 * Replaces OpenAI tags with actual HTML content for Strengths Shapes integration
 */

export interface StrengthsData {
  thinking: number;
  acting: number;
  planning: number;
  feeling: number;
}

export interface UserData {
  strengths: StrengthsData;
}

export type StrengthPattern = 
  | 'balanced' 
  | 'one-high' 
  | 'one-low' 
  | 'two-high-two-low' 
  | 'three-high-one-low' 
  | 'three-low-one-high' 
  | 'two-middle-two-outliers' 
  | 'stair-step';

export class ReportTagProcessor {
    private patternSVG: string;

    constructor() {
        this.patternSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="200" viewBox="0 0 1200 200" style="max-width: 100%; height: auto; margin: 20px 0;">
<style>
.bar.acting   { fill: #444; }
.bar.planning { fill: #666; }
.bar.thinking { fill: #888; }
.bar.feeling  { fill: #aaa; }
.label { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; font-size: 10px; fill: #111; }
</style>
<g id="pattern-1" transform="translate(12,8)">
<rect class="bar acting" x="11.20" y="46.29" width="25.20" height="115.71" />
<rect class="bar planning" x="42.00" y="50.91" width="25.20" height="111.09" />
<rect class="bar thinking" x="72.80" y="41.66" width="25.20" height="120.34" />
<rect class="bar feeling" x="103.60" y="46.29" width="25.20" height="115.71" />
<text class="label" x="70.00" y="174" text-anchor="middle">1. Balanced</text>
</g>
<g id="pattern-2" transform="translate(160,8)">
<rect class="bar acting" x="11.20" y="23.14" width="25.20" height="138.86" />
<rect class="bar planning" x="42.00" y="60.17" width="25.20" height="101.83" />
<rect class="bar thinking" x="72.80" y="64.80" width="25.20" height="97.20" />
<rect class="bar feeling" x="103.60" y="55.54" width="25.20" height="106.46" />
<text class="label" x="70.00" y="174" text-anchor="middle">2. One High</text>
</g>
<g id="pattern-3" transform="translate(308,8)">
<rect class="bar acting" x="11.20" y="37.03" width="25.20" height="124.97" />
<rect class="bar planning" x="42.00" y="41.66" width="25.20" height="120.34" />
<rect class="bar thinking" x="72.80" y="46.29" width="25.20" height="115.71" />
<rect class="bar feeling" x="103.60" y="87.94" width="25.20" height="74.06" />
<text class="label" x="70.00" y="174" text-anchor="middle">3. One Low</text>
</g>
<g id="pattern-4" transform="translate(456,8)">
<rect class="bar acting" x="11.20" y="27.77" width="25.20" height="134.23" />
<rect class="bar planning" x="42.00" y="32.40" width="25.20" height="129.60" />
<rect class="bar thinking" x="72.80" y="78.69" width="25.20" height="83.31" />
<rect class="bar feeling" x="103.60" y="83.31" width="25.20" height="78.69" />
<text class="label" x="70.00" y="174" text-anchor="middle">4. Two High +</text>
<text class="label" x="70.00" y="186" text-anchor="middle">Two Low</text>
</g>
<g id="pattern-5" transform="translate(604,8)">
<rect class="bar acting" x="11.20" y="32.40" width="25.20" height="129.60" />
<rect class="bar planning" x="42.00" y="37.03" width="25.20" height="124.97" />
<rect class="bar thinking" x="72.80" y="41.66" width="25.20" height="120.34" />
<rect class="bar feeling" x="103.60" y="83.31" width="25.20" height="78.69" />
<text class="label" x="70.00" y="174" text-anchor="middle">5. Three High +</text>
<text class="label" x="70.00" y="186" text-anchor="middle">One Low</text>
</g>
<g id="pattern-6" transform="translate(752,8)">
<rect class="bar acting" x="11.20" y="23.14" width="25.20" height="138.86" />
<rect class="bar planning" x="42.00" y="69.43" width="25.20" height="92.57" />
<rect class="bar thinking" x="72.80" y="74.06" width="25.20" height="87.94" />
<rect class="bar feeling" x="103.60" y="78.69" width="25.20" height="83.31" />
<text class="label" x="70.00" y="174" text-anchor="middle">6. Three Low +</text>
<text class="label" x="70.00" y="186" text-anchor="middle">One High</text>
</g>
<g id="pattern-7" transform="translate(900,8)">
<rect class="bar acting" x="11.20" y="23.14" width="25.20" height="138.86" />
<rect class="bar planning" x="42.00" y="50.91" width="25.20" height="111.09" />
<rect class="bar thinking" x="72.80" y="50.91" width="25.20" height="111.09" />
<rect class="bar feeling" x="103.60" y="92.57" width="25.20" height="69.43" />
<text class="label" x="70.00" y="174" text-anchor="middle">7. Two Middle +</text>
<text class="label" x="70.00" y="186" text-anchor="middle">Two Outliers</text>
</g>
<g id="pattern-8" transform="translate(1048,8)">
<rect class="bar acting" x="11.20" y="23.14" width="25.20" height="138.86" />
<rect class="bar planning" x="42.00" y="46.29" width="25.20" height="115.71" />
<rect class="bar thinking" x="72.80" y="69.43" width="25.20" height="92.57" />
<rect class="bar feeling" x="103.60" y="92.57" width="25.20" height="69.43" />
<text class="label" x="70.00" y="174" text-anchor="middle">8. Stair-step</text>
</g>
</svg>`;
    }

    /**
     * Main processing function - replaces all tags in OpenAI content
     */
    processReportContent(openaiContent: string, userData: UserData): string {
        return openaiContent
            .replace(/<shapes_intro_content>/g, this.getShapesIntroContent())
            .replace(/<user_strength_chart>/g, this.generateUserChart(userData.strengths));
    }

    /**
     * Returns the complete shapes introduction content
     */
    getShapesIntroContent(): string {
        return `
<div class="shapes-introduction-section">
    <h2>Your Strengths Shape</h2>
    <p>Beyond percentages, your strengths create a unique <strong>shape</strong>—a visual pattern that reveals how your energy naturally flows and focuses across the four core domains.</p>
    
    <p>Your shape is not a fixed category, but rather a mirror that helps you notice which strengths tend to lead, which provide steady support, and which operate more quietly in the background. This awareness becomes a compass for understanding your natural rhythm and how you might work most effectively with others.</p>
    
    <h3>The Eight Core Patterns</h3>
    <p>Every strengths profile falls into one of eight fundamental shapes. Each has its own flow, its own gifts, and its own potential for growth through imagination:</p>
    
    ${this.patternSVG}
    
    <style>
    .shapes-introduction-section {
        margin: 30px 0;
        padding: 25px;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 15px;
        border-left: 5px solid #667eea;
    }
    
    .shapes-introduction-section h2 {
        color: #2c3e50;
        margin-bottom: 15px;
    }
    
    .shapes-introduction-section h3 {
        color: #2c3e50;
        margin: 25px 0 15px 0;
    }
    
    .shapes-introduction-section p {
        line-height: 1.6;
        color: #495057;
        margin-bottom: 15px;
    }
    </style>
</div>`;
    }

    /**
     * Generates user's personalized colorized chart
     */
    generateUserChart(strengths: StrengthsData): string {
        // Calculate heights (max 150px for proportional display)
        const maxHeight = 150;
        const maxPercentage = Math.max(...Object.values(strengths));
        
        const heights = {
            thinking: Math.round((strengths.thinking / maxPercentage) * maxHeight),
            acting: Math.round((strengths.acting / maxPercentage) * maxHeight),
            planning: Math.round((strengths.planning / maxPercentage) * maxHeight),
            feeling: Math.round((strengths.feeling / maxPercentage) * maxHeight)
        };

        return `
<div class="user-strength-chart">
    <div class="pattern-bars">
        <div class="strength-bar thinking" style="height: ${heights.thinking}px;">
            <span class="strength-label">Thinking</span>
        </div>
        <div class="strength-bar acting" style="height: ${heights.acting}px;">
            <span class="strength-label">Acting</span>
        </div>
        <div class="strength-bar planning" style="height: ${heights.planning}px;">
            <span class="strength-label">Planning</span>
        </div>
        <div class="strength-bar feeling" style="height: ${heights.feeling}px;">
            <span class="strength-label">Feeling</span>
        </div>
    </div>
</div>

<style>
.user-strength-chart {
    display: flex;
    justify-content: center;
    margin: 20px 0;
}

.pattern-bars {
    display: flex;
    align-items: end;
    justify-content: center;
    gap: 8px;
    height: 180px;
    padding: 20px;
}

.strength-bar {
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

.strength-bar:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

.strength-bar.thinking {
    background: linear-gradient(180deg, #01a252 0%, #018a45 100%);
}

.strength-bar.acting {
    background: linear-gradient(180deg, #f14040 0%, #d63031 100%);
}

.strength-bar.planning {
    background: linear-gradient(180deg, #ffcb2f 0%, #f39c12 100%);
}

.strength-bar.feeling {
    background: linear-gradient(180deg, #167efd 0%, #0056b3 100%);
}

.strength-label {
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

@media (max-width: 768px) {
    .strength-bar {
        width: 25px;
        padding: 6px 0;
    }
    
    .pattern-bars {
        gap: 6px;
    }
}
</style>`;
    }

    /**
     * Pattern detection algorithm
     */
    detectPattern(strengths: StrengthsData): StrengthPattern {
        const values = Object.values(strengths).sort((a, b) => b - a);
        const [highest, second, third, lowest] = values;
        
        const range = highest - lowest;
        const highToSecond = highest - second;
        const thirdToLowest = third - lowest;
        const secondToThird = second - third;
        
        // Pattern detection logic
        if (range <= 8) return 'balanced';
        if (highToSecond >= 12) return 'one-high';
        if (thirdToLowest >= 12) return 'one-low';
        if (secondToThird >= 8 && highToSecond <= 6) return 'two-high-two-low';
        if (thirdToLowest >= 10 && secondToThird <= 6) return 'three-high-one-low';
        if (highToSecond >= 10 && thirdToLowest <= 6) return 'three-low-one-high';
        
        // Check for stair-step pattern
        const diffs = [highToSecond, secondToThird, thirdToLowest];
        const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
        const isConsistent = diffs.every(diff => Math.abs(diff - avgDiff) <= 2);
        
        if (avgDiff >= 3 && avgDiff <= 7 && isConsistent) return 'stair-step';
        
        return 'two-middle-two-outliers';
    }

    /**
     * Get pattern description for a detected pattern
     */
    getPatternDescription(pattern: StrengthPattern): string {
        const descriptions = {
            'balanced': 'Your strengths work together in harmony, with no single domain significantly outweighing the others.',
            'one-high': 'You have one dominant strength that leads your approach to challenges and opportunities.',
            'one-low': 'Three strengths work actively while one operates more quietly in the background.',
            'two-high-two-low': 'You have two leading strengths that drive your energy, supported by two quieter domains.',
            'three-high-one-low': 'Three strengths operate actively together, with one providing subtle support.',
            'three-low-one-high': 'One strength clearly leads, while three others provide foundational support.',
            'two-middle-two-outliers': 'You have a mix of very high and very low strengths with moderate middle ground.',
            'stair-step': 'Your strengths create a graduated pattern, each building on the next in sequence.'
        };
        
        return descriptions[pattern] || 'Your strengths create a unique pattern.';
    }
}

// Export for use in report generation
export default ReportTagProcessor;
