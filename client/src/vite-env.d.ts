/// <reference types="vite/client" />

// Define global types to avoid "require is not defined" error
declare global {
  interface Window {
    process: {
      env: {
        NODE_ENV: string;
      };
    };
  }
}

// Fix for CommonJS/require issues in the browser
declare module "tailwindcss-animate" {
  const plugin: any;
  export default plugin;
}

declare module "@tailwindcss/typography" {
  const plugin: any;
  export default plugin;
}

declare module "@tailwindcss/aspect-ratio" {
  const plugin: any;
  export default plugin;
}

interface ImportMetaEnv {
  readonly VITE_UNSPLASH_ACCESS_KEY: string;
  readonly VITE_PEXELS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}