import React from 'react';

export default function ErrorState({ message = 'An error occurred', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 mb-4 text-[#8B2500]">
        <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="font-oswald font-medium text-[20px] text-[#F7F5EF] mb-2 uppercase">{message}</h3>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 px-6 py-2 border border-[#F7F5EF]/20 rounded-full font-inter text-[11px] font-bold tracking-[0.1em] text-[#F7F5EF] uppercase hover:bg-[#F7F5EF]/5 transition-colors">
          Retry
        </button>
      )}
    </div>
  );
}
