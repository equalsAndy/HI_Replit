/**
 * Script to retrieve StarCard for a specific user and save to tempcomms
 */

import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function getUserStarCard(userId) {
  try {
    console.log(`🔍 Looking for StarCard for user ID: ${userId}`);
    
    // Get user info first
    const userResult = await pool.query(
      'SELECT id, name, username FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      console.log(`❌ User ${userId} not found`);
      return null;
    }
    
    const user = userResult.rows[0];
    console.log(`👤 Found user: ${user.name || user.username} (ID: ${user.id})`);
    
    // Look for the most recent StarCard photo uploaded by this user
    const photoResult = await pool.query(`
      SELECT id, photo_data, photo_hash, mime_type, file_size, width, height, created_at
      FROM photo_storage 
      WHERE uploaded_by = $1 
      AND is_thumbnail = false
      ORDER BY created_at DESC 
      LIMIT 1
    `, [userId]);

    if (photoResult.rows.length === 0) {
      console.log(`❌ No StarCard found for user ${userId} (${user.name || user.username})`);
      return null;
    }

    const photo = photoResult.rows[0];
    console.log(`📸 Found StarCard:`, {
      id: photo.id,
      size: `${photo.file_size} bytes`,
      dimensions: `${photo.width}x${photo.height}`,
      type: photo.mime_type,
      created: photo.created_at,
      hash: photo.photo_hash.substring(0, 8) + '...'
    });

    // Create tempcomms directory if it doesn't exist
    const tempCommsDir = path.join(__dirname, 'tempClaudecomms');
    await fs.mkdir(tempCommsDir, { recursive: true });

    // Extract base64 data and write to file
    const base64Data = photo.photo_data.includes(',') 
      ? photo.photo_data.split(',')[1] 
      : photo.photo_data;
      
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Create filename
    const extension = photo.mime_type.split('/')[1] || 'png';
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
    const filename = `user-${userId}-${user.name || user.username}-starcard-${timestamp}.${extension}`;
    const filePath = path.join(tempCommsDir, filename);
    
    // Write file
    await fs.writeFile(filePath, buffer);
    
    console.log(`✅ StarCard saved to: ${filename}`);
    console.log(`📁 Full path: ${filePath}`);
    
    return {
      user: user,
      photo: photo,
      filePath: filePath,
      filename: filename
    };
    
  } catch (error) {
    console.error('❌ Error retrieving StarCard:', error);
    throw error;
  }
}

// Main execution
async function main() {
  const userId = process.argv[2] || '12'; // Default to user 12 if not specified
  
  try {
    const result = await getUserStarCard(parseInt(userId));
    
    if (result) {
      console.log('\n🎯 SUCCESS: StarCard retrieved and saved to tempcomms');
      console.log(`User: ${result.user.name || result.user.username} (ID: ${result.user.id})`);
      console.log(`File: ${result.filename}`);
    } else {
      console.log('\n❌ No StarCard found for this user');
    }
    
  } catch (error) {
    console.error('\n❌ Failed to retrieve StarCard:', error.message);
  } finally {
    await pool.end();
  }
}

// Handle command line execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { getUserStarCard };