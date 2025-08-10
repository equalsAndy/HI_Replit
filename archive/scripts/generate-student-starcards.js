#!/usr/bin/env node

/**
 * Batch StarCard Generator for Students
 * 
 * Processes all JSON files in the starcards/students folder and generates
 * StarCard PNGs for each student using the main StarCard generator.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { main as generateStarCards } from './generate-starcards.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to extract student name from filename
function extractStudentName(filename) {
  // Remove file extension and extract meaningful name
  const baseName = path.basename(filename, '.json');
  
  // Remove "student-data-" prefix and timestamp suffix
  let cleanName = baseName.replace(/^student-data-/, '');
  cleanName = cleanName.replace(/-\d+-\d+$/, ''); // Remove ID and timestamp
  
  // Convert underscores to spaces and capitalize
  cleanName = cleanName.replace(/_/g, ' ');
  return cleanName.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Main function to process all student files
async function processAllStudents() {
  console.log('🎓 Student StarCard Batch Generator');
  console.log('====================================');
  
  const studentsDir = path.join(__dirname, 'tempClaudecomms', 'starcards', 'students');
  
  if (!fs.existsSync(studentsDir)) {
    console.error('❌ Students directory not found:', studentsDir);
    process.exit(1);
  }
  
  // Get all JSON files
  const jsonFiles = fs.readdirSync(studentsDir)
    .filter(file => file.endsWith('.json'))
    .sort();
  
  console.log(`📊 Found ${jsonFiles.length} student files`);
  
  // Create output directory for student StarCards
  const outputDir = path.join(__dirname, 'tempClaudecomms', 'starcards', 'student-output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${outputDir}`);
  }
  
  let processedCount = 0;
  let successCount = 0;
  const errors = [];
  
  console.log('\\n🎨 Processing student files...');
  console.log('====================================');
  
  for (const jsonFile of jsonFiles) {
    const filePath = path.join(studentsDir, jsonFile);
    const studentName = extractStudentName(jsonFile);
    
    try {
      // Read and validate JSON
      const jsonContent = fs.readFileSync(filePath, 'utf8');
      const studentData = JSON.parse(jsonContent);
      
      // Ensure student has a name
      if (!studentData.name || studentData.name.trim() === '') {
        studentData.name = studentName;
      }
      
      // Validate required fields
      const requiredFields = ['thinking', 'acting', 'feeling', 'planning'];
      const missingFields = requiredFields.filter(field => 
        typeof studentData[field] !== 'number' || 
        studentData[field] < 0 || 
        studentData[field] > 100
      );
      
      if (missingFields.length > 0) {
        throw new Error(`Missing or invalid strength fields: ${missingFields.join(', ')}`);
      }
      
      // Create temporary file for individual processing
      const tempFile = path.join(outputDir, `temp-${Date.now()}.json`);
      fs.writeFileSync(tempFile, JSON.stringify([studentData], null, 2));
      
      console.log(`🎨 Processing: ${studentName} (${jsonFile})`);
      
      // Use the main StarCard generator
      process.argv = ['node', 'generate-starcards.js', tempFile];
      
      // Temporarily redirect console output
      const originalLog = console.log;
      const logs = [];
      console.log = (...args) => {
        logs.push(args.join(' '));
      };
      
      try {
        await generateStarCards();
        
        // Restore console
        console.log = originalLog;
        
        // Move generated file to student output directory
        const generatedFiles = fs.readdirSync(path.join(__dirname, 'tempClaudecomms', 'starcards'))
          .filter(f => f.endsWith('.png') && f.includes(studentData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')));
        
        if (generatedFiles.length > 0) {
          const oldPath = path.join(__dirname, 'tempClaudecomms', 'starcards', generatedFiles[0]);
          const newFilename = `${studentName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-starcard.png`;
          const newPath = path.join(outputDir, newFilename);
          
          if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath);
            console.log(`✅ Generated: ${newFilename}`);
            successCount++;
          }
        }
      } catch (genError) {
        console.log = originalLog;
        throw genError;
      }
      
      // Clean up temp file
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${jsonFile}: ${error.message}`);
      errors.push({ file: jsonFile, error: error.message });
    }
    
    processedCount++;
    
    // Add small delay to avoid overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Summary
  console.log('\\n📊 Batch Processing Summary');
  console.log('====================================');
  console.log(`📁 Files processed: ${processedCount}/${jsonFiles.length}`);
  console.log(`✅ StarCards generated: ${successCount}`);
  console.log(`❌ Errors: ${errors.length}`);
  console.log(`📁 Output directory: ${outputDir}`);
  
  if (errors.length > 0) {
    console.log('\\n❌ Errors encountered:');
    errors.slice(0, 10).forEach(err => {
      console.log(`   ${err.file}: ${err.error}`);
    });
    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more errors`);
    }
  }
  
  if (successCount > 0) {
    console.log('\\n📋 Generated StarCards can be found in:');
    console.log(`   ${outputDir}`);
  }
  
  console.log('\\n🎉 Batch processing completed!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  processAllStudents().catch(error => {
    console.error('❌ Batch processing failed:', error);
    process.exit(1);
  });
}

export { processAllStudents };