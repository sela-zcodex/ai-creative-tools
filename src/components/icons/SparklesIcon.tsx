import React from 'react';

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="none"
  >
    <defs>
      <linearGradient id="sparkle-gradient" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stopColor="#22D3EE" />
        <stop offset="50%" stopColor="#A78BFA" />
        <stop offset="100%" stopColor="#F472B6" />
      </linearGradient>
    </defs>
    <path
      fill="url(#sparkle-gradient)"
      d="M12 4.09C11.72 9.4 9.4 11.72 4.09 12C9.4 12.28 11.72 14.6 12 19.91C12.28 14.6 14.6 12.28 19.91 12C14.6 11.72 11.72 9.4 12 4.09Z"
    />
    <path
      fill="url(#sparkle-gradient)"
      d="M5 1C4.81 3.19 3.19 3.81 1 4C3.19 4.19 4.81 5.81 5 8C5.19 5.81 6.81 4.19 9 4C6.81 3.81 5.19 3.19 5 1Z"
    />
    <path
      fill="url(#sparkle-gradient)"
      d="M19 4C18.81 6.19 17.19 6.81 15 7C17.19 7.19 18.81 8.81 19 11C19.19 8.81 20.81 7.19 23 7C20.81 6.81 19.19 6.19 19 4Z"
    />
  </svg>
);
