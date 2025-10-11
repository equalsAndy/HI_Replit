#!/usr/bin/env node

/**
 * Migration script to move existing profile pictures to the photo storage system
 * This reduces network traffic by storing photos separately and using references
 */

import { query } from './server/database.js';
import { photoStorageService } from './server/services/photo-storage-service.js';

async function migrateProfilePictures() {
  console.log('🚀 Starting photo migration to storage system...');
  
  try {
    // First, run the migration to create the photo storage tables
    console.log('📦 Creating photo storage tables...');
    
    const migrationSql = `
      -- Create photo storage table if it doesn't exist
      CREATE TABLE IF NOT EXISTS photo_storage (
          id SERIAL PRIMARY KEY,
          photo_hash VARCHAR(64) UNIQUE NOT NULL,
          photo_data TEXT NOT NULL,
          mime_type VARCHAR(50) NOT NULL DEFAULT 'image/jpeg',
          file_size INTEGER NOT NULL DEFAULT 0,
          width INTEGER,
          height INTEGER,
          uploaded_by INTEGER REFERENCES users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          is_thumbnail BOOLEAN DEFAULT FALSE,
          original_photo_id INTEGER REFERENCES photo_storage(id),
          reference_count INTEGER DEFAULT 0,
          last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Add indexes
      CREATE INDEX IF NOT EXISTS idx_photo_storage_hash ON photo_storage(photo_hash);
      CREATE INDEX IF NOT EXISTS idx_photo_storage_uploaded_by ON photo_storage(uploaded_by);
      
      -- Add photo reference column to users table
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture_id INTEGER REFERENCES photo_storage(id);
      
      -- Add photo reference column to workshop_data table  
      ALTER TABLE workshop_data ADD COLUMN IF NOT EXISTS image_photo_id INTEGER REFERENCES photo_storage(id);
    `;
    
    await query(migrationSql);
    console.log('✅ Photo storage tables created successfully');
    
    // Get all users with profile pictures (base64 data)
    console.log('🔍 Finding users with profile pictures...');
    
    const usersWithPhotos = await query(`
      SELECT id, username, name, profile_picture 
      FROM users 
      WHERE profile_picture IS NOT NULL 
      AND profile_picture LIKE 'data:image%'
      AND profile_picture_id IS NULL
    `);
    
    console.log(`📸 Found ${usersWithPhotos.rows.length} users with profile pictures to migrate`);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const user of usersWithPhotos.rows) {
      try {
        console.log(`📤 Migrating photo for user: ${user.name} (${user.username})...`);
        
        // Store the photo in the new system
        const photoId = await photoStorageService.storePhoto(
          user.profile_picture, 
          user.id, 
          true // Generate thumbnail
        );
        
        // Update user record with photo reference
        await query(`
          UPDATE users 
          SET profile_picture_id = $1 
          WHERE id = $2
        `, [photoId, user.id]);
        
        migratedCount++;
        console.log(`  ✅ Success - Photo ID: ${photoId}`);
        
      } catch (error) {
        console.error(`  ❌ Error migrating photo for user ${user.username}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('🔍 Finding workshop data with images...');
    
    // Migrate workshop data images
    const workshopDataWithImages = await query(`
      SELECT id, user_id, step_id, data 
      FROM workshop_data 
      WHERE data::text LIKE '%data:image%'
      AND image_photo_id IS NULL
    `);
    
    console.log(`📸 Found ${workshopDataWithImages.rows.length} workshop data entries with images`);
    
    for (const entry of workshopDataWithImages.rows) {
      try {
        const data = entry.data;
        
        // Check if data contains image data
        if (typeof data === 'object' && data !== null) {
          let hasImageData = false;
          let updatedData = { ...data };
          
          // Look for common image fields
          for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string' && value.startsWith('data:image')) {
              console.log(`📤 Migrating image in workshop data entry ${entry.id} for user ${entry.user_id}...`);
              
              try {
                const photoId = await photoStorageService.storePhoto(value, entry.user_id, true);
                
                // Replace image data with photo reference
                updatedData[key] = `/api/photos/${photoId}`;
                hasImageData = true;
                
                console.log(`  ✅ Success - Image field '${key}' -> Photo ID: ${photoId}`);
              } catch (error) {
                console.error(`  ❌ Error migrating image field '${key}':`, error.message);
                errorCount++;
              }
            }
          }
          
          if (hasImageData) {
            // Update the workshop data entry
            await query(`
              UPDATE workshop_data 
              SET data = $1 
              WHERE id = $2
            `, [JSON.stringify(updatedData), entry.id]);
            
            migratedCount++;
          }
        }
        
      } catch (error) {
        console.error(`  ❌ Error processing workshop data entry ${entry.id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('📊 Migration Results:');
    console.log(`  ✅ Successfully migrated: ${migratedCount} photos`);
    console.log(`  ❌ Errors encountered: ${errorCount}`);
    
    if (migratedCount > 0) {
      console.log('');
      console.log('🔧 Post-migration steps:');
      console.log('1. Test that profile pictures load correctly using photo references');
      console.log('2. Update client code to use /api/photos/{id} URLs instead of base64 data');
      console.log('3. After confirming everything works, run:');
      console.log('   UPDATE users SET profile_picture = NULL WHERE profile_picture_id IS NOT NULL;');
      console.log('   This will remove the base64 data and use only references');
    }
    
    console.log('');
    console.log('✨ Photo migration completed!');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateProfilePictures()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}