
import React from 'react';

export const ThreeDRenderIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M12 19V5" />
    <path d="M5 12h14" />
    <path d="m19 12-4-4" />
    <path d="m5 12 4-4" />
    <path d="m19 12 4 4" />
    <path d="m5 12-4 4" />
  </svg>
);
