import React from 'react';

export const CsvIcon: React.FC<{ className?: string }> = ({ className }) => (
 <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <path d="M15.5 13.5h-5a1 1 0 0 1 0-2h5a1 1 0 0 1 0 2z"></path>
    <path d="M8.5 13.5h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2z"></path>
    <path d="M16 17.5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-1z"></path>
    <path d="M9.5 17.5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-1z"></path>
</svg>
);