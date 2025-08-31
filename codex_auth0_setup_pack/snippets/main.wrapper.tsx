import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";

const domain = import.meta.env.VITE_AUTH0_DOMAIN!;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID!;
const redirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE; // optional

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        ...(audience ? { audience } : {}),
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);
