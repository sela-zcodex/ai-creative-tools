import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';

interface CustomSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={selectRef}>
      <button
        type="button"
        className="w-full bg-[#101013] border border-white/10 rounded-lg shadow-sm py-2 px-3 text-left text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-colors flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{value}</span>
        <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <ul
          className="absolute z-10 mt-1 w-full bg-[#1c1c22] border border-white/10 shadow-lg rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="listbox"
        >
          {options.map((option) => (
            <li
              key={option}
              className="text-slate-200 cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-purple-500/10"
              role="option"
              aria-selected={option === value}
              onClick={() => handleSelect(option)}
            >
              <span className={`block truncate ${option === value ? 'font-semibold' : 'font-normal'}`}>
                {option}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
