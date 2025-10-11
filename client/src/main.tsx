// TEMP: legacy button safety—remove after cleanup
(window as any).handleSaveReframe = () => {};
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { TRPCProvider } from '@/components/providers/TRPCProvider';
import HIAuth0Provider from './providers/Auth0Provider';
import { observeLongTasks } from '@/instrument/longTasks';

// Polyfill for Node.js process in the browser to fix "require is not defined" error
window.process = window.process || { env: { NODE_ENV: "production" } };

// Performance marks for startup
performance.mark('app-start');

// Auth0 Configuration
const domain = import.meta.env.VITE_AUTH0_DOMAIN!;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID!;
const redirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI || `${window.location.origin}/auth/callback`;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE; // optional

console.log("Starting React app with Auth0...");
  observeLongTasks();
console.log("Auth0 Config:", { domain, clientId, redirectUri, audience });

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element not found!");
    throw new Error("Root element not found");
  }
  
  console.log("Root element found, creating React root...");
  const root = createRoot(rootElement);
  console.log("React root created, setting up Auth0, TRPC & React Query...");
  console.log("Rendering App with Auth0 and TRPC providers...");
  root.render(
    <React.StrictMode>
      <HIAuth0Provider>
        <TRPCProvider>
          <App />
        </TRPCProvider>
      </HIAuth0Provider>
    </React.StrictMode>
    );
  // mark mount completion and measure startup time
  performance.mark('main-mounted');
  performance.measure('app-mount', 'app-start', 'main-mounted');
  console.log('Startup performance:', performance.getEntriesByName('app-mount'));
} catch (error) {
  console.error("Error starting app:", error);
}
