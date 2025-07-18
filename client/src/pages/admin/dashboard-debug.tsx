import React from 'react';

export default function AdminDashboard() {
  console.log('AdminDashboard component rendering...');
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard - Debug Version</h1>
      <p>This is a simple test to verify the component loads.</p>
      <div className="mt-4">
        <p>If you see this, the routing and component loading works!</p>
      </div>
    </div>
  );
}
