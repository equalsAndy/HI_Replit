const bcrypt = require('bcryptjs');

// Test password hashing
const testPassword = 'admin123';
const hashedPassword = bcrypt.hashSync(testPassword, 12);
console.log('Generated hash for admin123:', hashedPassword);

// Test password comparison
const storedHash = '$2a$12$LQv3c1yqBWVHxkd0LQ4YCuFHrQYjDhYCQcZQyXbKzjGJ6CmvdKg3u';
const testResult = bcrypt.compareSync(testPassword, storedHash);
console.log('Password comparison result:', testResult);

// Test other common passwords
const passwords = ['admin', 'password', 'password123', 'admin123'];
passwords.forEach(pwd => {
  const result = bcrypt.compareSync(pwd, storedHash);
  console.log(`Password "${pwd}" matches:`, result);
});