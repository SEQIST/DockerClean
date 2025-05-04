// tests/setupEnv.js
global.process = global.process || {};
global.process.env = global.process.env || {};
process.env.VITE_TINYMCE_API_KEY = 'mock-tinymce-api-key';

if (!process.stdout) {
  Object.defineProperty(process, 'stdout', {
    value: {
      isTTY: false,
    },
    writable: true,
  });
}