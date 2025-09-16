
import React from 'react';

export const RCCrawlerIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <rect x="1" y="6" width="18" height="12" rx="2"></rect>
    <path d="M19 12h5"></path>
    <circle cx="5" cy="18" r="2"></circle>
    <circle cx="15" cy="18" r="2"></circle>
    <path d="M1 10h18"></path>
    <path d="M8 6V3h4v3"></path>
 </svg>
);
