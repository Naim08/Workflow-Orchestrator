// components/AsyncErrorBoundary.tsx
import React, { useState, useEffect, ReactNode } from 'react';

interface AsyncErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, retry: () => void) => ReactNode);
}

const AsyncErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({ 
  children, 
  fallback 
}) => {
  const [error, setError] = useState<Error | null>(null);
  
  // Set up a global error handler for unhandled promise rejections
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error);
      setError(event.error);
      // Prevent the default error handling
      event.preventDefault();
    };
    
    window.addEventListener('error', handleError);
    
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      setError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
      // Prevent the default error handling
      event.preventDefault();
    });
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError as any);
    };
  }, []);
  
  // Function to retry
  const retry = () => {
    setError(null);
  };
  
  if (error) {
    if (typeof fallback === 'function') {
      return <>{fallback(error, retry)}</>;
    }
    
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Default fallback UI
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
        <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
        <p className="mb-4">An unexpected error occurred in the application.</p>
        <details className="bg-white p-2 rounded-md">
          <summary className="cursor-pointer">Error details</summary>
          <pre className="mt-2 text-xs overflow-auto p-2 bg-gray-100 rounded">
            {error.toString()}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
        <button
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          onClick={retry}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default AsyncErrorBoundary;