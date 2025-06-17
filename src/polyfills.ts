// Polyfills для совместимости Solana SDK с браузером
import { Buffer } from 'buffer';

// Устанавливаем Buffer глобально
(globalThis as any).Buffer = Buffer;
(globalThis as any).global = globalThis;
(window as any).Buffer = Buffer;
(window as any).global = globalThis;

// Полифилл для process
const browserProcess = {
  env: {},
  version: '',
  platform: 'browser',
  nextTick: (fn: () => void) => setTimeout(fn, 0),
  browser: true,
};

(globalThis as any).process = browserProcess;
(window as any).process = browserProcess;

// Дополнительные полифиллы для crypto (если нужно)
if (typeof (globalThis as any).crypto === 'undefined') {
  (globalThis as any).crypto =
    (window as any).crypto || (window as any).msCrypto;
}

// Дополнительные полифиллы для Node.js streams
if (typeof (globalThis as any).setImmediate === 'undefined') {
  (globalThis as any).setImmediate = (fn: () => void) => setTimeout(fn, 0);
}

export {};
