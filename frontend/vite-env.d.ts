// vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_TINYMCE_API_KEY: string;
    readonly VITE_API_URL: string;
    // Füge hier weitere Umgebungsvariablen hinzu, falls nötig
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }