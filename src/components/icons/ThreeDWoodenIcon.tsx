
import React from 'react';

export const ThreeDWoodenIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M12 22V2" />
    <path d="M20 12H4" />
    <path d="M20 20 4 4" />
    <path d="M20 4 4 20" />
  </svg>
);
