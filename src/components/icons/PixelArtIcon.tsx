
import React from 'react';

export const PixelArtIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M4 4h4v4H4z" />
    <path d="M10 4h4v4h-4z" />
    <path d="M16 4h4v4h-4z" />
    <path d="M4 10h4v4H4z" />
    <path d="M10 10h4v4h-4z" />
    <path d="M16 10h4v4h-4z" />
    <path d="M4 16h4v4H4z" />
    <path d="M10 16h4v4h-4z" />
    <path d="M16 16h4v4h-4z" />
  </svg>
);
