export * from '../index.js';

// Override browser-only functions with server-side implementations (happy-dom based)
export { generateJSON, generateHTML } from '@tiptap/html/server';
