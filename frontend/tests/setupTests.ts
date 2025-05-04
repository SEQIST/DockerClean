// tests/setupTests.ts
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import 'jest-canvas-mock';

// Füge Polyfills für TextEncoder und TextDecoder hinzu
global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;

// Mock process.stdout.isTTY
Object.defineProperty(process, 'stdout', {
  value: {
    isTTY: false, // Setze isTTY auf false, um Jest mitzuteilen, dass es nicht in einem interaktiven Terminal läuft
  },
  writable: true,
});