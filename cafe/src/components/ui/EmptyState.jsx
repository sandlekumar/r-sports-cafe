import React from 'react';

export default function EmptyState({ message = 'No data available', subtext }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
      <div className="w-12 h-12 mb-4 text-[#F7F5EF]">
        <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      </div>
      <h3 className="font-inter text-[13px] tracking-[0.1em] text-[#F7F5EF] uppercase">{message}</h3>
      {subtext && <p className="mt-2 font-inter text-[11px] text-[#F7F5EF]/50">{subtext}</p>}
    </div>
  );
}
