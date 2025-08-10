#!/usr/bin/env node

/**
 * Convert student JSON files to StarCard format and generate all StarCards
 */

import fs from 'fs';
import path from 'path';

// Convert student data format to StarCard format
function convertStudentData(studentData) {
  return {
    name: studentData.name || studentData.username || 'Student',
    organization: 'DirectED',
    thinking: studentData.strengths?.thinking || 25,
    acting: studentData.strengths?.acting || 25,
    feeling: studentData.strengths?.feeling || 25, 
    planning: studentData.strengths?.planning || 25,
    flowAttributes: studentData.flowAttributes?.attributes?.map(attr => attr.name) || [],
    flowScore: studentData.flowScore || 42
  };
}

async function processAllStudents() {
  console.log('🎓 Processing All Student StarCards');
  console.log('====================================');
  
  const studentsDir = path.join(process.cwd(), 'tempClaudecomms', 'starcards', 'students');
  
  if (!fs.existsSync(studentsDir)) {
    console.error('❌ Students directory not found:', studentsDir);
    process.exit(1);
  }
  
  // Get all JSON files
  const jsonFiles = fs.readdirSync(studentsDir)
    .filter(file => file.endsWith('.json'))
    .sort();
  
  console.log(`📊 Found ${jsonFiles.length} student files`);
  
  const convertedStudents = [];
  let successCount = 0;
  let errorCount = 0;
  
  // Process each student file
  for (const jsonFile of jsonFiles) {
    try {
      const filePath = path.join(studentsDir, jsonFile);
      const rawData = fs.readFileSync(filePath, 'utf8');
      const studentData = JSON.parse(rawData);
      
      const converted = convertStudentData(studentData);
      convertedStudents.push(converted);
      successCount++;
      
      console.log(`✅ Converted: ${converted.name}`);
      
    } catch (error) {
      console.error(`❌ Error processing ${jsonFile}: ${error.message}`);
      errorCount++;
    }
  }
  
  // Write combined file for StarCard generation
  const outputFile = path.join(process.cwd(), 'all-students-starcard-data.json');
  fs.writeFileSync(outputFile, JSON.stringify(convertedStudents, null, 2));
  
  console.log(`\\n📊 Conversion Summary:`);
  console.log(`✅ Successfully converted: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📁 Combined file created: ${outputFile}`);
  
  return outputFile;
}

// Run the conversion and generation
async function main() {
  try {
    const outputFile = await processAllStudents();
    
    console.log('\\n🎨 Now generating StarCards...');
    console.log('====================================');
    
    // Import and run the StarCard generator
    const { main: generateStarCards } = await import('./generate-starcards.js');
    
    // Set up the arguments for the generator
    process.argv = ['node', 'generate-starcards.js', outputFile];
    
    await generateStarCards();
    
  } catch (error) {
    console.error('❌ Process failed:', error.message);
    process.exit(1);
  }
}

main();