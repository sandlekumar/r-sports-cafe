import React from 'react';

export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-inter text-[13px] tracking-[0.1em] text-[#F7F5EF]/60 uppercase">{message}</p>
    </div>
  );
}
