#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const versionFile = path.join(__dirname, 'version.json');

// Read current version
let versionData;
try {
  versionData = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
} catch (error) {
  // Initialize if file doesn't exist
  versionData = {
    version: "2.0.0",
    buildNumber: "1",
    lastUpdated: new Date().toISOString(),
    description: "Initial version"
  };
}

// Increment build number
const currentBuildNumber = parseInt(versionData.buildNumber) || 1;
const newBuildNumber = currentBuildNumber + 1;

// Update version data
versionData.buildNumber = newBuildNumber.toString();
versionData.lastUpdated = new Date().toISOString();
versionData.description = process.argv[2] || "Frontend update";

// Write back to file
fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2));

console.log(`🚀 Version updated to v${versionData.version}.${versionData.buildNumber}`);
console.log(`📝 Description: ${versionData.description}`);

// Also update the .env file for Vite
const envFile = path.join(__dirname, '.env');
let envContent = '';
try {
  envContent = fs.readFileSync(envFile, 'utf8');
} catch (error) {
  // File doesn't exist, create new content
}

// Update or add version variables
const newEnvContent = envContent
  .split('\n')
  .filter(line => !line.startsWith('VITE_APP_VERSION=') && !line.startsWith('VITE_BUILD_NUMBER='))
  .concat([
    `VITE_APP_VERSION=${versionData.version}`,
    `VITE_BUILD_NUMBER=${versionData.buildNumber}`
  ])
  .join('\n');

fs.writeFileSync(envFile, newEnvContent);

console.log(`📄 Updated .env with VITE_APP_VERSION=${versionData.version} and VITE_BUILD_NUMBER=${versionData.buildNumber}`);
