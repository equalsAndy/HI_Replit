import sharp from 'sharp';
import { Pool } from 'pg';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

interface StarCardData {
  thinking: number;
  acting: number;
  feeling: number;
  planning: number;
  userName: string;
  flowScore?: number;
  flowCategory?: string;
}

export class StarCardGeneratorService {
  
  /**
   * FIXED: Update or create StarCard with UPSERT logic - ONE StarCard per user
   * This method implements the "One StarCard Per User" rule by updating existing StarCards
   */
  async updateOrCreateStarCard(userId: string, userData: StarCardData): Promise<string> {
    try {
      console.log(`🔄 UPDATING StarCard for user ${userId} (UPSERT mode)`);
      
      // Generate dynamic StarCard with actual user data
      const dynamicStarCardBase64 = await this.generateStarCard(userData);
      
      // UPSERT Logic: Update existing StarCard or create new one
      const existingStarCardResult = await pool.query(`
        SELECT id FROM photos 
        WHERE user_id = $1 AND is_starcard = true 
        ORDER BY created_at DESC 
        LIMIT 1
      `, [parseInt(userId)]);
      
      if (existingStarCardResult.rows.length > 0) {
        // UPDATE existing StarCard
        const photoId = existingStarCardResult.rows[0].id;
        console.log(`📝 Updating existing StarCard (Photo ID: ${photoId}) for user ${userId}`);
        
        await pool.query(`
          UPDATE photos 
          SET base64_data = $1,
              filename = $2,
              uploaded_at = NOW(),
              updated_at = NOW()
          WHERE id = $3 AND user_id = $4
        `, [
          dynamicStarCardBase64,
          `Updated-StarCard-user-${userId}-${Date.now()}.png`,
          photoId,
          parseInt(userId)
        ]);
        
        console.log(`✅ StarCard UPDATED for user ${userId} - Photo ID: ${photoId}`);
        return dynamicStarCardBase64;
        
      } else {
        // CREATE new StarCard (first time)
        console.log(`🆕 Creating first StarCard for user ${userId}`);
        
        const { photoStorageService } = await import('./photo-storage-service.js');
        const starCardFilename = `StarCard-user-${userId}-${Date.now()}.png`;
        const photoId = await photoStorageService.storePhoto(dynamicStarCardBase64, parseInt(userId), true, starCardFilename);
        
        console.log(`✅ New StarCard created for user ${userId} with photo ID: ${photoId}`);
        return dynamicStarCardBase64;
      }
      
    } catch (error) {
      console.error('❌ StarCard update/create failed:', error);
      throw error;
    }
  }
  
  /**
   * DEPRECATED: Old method that creates new StarCards - DO NOT USE
   * Use updateOrCreateStarCard() instead to maintain "One StarCard Per User" rule
   */
  async downloadStarCardFromUI(userId: string, userData: StarCardData): Promise<string> {
    console.warn(`⚠️ DEPRECATED METHOD CALLED: downloadStarCardFromUI() creates duplicate StarCards`);
    console.warn(`🔄 Redirecting to updateOrCreateStarCard() to maintain "One StarCard Per User" rule`);
    
    return this.updateOrCreateStarCard(userId, userData);
  }
  
  /**
   * Get existing StarCard for user (for reports and display)
   */
  async getExistingStarCard(userId: string): Promise<string | null> {
    try {
      console.log(`🔍 Fetching existing StarCard for user ${userId}`);
      
      const result = await pool.query(`
        SELECT base64_data FROM photos 
        WHERE user_id = $1 AND is_starcard = true 
        ORDER BY created_at DESC 
        LIMIT 1
      `, [parseInt(userId)]);
      
      if (result.rows.length > 0) {
        console.log(`✅ Found existing StarCard for user ${userId}`);
        return result.rows[0].base64_data;
      } else {
        console.log(`❌ No StarCard found for user ${userId}`);
        return null;
      }
      
    } catch (error) {
      console.error('❌ Error fetching existing StarCard:', error);
      return null;
    }
  }
  
  /**
   * Generate a StarCard image with actual user data (unchanged - core generation logic)
   */
  async generateStarCard(data: StarCardData): Promise<string> {
    try {
      console.log(`🎨 Generating StarCard for ${data.userName} with strengths:`, {
        acting: data.acting,
        thinking: data.thinking,
        feeling: data.feeling,
        planning: data.planning
      });

      // Create SVG with actual data
      const svg = this.createStarCardSVG(data);
      
      // DEBUG: Log the first 500 characters of the SVG to verify it contains correct data
      console.log(`🔍 DEBUG: SVG starts with: ${svg.substring(0, 500)}...`);
      console.log(`🔍 DEBUG: SVG contains user name "${data.userName}": ${svg.includes(data.userName)}`);
      
      // Convert SVG to PNG using Sharp
      const pngBuffer = await sharp(Buffer.from(svg))
        .png()
        .resize(800, 1000)
        .toBuffer();
      
      // Convert to base64 data URL
      const base64 = pngBuffer.toString('base64');
      const dataUrl = `data:image/png;base64,${base64}`;
      
      console.log(`✅ StarCard generated successfully for ${data.userName}`);
      return dataUrl;
      
    } catch (error) {
      console.error('❌ StarCard generation failed:', error);
      throw error;
    }
  }

  private createStarCardSVG(data: StarCardData): string {
    // Calculate positions for the quadrants
    const centerX = 400;
    const centerY = 400;
    const radius = 150;
    
    // Color scheme
    const colors = {
      thinking: '#3B82F6', // Blue
      acting: '#EF4444',   // Red  
      feeling: '#10B981',  // Green
      planning: '#F59E0B'  // Yellow
    };
    
    // Create quadrant paths based on percentages
    const quadrants = [
      { name: 'Acting', value: data.acting, color: colors.acting, startAngle: 0 },
      { name: 'Thinking', value: data.thinking, color: colors.thinking, startAngle: 90 },
      { name: 'Feeling', value: data.feeling, color: colors.feeling, startAngle: 180 },
      { name: 'Planning', value: data.planning, color: colors.planning, startAngle: 270 }
    ];

    const quadrantPaths = quadrants.map((quad, index) => {
      const angle = (quad.value / 100) * 90; // Each quadrant is 90 degrees max
      const startAngle = quad.startAngle * Math.PI / 180;
      const endAngle = (quad.startAngle + angle) * Math.PI / 180;
      
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      return `
        <path d="M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z" 
              fill="${quad.color}" 
              opacity="0.8" 
              stroke="white" 
              stroke-width="2"/>
        <text x="${centerX + (radius * 0.7) * Math.cos((quad.startAngle + angle/2) * Math.PI / 180)}" 
              y="${centerY + (radius * 0.7) * Math.sin((quad.startAngle + angle/2) * Math.PI / 180)}" 
              text-anchor="middle" 
              fill="white" 
              font-family="Arial, sans-serif" 
              font-size="14" 
              font-weight="bold">
          ${quad.value}%
        </text>
      `;
    }).join('');

    return `
      <svg width="800" height="1000" viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="800" height="1000" fill="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"/>
        
        <!-- Header -->
        <rect x="50" y="50" width="700" height="120" rx="15" fill="rgba(255,255,255,0.95)"/>
        <text x="400" y="90" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#2D3748">
          ${data.userName}
        </text>
        <text x="400" y="120" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#4A5568">
          AllStarTeams Profile
        </text>
        <text x="400" y="145" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#718096">
          Your Unique Strengths Constellation
        </text>

        <!-- Star Card Background Circle -->
        <circle cx="${centerX}" cy="${centerY}" r="${radius + 20}" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
        
        <!-- Quadrant visualization -->
        ${quadrantPaths}
        
        <!-- Center circle -->
        <circle cx="${centerX}" cy="${centerY}" r="40" fill="rgba(255,255,255,0.95)" stroke="rgba(0,0,0,0.1)" stroke-width="2"/>
        <text x="${centerX}" y="${centerY - 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#2D3748">
          STAR
        </text>
        <text x="${centerX}" y="${centerY + 10}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#2D3748">
          CARD
        </text>

        <!-- Legend -->
        <rect x="50" y="600" width="700" height="200" rx="15" fill="rgba(255,255,255,0.95)"/>
        <text x="400" y="635" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#2D3748">
          Your Strengths Distribution
        </text>
        
        <!-- Legend items -->
        <g transform="translate(80, 660)">
          <rect x="0" y="0" width="20" height="20" fill="${colors.acting}" rx="3"/>
          <text x="30" y="15" font-family="Arial, sans-serif" font-size="16" fill="#2D3748">
            Acting: ${data.acting}% - Taking initiative and driving results
          </text>
        </g>
        
        <g transform="translate(80, 690)">
          <rect x="0" y="0" width="20" height="20" fill="${colors.thinking}" rx="3"/>
          <text x="30" y="15" font-family="Arial, sans-serif" font-size="16" fill="#2D3748">
            Thinking: ${data.thinking}% - Analysis and strategic planning
          </text>
        </g>
        
        <g transform="translate(80, 720)">
          <rect x="0" y="0" width="20" height="20" fill="${colors.feeling}" rx="3"/>
          <text x="30" y="15" font-family="Arial, sans-serif" font-size="16" fill="#2D3748">
            Feeling: ${data.feeling}% - Relationship building and empathy
          </text>
        </g>
        
        <g transform="translate(80, 750)">
          <rect x="0" y="0" width="20" height="20" fill="${colors.planning}" rx="3"/>
          <text x="30" y="15" font-family="Arial, sans-serif" font-size="16" fill="#2D3748">
            Planning: ${data.planning}% - Organization and systematic approach
          </text>
        </g>

        <!-- Flow Score (if available) -->
        ${data.flowScore ? `
        <rect x="50" y="820" width="700" height="80" rx="15" fill="rgba(255,255,255,0.95)"/>
        <text x="400" y="850" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#2D3748">
          Flow Score: ${data.flowScore}/60 - ${data.flowCategory || 'Flow Assessment'}
        </text>
        <text x="400" y="875" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#4A5568">
          Your capacity for achieving optimal performance states
        </text>
        ` : ''}

        <!-- Footer -->
        <text x="400" y="950" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="rgba(255,255,255,0.8)">
          Generated by AllStarTeams Workshop | Your unique strengths profile
        </text>
      </svg>
    `;
  }
}

export const starCardGeneratorService = new StarCardGeneratorService();