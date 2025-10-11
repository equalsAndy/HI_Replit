// Quick test to check if admin dashboard is accessible
console.log('Testing admin dashboard route...');

// Navigate to admin route
window.location.href = '/admin';

// Check if component loads
setTimeout(() => {
  const body = document.body;
  console.log('Current page content:', body.innerHTML.substring(0, 200));
  
  // Look for our test content
  if (body.innerHTML.includes('ADMIN DASHBOARD TEST')) {
    console.log('✅ Admin dashboard component is working!');
  } else {
    console.log('❌ Admin dashboard component not found');
    console.log('Current route:', window.location.pathname);
    console.log('Page title:', document.title);
  }
}, 1000);
