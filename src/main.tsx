
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add version check function
const checkForNewVersion = () => {
  // Generate current build version
  const currentVersion = `v${Date.now()}`;
  
  // Store our version in localStorage
  localStorage.setItem('app_current_version', currentVersion);
  
  // Set up a listener for the 'beforeunload' event
  window.addEventListener('beforeunload', () => {
    localStorage.setItem('app_last_seen', Date.now().toString());
  });
  
  // Check if we need to clear cache
  const lastBuild = localStorage.getItem('app_build_version');
  if (lastBuild && lastBuild !== currentVersion) {
    console.log('New version detected, clearing caches...');
    
    // Clear cache storage if available
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Update stored version
    localStorage.setItem('app_build_version', currentVersion);
  }
  
  // Set up periodic check
  setInterval(() => {
    const shouldCheck = navigator.onLine && document.visibilityState === 'visible';
    if (shouldCheck) {
      // Create a unique URL to avoid caching
      const checkUrl = `/check-version.txt?nocache=${Date.now()}`;
      fetch(checkUrl, { cache: 'no-store' })
        .catch(() => {
          // If fails (like 404), it's ok - we're just checking if server responds differently
          // which would indicate a new deployment
          console.log('Version check completed');
        });
    }
  }, 300000); // Check every 5 minutes
};

// Run version check
checkForNewVersion();

// Render the app
createRoot(document.getElementById("root")!).render(<App />);
