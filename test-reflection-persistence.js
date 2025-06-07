/**
 * Test script to verify reflection data persistence
 */

async function testReflectionPersistence() {
  console.log('Testing reflection data persistence...');
  
  const testData = {
    strength1: 'Test reflection for strength 1',
    strength2: 'Test reflection for strength 2', 
    strength3: 'Test reflection for strength 3',
    strength4: 'Test reflection for strength 4',
    teamValues: 'Test team values reflection',
    uniqueContribution: 'Test unique contribution reflection'
  };

  try {
    // Save reflection data
    console.log('Saving reflection data...');
    const saveResponse = await fetch('http://localhost:5001/api/workshop-data/step-by-step-reflection', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=s%3A3HHDBuEpCiUNGHDG-dV5FcEcJLcxiEdc.9QV6ZGTKLsv3yDrxEgTGCHSFBiKWZYK%2BYKrj8MdCJPM' // Admin session
      },
      body: JSON.stringify(testData)
    });
    
    const saveResult = await saveResponse.json();
    console.log('Save result:', saveResult);
    
    // Load reflection data back
    console.log('Loading reflection data...');
    const loadResponse = await fetch('http://localhost:5001/api/workshop-data/step-by-step-reflection', {
      headers: {
        'Cookie': 'connect.sid=s%3A3HHDBuEpCiUNGHDG-dV5FcEcJLcxiEdc.9QV6ZGTKLsv3yDrxEgTGCHSFBiKWZYK%2BYKrj8MdCJPM'
      }
    });
    
    const loadResult = await loadResponse.json();
    console.log('Load result:', loadResult);
    
    // Verify data matches
    if (loadResult.success && loadResult.data) {
      const matches = Object.keys(testData).every(key => 
        loadResult.data[key] === testData[key]
      );
      console.log('Data persistence test:', matches ? 'PASSED' : 'FAILED');
      if (!matches) {
        console.log('Expected:', testData);
        console.log('Actual:', loadResult.data);
      }
    } else {
      console.log('Data persistence test: FAILED - No data returned');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testReflectionPersistence();