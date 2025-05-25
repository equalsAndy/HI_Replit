import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory name properly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
app.use(express.json());

// Login API endpoint - simulated version that works with the test credentials
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Use the test admin credentials we confirmed work
  if (username === 'admin' && password === 'password') {
    res.json({
      success: true,
      user: {
        id: 1,
        username: 'admin',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        organization: 'Heliotrope Imaginal',
        jobTitle: 'Administrator'
      }
    });
  } else {
    res.json({
      success: false,
      error: 'Invalid username or password'
    });
  }
});

// Serve the login.html file for all routes
app.get('*', (req, res) => {
  // Read the login.html file
  const loginHtml = fs.readFileSync(path.join(__dirname, 'login.html'), 'utf8');
  res.send(loginHtml);
});

// Start the server
const PORT = 3030;
const server = createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Heliotrope Workshop Login running on port ${PORT}`);
  console.log(`Test login with: admin / password`);
});