import express from 'express';
import { createServer } from 'http';

// Create Express app
const app = express();
app.use(express.json());

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Check admin credentials
  if (username === 'admin' && password === 'password') {
    res.json({
      success: true,
      user: {
        id: 1,
        username: 'admin',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      }
    });
  } else {
    res.json({
      success: false,
      error: 'Invalid username or password'
    });
  }
});

// Home page with login form
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Heliotrope Workshop Login</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: #f5f5f5;
          margin: 0;
        }
        .login-container {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
        }
        h1 {
          text-align: center;
          margin-bottom: 2rem;
          color: #333;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }
        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        button {
          width: 100%;
          padding: 0.75rem;
          background-color: #4a76a8;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          margin-top: 1rem;
        }
        button:hover {
          background-color: #3a5e85;
        }
        .message {
          margin-top: 1rem;
          padding: 0.75rem;
          border-radius: 4px;
          text-align: center;
        }
        .error {
          background-color: #ffebee;
          color: #c62828;
        }
        .success {
          background-color: #e8f5e9;
          color: #2e7d32;
        }
      </style>
    </head>
    <body>
      <div class="login-container">
        <h1>Heliotrope Workshop Login</h1>
        <div id="login-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" placeholder="Enter your username">
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Enter your password">
          </div>
          <button id="login-button">Login</button>
          <div id="message" class="message" style="display: none;"></div>
        </div>
      </div>

      <script>
        document.getElementById('login-button').addEventListener('click', async () => {
          const username = document.getElementById('username').value;
          const password = document.getElementById('password').value;
          const messageEl = document.getElementById('message');
          
          if (!username || !password) {
            messageEl.textContent = 'Please enter both username and password';
            messageEl.className = 'message error';
            messageEl.style.display = 'block';
            return;
          }
          
          try {
            const response = await fetch('/api/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ username, password }),
            });
            
            const data = await response.json();
            
            if (data.success) {
              messageEl.textContent = 'Login successful!';
              messageEl.className = 'message success';
              messageEl.style.display = 'block';
              
              // Display user details
              setTimeout(() => {
                document.getElementById('login-form').innerHTML = 
                  '<h2>Welcome, ' + data.user.name + '</h2>' +
                  '<div>' +
                    '<p><strong>Username:</strong> ' + data.user.username + '</p>' +
                    '<p><strong>Email:</strong> ' + data.user.email + '</p>' +
                    '<p><strong>Role:</strong> ' + data.user.role + '</p>' +
                  '</div>' +
                  '<button id="logout-button">Logout</button>';
                
                document.getElementById('logout-button').addEventListener('click', () => {
                  location.reload();
                });
              }, 1500);
            } else {
              messageEl.textContent = data.error || 'Login failed';
              messageEl.className = 'message error';
              messageEl.style.display = 'block';
            }
          } catch (error) {
            messageEl.textContent = 'An error occurred. Please try again.';
            messageEl.className = 'message error';
            messageEl.style.display = 'block';
            console.error('Login error:', error);
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Start server
const PORT = 3000;
const server = createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Login test server running on port ${PORT}`);
});