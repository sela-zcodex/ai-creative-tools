import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full text-center py-4 mt-8">
      <p className="text-xs text-slate-500">
        © {new Date().getFullYear()} Sela AI. All Rights Reserved.
      </p>
    </footer>
  );
};
