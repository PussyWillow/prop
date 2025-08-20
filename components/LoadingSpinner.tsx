
import React from 'react';

const LoadingSpinner = ({ text }: { text: string }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-12 h-12 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-amber-700 font-serif italic">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
