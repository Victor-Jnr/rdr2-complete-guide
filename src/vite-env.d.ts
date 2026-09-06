/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-pwa/info" />

interface ImportMetaEnv {
  readonly VITE_TARGET: 'web' | 'android';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
