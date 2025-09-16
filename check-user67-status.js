// Quick diagnostic script to check user 67's status
const { execSync } = require('child_process');
const sqlite3 = require('better-sqlite3');

// Assuming you have a SQLite database or similar
// You can run this with: node check-user67-status.js

async function checkUser67() {
  try {
    console.log('🔍 Checking User 67 Status...');
    
    // Check via curl to the API endpoint
    const result = execSync('curl -s http://localhost:8080/api/workshop-data/completion-status', {
      encoding: 'utf8'
    });
    
    console.log('📊 Completion Status Response:', result);
    
  } catch (error) {
    console.error('❌ Error checking status:', error.message);
  }
}

checkUser67();
