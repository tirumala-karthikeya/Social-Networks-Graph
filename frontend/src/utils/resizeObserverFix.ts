// Utility to suppress ResizeObserver loop errors
// This is a common issue with React Flow and other libraries that use ResizeObserver

export const suppressResizeObserverErrors = () => {
  // Store original console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;

  // Override console methods to filter ResizeObserver errors
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    if (message.includes('ResizeObserver loop completed with undelivered notifications')) {
      return; // Suppress this specific error
    }
    originalConsoleError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    if (message.includes('ResizeObserver loop completed with undelivered notifications')) {
      return; // Suppress this specific warning
    }
    originalConsoleWarn.apply(console, args);
  };

  console.log = (...args: any[]) => {
    const message = args.join(' ');
    if (message.includes('ResizeObserver loop completed with undelivered notifications')) {
      return; // Suppress this specific log
    }
    originalConsoleLog.apply(console, args);
  };

  // Enhanced error event handler with more comprehensive error catching
  const handleError = (e: ErrorEvent) => {
    const errorMessage = e.message || e.error?.message || '';
    if (errorMessage.includes('ResizeObserver loop completed with undelivered notifications') ||
        errorMessage.includes('ResizeObserver loop limit exceeded') ||
        errorMessage.includes('ResizeObserver')) {
      e.stopImmediatePropagation();
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  // Enhanced unhandled rejection handler
  const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
    const reason = e.reason?.message || e.reason || '';
    if (typeof reason === 'string' && (
        reason.includes('ResizeObserver loop completed with undelivered notifications') ||
        reason.includes('ResizeObserver loop limit exceeded') ||
        reason.includes('ResizeObserver'))) {
      e.preventDefault();
      return false;
    }
  };

  // Add event listeners with capture phase
  window.addEventListener('error', handleError, true);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);

  // Return cleanup function
  return () => {
    window.removeEventListener('error', handleError, true);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.log = originalConsoleLog;
  };
};

// Initialize the fix
export const initResizeObserverFix = () => {
  return suppressResizeObserverErrors();
};