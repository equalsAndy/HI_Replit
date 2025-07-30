import sharp from 'sharp';

interface PieChartData {
  thinking: number;
  acting: number;
  feeling: number;
  planning: number;
  title?: string;
}

export class PieChartGeneratorService {
  
  /**
   * Generate a pie chart image with strengths data
   */
  async generatePieChart(data: PieChartData): Promise<string> {
    try {
      console.log(`📊 Generating pie chart with data:`, data);

      // Create SVG pie chart
      const svg = this.createPieChartSVG(data);
      
      // Convert SVG to PNG using Sharp
      const pngBuffer = await sharp(Buffer.from(svg))
        .png()
        .resize(600, 400)
        .toBuffer();
      
      // Convert to base64 data URL
      const base64 = pngBuffer.toString('base64');
      const dataUrl = `data:image/png;base64,${base64}`;
      
      console.log(`✅ Pie chart generated successfully`);
      return dataUrl;
      
    } catch (error) {
      console.error('❌ Pie chart generation failed:', error);
      throw error;
    }
  }

  private createPieChartSVG(data: PieChartData): string {
    const centerX = 300;
    const centerY = 200;
    const radius = 120;
    
    // Color scheme matching StarCard
    const colors = {
      thinking: '#3B82F6', // Blue
      acting: '#EF4444',   // Red  
      feeling: '#10B981',  // Green
      planning: '#F59E0B'  // Yellow
    };
    
    // Calculate angles for each segment
    const total = data.thinking + data.acting + data.feeling + data.planning;
    const segments = [
      { name: 'Acting', value: data.acting, color: colors.acting },
      { name: 'Thinking', value: data.thinking, color: colors.thinking },
      { name: 'Feeling', value: data.feeling, color: colors.feeling },
      { name: 'Planning', value: data.planning, color: colors.planning }
    ];
    
    let currentAngle = -90; // Start at top
    const paths = segments.map(segment => {
      const percentage = (segment.value / total) * 100;
      const angle = (segment.value / total) * 360;
      const startAngle = currentAngle * Math.PI / 180;
      const endAngle = (currentAngle + angle) * Math.PI / 180;
      
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      // Calculate label position
      const labelAngle = (currentAngle + angle / 2) * Math.PI / 180;
      const labelX = centerX + (radius + 40) * Math.cos(labelAngle);
      const labelY = centerY + (radius + 40) * Math.sin(labelAngle);
      
      currentAngle += angle;
      
      return `
        <path d="M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z" 
              fill="${segment.color}" 
              stroke="white" 
              stroke-width="2"/>
        <text x="${labelX}" y="${labelY}" 
              text-anchor="middle" 
              dominant-baseline="middle"
              font-family="Arial, sans-serif" 
              font-size="14" 
              font-weight="bold" 
              fill="#2D3748">
          ${segment.name}
        </text>
        <text x="${labelX}" y="${labelY + 16}" 
              text-anchor="middle" 
              dominant-baseline="middle"
              font-family="Arial, sans-serif" 
              font-size="12" 
              fill="#4A5568">
          ${segment.value}%
        </text>
      `;
    }).join('');

    return `
      <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="600" height="400" fill="white"/>
        
        <!-- Title -->
        <text x="300" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#2D3748">
          ${data.title || 'Strengths Distribution'}
        </text>
        
        <!-- Pie chart -->
        ${paths}
        
        <!-- Legend -->
        <g transform="translate(50, 50)">
          <rect x="0" y="0" width="15" height="15" fill="${colors.acting}" rx="2"/>
          <text x="20" y="12" font-family="Arial, sans-serif" font-size="12" fill="#2D3748">
            Acting: ${data.acting}%
          </text>
        </g>
        
        <g transform="translate(50, 75)">
          <rect x="0" y="0" width="15" height="15" fill="${colors.thinking}" rx="2"/>
          <text x="20" y="12" font-family="Arial, sans-serif" font-size="12" fill="#2D3748">
            Thinking: ${data.thinking}%
          </text>
        </g>
        
        <g transform="translate(50, 100)">
          <rect x="0" y="0" width="15" height="15" fill="${colors.feeling}" rx="2"/>
          <text x="20" y="12" font-family="Arial, sans-serif" font-size="12" fill="#2D3748">
            Feeling: ${data.feeling}%
          </text>
        </g>
        
        <g transform="translate(50, 125)">
          <rect x="0" y="0" width="15" height="15" fill="${colors.planning}" rx="2"/>
          <text x="20" y="12" font-family="Arial, sans-serif" font-size="12" fill="#2D3748">
            Planning: ${data.planning}%
          </text>
        </g>
      </svg>
    `;
  }
}

export const pieChartGeneratorService = new PieChartGeneratorService();