

import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { MovieCharacter, MovieScene, LoadingState, DialogueLine } from '../../types';
import { CopyIcon } from '../icons/CopyIcon';
import { ChevronUpIcon } from '../icons/ChevronUpIcon';
import { ErrorIcon } from '../icons/ErrorIcon';
import { CustomSelect } from '../ui/CustomSelect';
import { MOVIE_GENRE_OPTIONS } from '../../constants';
import { SparklesIcon } from '../icons/SparklesIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { BackIcon } from '../icons/BackIcon';

interface MoviePromptGeneratorProps {
  title: string;
  setTitle: (title: string) => void;
  genre: string;
  setGenre: (genre: string) => void;
  synopsis: string;
  fullStory: string;
  characters: MovieCharacter[];
  scenes: MovieScene[];
  onGenerate: () => void;
  onExtendScene: (sceneId: string) => void;
  onAddScene: () => void;
  onBack: () => void;
  loadingState: LoadingState;
  loadingMessage: string;
  error: string | null;
  extendingSceneId: string | null;
  isAddingScene: boolean;
}

const CollapsibleSection: React.FC<{ title: string, children: React.ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-white/10 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center py-4 text-left"
            >
                <h2 className="text-xl font-bold text-slate-100">{title}</h2>
                <ChevronUpIcon className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${!isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="pb-6 space-y-4">{children}</div>}
        </div>
    );
};

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} className="text-xs text-slate-400 hover:text-purple-300 flex items-center transition-colors flex-shrink-0 ml-4">
            <CopyIcon className="w-4 h-4 mr-1.5" />
            {copied ? 'Copied!' : 'Copy'}
        </button>
    );
};


export const MoviePromptGenerator: React.FC<MoviePromptGeneratorProps> = ({
  title, setTitle, genre, setGenre, synopsis, fullStory, characters, scenes, 
  onGenerate, onExtendScene, onAddScene, onBack, loadingState, loadingMessage, error, extendingSceneId, isAddingScene
}) => {
    
    const isLoading = loadingState === LoadingState.GENERATING;

    const sceneToText = (scene: MovieScene) => {
        let text = `--- SCENE ${scene.scene_number} ---\n`;
        if (scene.characters_present && scene.characters_present.length > 0) {
          text += `Characters Present: ${scene.characters_present.join(', ')}\n\n`;
        }
        text += `${scene.principal_character_description}\n\n`;
        text += `Scene Action:\n${scene.scene_action}\n\n`;
        text += `Cinematography:\n${scene.cinematography}\n\n`;
        if (scene.dialogue && scene.dialogue.length > 0) {
            text += 'Dialogue:\n';
            scene.dialogue.forEach(d => {
                text += `${d.character} (${d.voice_description}): "${d.line}"\n`;
            });
        }
        return text.trim();
    };

    const fullPromptText = () => {
        let fullText = `Movie Synopsis:\n${synopsis}\n\n`;
        fullText += `Full Story:\n${fullStory}\n\n`;
        fullText += "Characters:\n";
        characters.forEach(c => {
            fullText += `- ${c.name}: ${c.description}\n`;
        });
        fullText += "\n\n--- SCRIPT ---\n";
        scenes.forEach(s => {
            fullText += `\n${sceneToText(s)}\n`;
        });
        return fullText.trim();
    };
    
    const renderContent = () => {
        if (isLoading) {
             return (
                <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                    <svg className="animate-spin h-10 w-10 text-purple-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-lg font-medium text-slate-200">{loadingMessage}</p>
                    <p className="text-sm text-slate-400 mt-1">The AI is crafting your story...</p>
                </div>
            )
        }
        if (error) {
             return (
                <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                     <div className="p-6 bg-red-900/30 rounded-lg border border-red-400/20">
                        <ErrorIcon className="h-12 w-12 text-red-400 mb-4 mx-auto" />
                        <h3 className="text-xl font-semibold text-red-300">An Error Occurred</h3>
                        <p className="text-red-400 mt-2 max-w-md break-words">{error}</p>
                     </div>
                </div>
            );
        }

        if (loadingState === LoadingState.SUCCESS && synopsis) {
            return (
                <div className="mt-6 space-y-4">
                    <div className="flex justify-end">
                        <CopyButton text={fullPromptText()} />
                    </div>

                    <CollapsibleSection title="Synopsis">
                        <p className="text-slate-300 text-sm leading-relaxed">{synopsis}</p>
                    </CollapsibleSection>

                    <CollapsibleSection title="Full Story">
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{fullStory}</p>
                    </CollapsibleSection>
                    
                    <CollapsibleSection title="Characters">
                        {characters.map(char => (
                            <div key={char.name} className="p-4 bg-[#101013] rounded-lg border border-white/10">
                                <h4 className="font-bold text-slate-100">{char.name}</h4>
                                <p className="text-slate-400 text-sm mt-1">{char.description}</p>
                            </div>
                        ))}
                    </CollapsibleSection>

                    <CollapsibleSection title="Scene Breakdown">
                         {scenes.map(scene => (
                            <div key={scene.id} className="p-4 bg-[#101013] rounded-lg border border-white/10 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-slate-100">Scene {scene.scene_number}</h4>
                                        {scene.characters_present && scene.characters_present.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2 items-center">
                                                <span className="text-xs text-slate-400 font-medium">Characters:</span>
                                                {scene.characters_present.map(charName => (
                                                    <span key={charName} className="text-xs font-semibold text-purple-200 bg-purple-500/20 px-2.5 py-1 rounded-full">
                                                        {charName}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <CopyButton text={sceneToText(scene)} />
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{scene.principal_character_description}</p>
                                
                                <div className="pt-4 border-t border-white/10">
                                    <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Scene Action</h5>
                                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{scene.scene_action}</p>
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Cinematography</h5>
                                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{scene.cinematography}</p>
                                </div>

                                {scene.dialogue && scene.dialogue.length > 0 && (
                                    <div className="pt-4 border-t border-white/10">
                                        <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Dialogue</h5>
                                        <div className="space-y-3">
                                            {scene.dialogue.map((line, index) => (
                                                <div key={index}>
                                                    <p className="text-sm">
                                                        <strong className="font-semibold text-slate-100">{line.character}: </strong>
                                                        <span className="text-slate-400 italic">({line.voice_description})</span>
                                                    </p>
                                                    <blockquote className="mt-1 text-sm text-slate-200 border-l-2 border-purple-500/50 pl-3">
                                                        "{line.line}"
                                                    </blockquote>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
                                    <button
                                        onClick={() => onExtendScene(scene.id)}
                                        disabled={!!extendingSceneId || isAddingScene}
                                        className="flex items-center text-xs font-semibold text-purple-300 hover:text-purple-200 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {extendingSceneId === scene.id ? (
                                             <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <SparklesIcon className="w-4 h-4 mr-1.5" />
                                        )}
                                        {extendingSceneId === scene.id ? 'Extending...' : 'Extend Scene'}
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        <div className="mt-6">
                            <button
                                onClick={onAddScene}
                                disabled={isAddingScene || !!extendingSceneId}
                                className="w-full flex items-center justify-center py-2.5 text-sm font-semibold text-purple-300 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                            >
                                {isAddingScene ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Adding Scene...
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon className="w-5 h-5 mr-2" />
                                        Generate Next Scene
                                    </>
                                )}
                            </button>
                        </div>
                    </CollapsibleSection>
                </div>
            );
        }

        return (
            <div className="text-center p-8">
                 <h2 className="text-2xl font-bold mb-2 text-slate-100">Movie Studio</h2>
                 <p className="text-slate-400 max-w-md mx-auto">Enter a title and genre, and let the AI generate a complete movie concept with a synopsis, characters, and scene breakdown.</p>
            </div>
        );
    };


    return (
        <GlassCard>
            <div className="p-5">
                 <button onClick={onBack} className="flex items-center text-sm font-semibold text-slate-300 hover:text-white mb-4">
                    <BackIcon className="w-5 h-5 mr-2" />
                    Back to Studio Home
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="movie-title" className="block text-sm font-medium text-slate-300 mb-1.5">Movie Title</label>
                        <input
                            id="movie-title"
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g., The Last Starlight"
                            className="w-full bg-[#101013] border border-white/10 rounded-lg py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-colors"
                        />
                    </div>
                    <div>
                        <label htmlFor="movie-genre" className="block text-sm font-medium text-slate-300 mb-1.5">Genre</label>
                        <CustomSelect options={MOVIE_GENRE_OPTIONS} value={genre} onChange={setGenre} />
                    </div>
                </div>
                <div className="mt-5">
                    <button
                        onClick={onGenerate}
                        disabled={isLoading || !title.trim()}
                        className={`w-full py-3 px-4 rounded-xl text-lg font-semibold text-white transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#16161a] focus:ring-purple-500 flex items-center justify-center
                                   ${isLoading || !title.trim() 
                                     ? 'bg-slate-700/50 cursor-not-allowed text-slate-400' 
                                     : 'bg-[#3A3549] hover:bg-[#4a455c]'
                                   }`}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </>
                        ) : (
                            'Generate Story'
                        )}
                    </button>
                </div>
                
                <div className="mt-4">
                    {renderContent()}
                </div>
            </div>
        </GlassCard>
    );
};
