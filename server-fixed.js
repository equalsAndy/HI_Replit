const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  console.log('Health check hit');
  res.json({
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.send('<h1>Hello from AWS Lightsail!</h1><p>Server is running</p>');
});

const port = 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Minimal server started on port ${port}`);
  console.log(`❤️ Health check: http://0.0.0.0:${port}/health`);
});
