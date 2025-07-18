import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Admin Console
          </h1>
          <p className="text-sm text-muted-foreground">
            Simple admin dashboard test
          </p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>
        <p>This is a test admin dashboard to verify routing is working.</p>
        
        <div className="mt-4 space-y-2">
          <p><strong>Status:</strong> Admin dashboard is loading correctly</p>
          <p><strong>Authentication:</strong> Working</p>
          <p><strong>Route:</strong> /admin</p>
        </div>
        
        <div className="mt-6">
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => window.location.href = '/'}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
