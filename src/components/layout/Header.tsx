



import React from 'react';
import { GeneratorMode } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { SettingsIcon } from '../icons/SettingsIcon';

interface HeaderProps {
    mode: GeneratorMode;
    setMode: (mode: GeneratorMode) => void;
    onOpenSettings: () => void;
    apiKeyStatus: boolean;
}

export const Header: React.FC<HeaderProps> = ({ mode, setMode, onOpenSettings, apiKeyStatus }) => {
  return (
    <header className="container mx-auto">
      <GlassCard className="!p-0">
          <div className="flex items-center justify-between p-3">
            <div 
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => setMode(GeneratorMode.HOME)}
            >
              <svg
                className="w-8 h-8 text-white"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 7L12 12M12 22V12M22 7L12 12M17 4.5L7 9.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h1 className="text-2xl font-bold tracking-tighter text-slate-100">
                GEN-SELA
              </h1>
            </div>

            <div className="flex items-center space-x-2">
                <div className="bg-[#101013] p-1 rounded-lg flex space-x-1">
                    <button
                        onClick={() => setMode(GeneratorMode.HOME)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#101013] ${
                        mode === GeneratorMode.HOME
                            ? 'bg-[#2a2a32] text-slate-100'
                            : 'bg-transparent text-slate-400 hover:bg-white/5'
                        }`}
                    >
                        Home
                    </button>
                    <button
                        onClick={() => setMode(GeneratorMode.IMAGE)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#101013] ${
                        mode === GeneratorMode.IMAGE
                            ? 'bg-[#2a2a32] text-slate-100'
                            : 'bg-transparent text-slate-400 hover:bg-white/5'
                        }`}
                    >
                        Image Generator
                    </button>
                    <button
                        onClick={() => setMode(GeneratorMode.VIDEO)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#101013] ${
                        mode === GeneratorMode.VIDEO
                            ? 'bg-[#2a2a32] text-slate-100'
                            : 'bg-transparent text-slate-400 hover:bg-white/5'
                        }`}
                    >
                        Video Generator
                    </button>
                     <button
                        onClick={() => setMode(GeneratorMode.IMAGE_GRADER)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#101013] ${
                        mode === GeneratorMode.IMAGE_GRADER
                            ? 'bg-[#2a2a32] text-slate-100'
                            : 'bg-transparent text-slate-400 hover:bg-white/5'
                        }`}
                    >
                        Image Grader & Tagger
                    </button>
                    <button
                        onClick={() => setMode(GeneratorMode.TEXT_TOOLKIT)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#101013] ${
                        mode === GeneratorMode.TEXT_TOOLKIT
                            ? 'bg-[#2a2a32] text-slate-100'
                            : 'bg-transparent text-slate-400 hover:bg-white/5'
                        }`}
                    >
                        Text Toolkit
                    </button>
                    <button
                        onClick={() => setMode(GeneratorMode.VEO_PROMPT)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#101013] ${
                        mode === GeneratorMode.VEO_PROMPT
                            ? 'bg-[#2a2a32] text-slate-100'
                            : 'bg-transparent text-slate-400 hover:bg-white/5'
                        }`}
                    >
                        VEO Prompt
                    </button>
                     <button
                        onClick={() => setMode(GeneratorMode.PROMPT_STUDIO)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#101013] ${
                        mode === GeneratorMode.PROMPT_STUDIO
                            ? 'bg-[#2a2a32] text-slate-100'
                            : 'bg-transparent text-slate-400 hover:bg-white/5'
                        }`}
                    >
                        Prompt Studio
                    </button>
                </div>
                <button 
                  onClick={onOpenSettings}
                  className="relative p-2.5 rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#16161a]"
                  aria-label="Open settings"
                >
                    <SettingsIcon className="w-5 h-5" />
                    <span className={`absolute top-1.5 right-1.5 block w-2.5 h-2.5 rounded-full ring-2 ring-[#16161a] ${apiKeyStatus ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </button>
            </div>
          </div>
      </GlassCard>
    </header>
  );
};
