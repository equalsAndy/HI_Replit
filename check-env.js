#!/usr/bin/env node

// Test script to validate environment setup
console.log('🔍 Environment Variable Check\n');

const required = ['DATABASE_URL', 'SESSION_SECRET'];
const optional = ['NODE_ENV', 'PORT', 'ENVIRONMENT'];

console.log('Required Variables:');
required.forEach(key => {
  const value = process.env[key];
  const status = value ? '✅' : '❌';
  const display = value ? '***SET***' : 'NOT SET';
  console.log(`  ${status} ${key}: ${display}`);
});

console.log('\nOptional Variables:');
optional.forEach(key => {
  const value = process.env[key];
  const status = value ? '✅' : '⚪';
  const display = value || 'not set';
  console.log(`  ${status} ${key}: ${display}`);
});

const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.log(`\n❌ Missing required variables: ${missing.join(', ')}`);
  console.log('\n📋 To fix:');
  console.log('1. Copy .env.example to .env');
  console.log('2. Fill in your DATABASE_URL and SESSION_SECRET');
  console.log('3. Or use Replit Secrets tab if running on Replit');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are set!');
  console.log('🚀 Ready to start the application');
}