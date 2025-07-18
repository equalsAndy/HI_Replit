import React from 'react';

export default function AdminDashboard() {
  console.log('🚀 MINIMAL ADMIN DASHBOARD: Component rendering started');
  console.log('🚀 Current URL:', window.location.href);
  console.log('🚀 Current pathname:', window.location.pathname);
  
  return (
    <div style={{ 
      padding: '40px', 
      backgroundColor: 'lightblue', 
      minHeight: '100vh',
      fontSize: '18px'
    }}>
      <h1 style={{ color: 'darkblue', marginBottom: '20px' }}>
        🎯 MINIMAL ADMIN DASHBOARD TEST
      </h1>
      <p>✅ If you can see this, the component is working!</p>
      <p>📍 Current URL: {window.location.href}</p>
      <p>📂 Current pathname: {window.location.pathname}</p>
      <p>⏰ Loaded at: {new Date().toLocaleTimeString()}</p>
      
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
        <h2>🔧 Debugging Information:</h2>
        <ul>
          <li>React is working: ✅</li>
          <li>Component imported: ✅</li>
          <li>Route matched: ✅</li>
          <li>No import errors: ✅</li>
        </ul>
      </div>
    </div>
  );
}
