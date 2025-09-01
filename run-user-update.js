#!/usr/bin/env node

// Load environment variables first
process.loadEnvFile ? process.loadEnvFile('.env') : require('dotenv').config();

console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'Yes' : 'No');

import('./update-user1-worker.mjs');
