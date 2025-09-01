// TEMP: legacy button safety—remove after cleanup
(window as any).handleSaveReframe = () => {};
import { createRoot } from "react-dom/client";
import { Auth0Provider } from '@auth0/auth0-react';
import App from "./App";
import "./index.css";
import { trpc } from "./utils/trpc";
import { httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth0 } from '@auth0/auth0-react';

// Polyfill for Node.js process in the browser to fix "require is not defined" error
window.process = window.process || { env: { NODE_ENV: "production" } };

console.log("Starting React app...");

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element not found!");
    throw new Error("Root element not found");
  }
  
  console.log("Root element found, creating React root...");
  const root = createRoot(rootElement);
  console.log("React root created, setting up TRPC & React Query...");
  const queryClient = new QueryClient();
  const trpcClient = trpc.createClient({
    links: [httpBatchLink({ url: "http://localhost:8080/trpc" })],
  });
  console.log("Rendering App with TRPC provider...");
  root.render(
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN!}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID!}
      authorizationParams={{
        redirect_uri: import.meta.env.VITE_AUTH0_REDIRECT_URI!,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      }}
      onRedirectCallback={(appState) => {
        // Handle redirect after Auth0 callback
        const returnTo = appState?.returnTo || '/dashboard';
        console.log('Auth0 redirect callback, going to:', returnTo);
        window.location.replace(returnTo);
      }}
    >
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </trpc.Provider>
    </Auth0Provider>
  );
  console.log("App rendered successfully with TRPC");
} catch (error) {
  console.error("Error starting app:", error);
}
