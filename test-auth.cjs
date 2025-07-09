const bcrypt = require('bcryptjs');

// Generate a new hash for admin123
const newPassword = 'admin123';
const newHash = bcrypt.hashSync(newPassword, 12);
console.log('New hash for admin123:', newHash);

// Test the new hash
const testResult = bcrypt.compareSync(newPassword, newHash);
console.log('New hash works:', testResult);