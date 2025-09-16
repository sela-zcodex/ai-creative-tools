

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { SpeakerIcon } from '../icons/SpeakerIcon';
import { PlayIcon } from '../icons/PlayIcon';

interface VoiceSelectorProps {
  voices: SpeechSynthesisVoice[];
  selectedVoiceName: string;
  onSelectVoice: (voiceName: string) => void;
  suggestedVoiceName?: string;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ voices, selectedVoiceName, onSelectVoice, suggestedVoiceName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const selectRef = useRef<HTMLDivElement>(null);
  const selectedVoice = voices.find(v => v.name === selectedVoiceName);

  const handleSelect = (voiceName: string) => {
    onSelectVoice(voiceName);
    setIsOpen(false);
  };

  const handlePreview = (e: React.MouseEvent, voice: SpeechSynthesisVoice) => {
    e.stopPropagation();
    if (currentlyPlaying === voice.name) {
      window.speechSynthesis.cancel();
      setCurrentlyPlaying(null);
      return;
    }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`Hello, this is ${voice.name}.`);
    utterance.voice = voice;
    utterance.onend = () => setCurrentlyPlaying(null);
    utterance.onerror = () => setCurrentlyPlaying(null);
    window.speechSynthesis.speak(utterance);
    setCurrentlyPlaying(voice.name);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setCurrentlyPlaying(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
       window.speechSynthesis.cancel();
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
        <span className="flex items-center truncate">
            <SpeakerIcon className="w-5 h-5 mr-2.5 text-slate-400" />
            <span className="truncate">{selectedVoice ? selectedVoice.name : 'Select a voice'}</span>
             {!selectedVoice?.localService && (
                <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold text-purple-300 bg-purple-500/20 rounded-full">
                    HD
                </span>
            )}
        </span>
        <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <ul
          className="absolute z-10 bottom-full mb-2 w-full bg-[#1c1c22] border border-white/10 shadow-lg rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-y-auto"
          role="listbox"
        >
          {voices.map((voice) => (
            <li
              key={voice.name}
              className={`text-slate-200 cursor-pointer select-none relative py-2 pl-3 pr-4 group transition-colors duration-150 ${suggestedVoiceName === voice.name ? 'bg-purple-500/10' : 'hover:bg-purple-500/10'}`}
              role="option"
              aria-selected={voice.name === selectedVoiceName}
              onClick={() => handleSelect(voice.name)}
            >
              <div className="flex items-center justify-between">
                <div className="truncate flex items-center">
                    <div className="truncate">
                        <span className={`block truncate font-medium ${voice.name === selectedVoiceName ? 'font-semibold text-purple-300' : ''}`}>
                            {voice.name}
                        </span>
                        <span className="text-xs text-slate-400">{voice.lang}</span>
                    </div>
                     {!voice.localService && (
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold text-purple-300 bg-purple-500/20 rounded-full">
                            HD
                        </span>
                    )}
                </div>
                <button 
                    onClick={(e) => handlePreview(e, voice)}
                    className="p-2 ml-2 rounded-full bg-slate-700/50 group-hover:bg-purple-500/20 text-slate-300 hover:text-white"
                    aria-label={`Preview voice ${voice.name}`}
                >
                   <PlayIcon className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};