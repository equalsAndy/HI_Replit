/**
 * Get Barney's raw workshop data from the database
 */

import pg from 'pg';
const { Pool } = pg;

// Set SSL environment
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require',
  ssl: false
});

async function getBarneyData() {
  try {
    console.log('🔍 Fetching Barney\'s workshop data from database...');
    
    // Get user info
    const userResult = await pool.query('SELECT * FROM users WHERE id = 1');
    console.log('👤 User:', userResult.rows[0]);
    
    // Check all users with actual assessment data
    const allAssessments = await pool.query(`
      SELECT user_id, acting, thinking, feeling, planning, flow_score, top_attributes
      FROM user_assessments 
      WHERE acting IS NOT NULL AND thinking IS NOT NULL 
      ORDER BY user_id
    `);
    console.log('\n📊 Users with actual assessment data:');
    allAssessments.rows.forEach(row => {
      console.log(`User ${row.user_id}: Acting=${row.acting}%, Thinking=${row.thinking}%, Feeling=${row.feeling}%, Planning=${row.planning}%, Flow=${row.flow_score}`);
    });
    
    // Get assessment data  
    const assessmentResult = await pool.query(`
      SELECT * 
      FROM user_assessments 
      WHERE user_id = 1 
      ORDER BY id
    `);
    
    console.log(`📊 Found ${assessmentResult.rows.length} assessment records`);
    
    // Get workshop step data
    const stepResult = await pool.query(`
      SELECT *
      FROM workshop_step_data 
      WHERE user_id = 1 
      ORDER BY id
    `);
    
    console.log(`📝 Found ${stepResult.rows.length} step response records`);
    
    // Format the data like Samantha's
    let barneyData = `# Barney (User ID 1) - AST Workshop Responses
## Complete Assessment and Reflection Data

**Participant Profile:**
- **Name**: ${userResult.rows[0]?.name || 'System Administrator'}
- **Username**: ${userResult.rows[0]?.username || 'admin'}
- **Email**: ${userResult.rows[0]?.email || 'admin@heliotropeimaginal.com'}
- **Role**: ${userResult.rows[0]?.role || 'admin'}
- **Organization**: ${userResult.rows[0]?.organization || 'Heliotrope Imaginal Workshops'}
- **Job Title**: ${userResult.rows[0]?.job_title || 'System Administrator'}

---

## Assessment Data:

`;

    // Add assessment data
    for (const row of assessmentResult.rows) {
      barneyData += `### Assessment Record ${row.id}
**User ID**: ${row.user_id}
**Workshop Type**: ${row.workshop_type}
**Acting**: ${row.acting}%
**Thinking**: ${row.thinking}%
**Feeling**: ${row.feeling}%
**Planning**: ${row.planning}%
**Flow Score**: ${row.flow_score}
**Flow Category**: ${row.flow_category}
**Top Attributes**: ${row.top_attributes}
**Current Well-being**: ${row.current_wellbeing}
**Future Well-being**: ${row.future_wellbeing}
**Created**: ${row.created_at}

`;
    }

    barneyData += `
---

## Workshop Step Responses:

`;

    // Add step response data
    for (const row of stepResult.rows) {
      barneyData += `### Step Response ${row.id}
**User ID**: ${row.user_id}
**Workshop Type**: ${row.workshop_type}
**Step**: ${row.step}
**Response Data**: ${JSON.stringify(row.response_data, null, 2)}
**Created**: ${row.created_at}

`;
    }

    // Save to file
    const fs = await import('fs/promises');
    await fs.writeFile('/Users/bradtopliff/Desktop/HI_Replit/tempClaudecomms/barney-workshop-data.md', barneyData);
    
    console.log('💾 Barney\'s data saved to tempClaudecomms/barney-workshop-data.md');
    console.log('\n📄 First 1000 characters:');
    console.log('========================');
    console.log(barneyData.substring(0, 1000) + '...');
    
  } catch (error) {
    console.error('❌ Error fetching data:', error);
  } finally {
    await pool.end();
  }
}

getBarneyData();