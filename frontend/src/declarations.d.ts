// Type declarations for packages without bundled types
declare module '@tailwindcss/vite' {
  import type { Plugin } from 'vite'
  export default function tailwindcss(): Plugin
}
