
import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { ClapperboardIcon } from '../icons/ClapperboardIcon';
import { RCCrawlerIcon } from '../icons/RCCrawlerIcon';
import { ASMRIcon } from '../icons/ASMRIcon';

type PromptStudioMode = 'home' | 'movie' | 'rc_crawler' | 'asmr';

interface PromptStudioHomePageProps {
  setPromptStudioMode: (mode: PromptStudioMode) => void;
}

interface Studio {
    name: string;
    description: string;
    icon: React.ReactNode;
    mode: PromptStudioMode;
}

const studios: Studio[] = [
    {
        name: 'Movie Studio',
        description: 'Generate a complete movie concept, including a synopsis, characters, and a scene-by-scene breakdown.',
        icon: <ClapperboardIcon className="w-8 h-8 text-purple-300" />,
        mode: 'movie',
    },
    {
        name: 'RC Crawler Studio',
        description: 'Create cinematic video scripts for your RC crawlers, ensuring vehicle consistency across multiple scenes.',
        icon: <RCCrawlerIcon className="w-8 h-8 text-purple-300" />,
        mode: 'rc_crawler',
    },
    {
        name: 'ASMR Studio',
        description: 'Craft detailed scripts for relaxing ASMR videos, specifying triggers, actions, and sounds for each scene.',
        icon: <ASMRIcon className="w-8 h-8 text-purple-300" />,
        mode: 'asmr',
    },
];

const StudioCard: React.FC<{ studio: Studio, onLaunch: () => void }> = ({ studio, onLaunch }) => (
    <GlassCard className="flex flex-col h-full hover:border-purple-400/50 transition-colors duration-300">
        <div className="p-6 flex-grow">
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-purple-500/10 p-3 rounded-lg border border-purple-400/20">
                    {studio.icon}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-100">{studio.name}</h3>
                    <p className="text-slate-400 mt-1 text-sm">{studio.description}</p>
                </div>
            </div>
        </div>
        <div className="p-4 bg-black/20 rounded-b-xl mt-auto">
            <button
                onClick={onLaunch}
                className="w-full py-2 px-4 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-colors"
            >
                Launch Studio
            </button>
        </div>
    </GlassCard>
);

export const PromptStudioHomePage: React.FC<PromptStudioHomePageProps> = ({ setPromptStudioMode }) => {
  return (
    <div className="animate-fade-in">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-100 sm:text-5xl">
                Prompt Studio
            </h1>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                A collection of specialized tools to generate detailed, structured prompts for creative video projects. Choose a studio to begin crafting your script.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studios.sort((a,b) => a.name.localeCompare(b.name)).map(studio => (
                <StudioCard key={studio.name} studio={studio} onLaunch={() => setPromptStudioMode(studio.mode)} />
            ))}
        </div>
    </div>
  );
};
