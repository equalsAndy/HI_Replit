import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function reduceImageResolution() {
  try {
    const inputPath = 'attached_assets/image_1749676683678.png';
    const outputPath = 'attached_assets/hokusai_old_man_optimized.png';
    
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      console.error('Input file does not exist:', inputPath);
      return;
    }
    
    // Get original image info
    const metadata = await sharp(inputPath).metadata();
    console.log('Original image:', metadata.width + 'x' + metadata.height, 'pixels');
    
    // Reduce resolution to max 800px width while maintaining aspect ratio
    await sharp(inputPath)
      .resize(800, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .png({ quality: 80 })
      .toFile(outputPath);
    
    // Get new image info
    const newMetadata = await sharp(outputPath).metadata();
    console.log('Optimized image:', newMetadata.width + 'x' + newMetadata.height, 'pixels');
    console.log('Image saved to:', outputPath);
    
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

reduceImageResolution();