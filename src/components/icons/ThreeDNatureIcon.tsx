
import React from 'react';

export const ThreeDNatureIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
    <path d="M12 17.77V22" />
    <path d="M12 2v6.26" />
    <path d="M4.26 10.73 2 9.27" />
    <path d="M19.74 10.73 22 9.27" />
  </svg>
);
