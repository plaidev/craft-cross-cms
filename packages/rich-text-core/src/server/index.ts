export * from '../index.js';

// Override browser-only functions with server-side implementations (happy-dom based)
export { generateHTML, generateJSON } from '@tiptap/html/server';
