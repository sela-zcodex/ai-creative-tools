import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { CopyIcon } from '../icons/CopyIcon';

interface VeoPromptOutputProps {
  prompts: {
    khmer: string;
    english: string;
    json: string;
  };
  isTranslating: boolean;
}

const OutputCard: React.FC<{ title: string, content: string, isLoading?: boolean }> = ({ title, content, isLoading }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-[#101013] rounded-lg border border-white/10 p-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-slate-200">{title}</h3>
                <button onClick={handleCopy} className="text-xs text-slate-400 hover:text-purple-300 flex items-center transition-colors">
                    <CopyIcon className="w-4 h-4 mr-1.5" />
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <div className="w-full bg-[#0d0d12] p-3 rounded-md text-slate-300 text-sm whitespace-pre-wrap h-48 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : (
                    <code>{content || '...'}</code>
                )}
            </div>
        </div>
    );
};

export const VeoPromptOutput: React.FC<VeoPromptOutputProps> = ({ prompts, isTranslating }) => {
  return (
    <GlassCard>
      <div className="p-5 flex flex-col space-y-4">
        <OutputCard title="Khmer Prompt" content={prompts.khmer} isLoading={isTranslating} />
        <OutputCard title="English Prompt" content={prompts.english} />
        <OutputCard title="JSON Prompt" content={prompts.json} />
      </div>
    </GlassCard>
  );
};