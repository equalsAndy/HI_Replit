import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Polyfill for Node.js process in the browser to fix "require is not defined" error
window.process = window.process || { env: { NODE_ENV: "production" } };

createRoot(document.getElementById("root")!).render(<App />);
