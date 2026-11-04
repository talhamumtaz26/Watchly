import React from 'react';
import Wordmark from './Wordmark';

const LoadingSpinner = ({ fullScreen = true, message = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-bg flex items-center justify-center z-50">
        <div className="text-center">
          <div className="mb-6 animate-pulse">
            <Wordmark />
          </div>
          
          {/* Spinner */}
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="w-16 h-16 border-4 border-line border-t-brand rounded-full animate-spin"></div>
            </div>
          </div>
          
          {/* Loading Text */}
          <p className="text-fg text-sm font-semibold animate-pulse">{message}</p>
        </div>
      </div>
    );
  }

  // Inline spinner for components
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-line border-t-brand rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-fg-secondary text-sm">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
