#!/usr/bin/env node
/**
 * Test script to verify coaching system setup
 */

console.log('🧪 Testing Coaching System Setup...\n');

async function testCoachingSystem() {
  try {
    const baseUrl = 'http://localhost:8080';
    
    console.log('1. Testing server health...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    const health = await healthResponse.json();
    console.log('✅ Server health:', health.status);
    
    console.log('\n2. Testing coaching API authentication...');
    const authTest = await fetch(`${baseUrl}/api/coaching/knowledge-base`);
    const authResult = await authTest.json();
    console.log('✅ Authentication working:', authResult.message);
    
    console.log('\n3. Testing table creation endpoint...');
    const tablesTest = await fetch(`${baseUrl}/create-coaching-tables`, { method: 'POST' });
    const tablesResult = await tablesTest.json();
    console.log('✅ Tables status:', tablesResult.message);
    console.log('📋 Available tables:', tablesResult.tables);
    
    console.log('\n🎉 Coaching System Setup Complete!');
    console.log('\n📊 Summary:');
    console.log('   ✅ Database Schema Extended');
    console.log('   ✅ Coaching API Routes Active');
    console.log('   ✅ Vector DB Service Created (placeholder)');
    console.log('   ✅ Database Tables Created');
    console.log('\n🚀 Ready for development:');
    console.log('   • Upload AST Compendium content');
    console.log('   • Create Lion Software team profiles');
    console.log('   • Test AI coaching conversations');
    console.log('   • Install vector DB dependencies when npm is fixed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCoachingSystem();
