'use client';

// Development console error filter
// This suppresses known Next.js development console errors that don't affect functionality

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args) => {
    const message = args.join(' ');
    
    // Suppress known Next.js development errors
    if (
      message.includes('node_modules_next_dist_client') ||
      message.includes('createConsoleError') ||
      message.includes('handleConsoleError') ||
      message.includes('_next/static/chunks') ||
      message.includes('chunk') && message.includes('.js')
    ) {
      return; // Suppress these specific errors
    }
    
    originalError.apply(console, args);
  };

  console.warn = (...args) => {
    const message = args.join(' ');
    
    // Suppress Next.js hydration warnings in development
    if (
      message.includes('Extra attributes from the server') ||
      message.includes('Hydration') ||
      message.includes('useLayoutEffect')
    ) {
      return; // Suppress these warnings
    }
    
    originalWarn.apply(console, args);
  };
}

export {};
