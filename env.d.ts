/// <reference types="vite/client" />
export {};
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: true;
      request: (...args: any[]) => Promise<void>;
      on: (...args: any[]) => void;
    };
  }
}
