import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

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
  console.log("React root created, rendering App...");
  root.render(<App />);
  console.log("App rendered successfully");
} catch (error) {
  console.error("Error starting app:", error);
}
