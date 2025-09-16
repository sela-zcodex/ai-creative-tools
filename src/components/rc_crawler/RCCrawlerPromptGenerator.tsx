


import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GlassCard } from '../ui/GlassCard';
import { RCCrawlerCharacter, RCCrawlerScene, LoadingState, ShotType } from '../../types';
import { CopyIcon } from '../icons/CopyIcon';
import { ChevronUpIcon } from '../icons/ChevronUpIcon';
import { ErrorIcon } from '../icons/ErrorIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { CustomSelect } from '../ui/CustomSelect';
import { BackIcon } from '../icons/BackIcon';

interface RCCrawlerPromptGeneratorProps {
  concept: string;
  setConcept: (concept: string) => void;
  crawlers: RCCrawlerCharacter[];
  setCrawlers: React.Dispatch<React.SetStateAction<RCCrawlerCharacter[]>>;
  scenes: RCCrawlerScene[];
  onGenerate: () => void;
  onExtendScene: (sceneId: string) => void;
  onAddScene: (shotType: ShotType) => void;
  onEnhanceConcept: () => void;
  onBack: () => void;
  isEnhancingConcept: boolean;
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
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-4 text-left">
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

const FormField: React.FC<{ label: string, children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
        {children}
    </div>
);

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input
        type="text"
        {...props}
        className="w-full bg-[#101013] border border-white/10 rounded-lg py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-colors"
    />
);

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea
        {...props}
        className="w-full bg-[#101013] border border-white/10 rounded-lg py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-colors resize-y"
    />
);

export const RCCrawlerPromptGenerator: React.FC<RCCrawlerPromptGeneratorProps> = ({
  concept, setConcept, crawlers, setCrawlers, scenes, 
  onGenerate, onExtendScene, onAddScene, onEnhanceConcept, onBack, isEnhancingConcept,
  loadingState, loadingMessage, error, extendingSceneId, isAddingScene
}) => {
    
    const isLoading = loadingState === LoadingState.GENERATING;
    const [shotType, setShotType] = useState<ShotType>('Any');
    const SHOT_TYPE_OPTIONS: ShotType[] = ['Any', 'Establishing Shot', 'Action Shot', 'Detail Shot', 'Hero Shot'];


    const handleAddCrawler = () => {
        setCrawlers(prev => [...prev, {
            id: uuidv4(), name: `Crawler ${prev.length + 1}`, model: '', color: '', modifications: ''
        }]);
    };

    const handleRemoveCrawler = (id: string) => {
        setCrawlers(prev => prev.filter(c => c.id !== id));
    };

    const handleUpdateCrawler = (id: string, field: keyof RCCrawlerCharacter, value: string) => {
        setCrawlers(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const sceneToText = (scene: RCCrawlerScene) => {
        return [
            scene.environment,
            scene.crawler_description,
            scene.scene_action,
            scene.cinematography,
        ].join('\n\n').trim();
    };

    const fullPromptText = () => {
        let fullText = `RC Crawler Video Concept:\n${concept}\n\n`;
        fullText += "Crawlers:\n";
        crawlers.forEach(c => {
            fullText += `- ${c.name}: A ${c.color} ${c.model} with ${c.modifications}.\n`;
        });
        fullText += "\n\n--- SCRIPT ---\n";
        scenes.forEach(s => {
             let sceneBlock = `\n--- SCENE ${s.scene_number} ---\n`;
            sceneBlock += `Crawlers Present: ${s.crawlers_present.join(', ')}\n\n`;
            sceneBlock += `Environment:\n${s.environment}\n\n`;
            sceneBlock += `Crawler Description:\n${s.crawler_description}\n\n`;
            sceneBlock += `Scene Action:\n${s.scene_action}\n\n`;
            sceneBlock += `Cinematography:\n${s.cinematography}\n`;
            fullText += sceneBlock;
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
                    <p className="text-sm text-slate-400 mt-1">The AI is planning your trail run...</p>
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

        if (loadingState === LoadingState.SUCCESS && scenes.length > 0) {
            return (
                <div className="mt-6 space-y-4">
                    <div className="flex justify-end">
                        <CopyButton text={fullPromptText()} />
                    </div>
                    <CollapsibleSection title="Scene Breakdown">
                         {scenes.map(scene => (
                            <div key={scene.id} className="p-4 bg-[#101013] rounded-lg border border-white/10 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-slate-100">Scene {scene.scene_number}</h4>
                                        <div className="mt-2 flex flex-wrap gap-2 items-center">
                                            <span className="text-xs text-slate-400 font-medium">Crawlers:</span>
                                            {scene.crawlers_present.map(crawlerName => (
                                                <span key={crawlerName} className="text-xs font-semibold text-purple-200 bg-purple-500/20 px-2.5 py-1 rounded-full">
                                                    {crawlerName}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <CopyButton text={sceneToText(scene)} />
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{sceneToText(scene)}</p>
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
                                    <button onClick={() => onExtendScene(scene.id)} disabled={!!extendingSceneId || isAddingScene} className="flex items-center text-xs font-semibold text-purple-300 hover:text-purple-200 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors">
                                        {extendingSceneId === scene.id ? <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" fill="currentColor"></path></svg> : <SparklesIcon className="w-4 h-4 mr-1.5" />}
                                        {extendingSceneId === scene.id ? 'Extending...' : 'Extend Scene'}
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                            <div className="sm:w-56 flex-shrink-0 order-2 sm:order-1">
                                <CustomSelect 
                                    value={shotType} 
                                    options={SHOT_TYPE_OPTIONS}
                                    onChange={(val) => setShotType(val as ShotType)} 
                                />
                             </div>
                            <button onClick={() => onAddScene(shotType)} disabled={isAddingScene || !!extendingSceneId} className="w-full flex items-center justify-center py-2.5 text-sm font-semibold text-purple-300 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed order-1 sm:order-2 flex-grow">
                                {isAddingScene ? <><svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" fill="currentColor"></path></svg>Adding Scene...</> : <><PlusIcon className="w-5 h-5 mr-2" />Generate Next Scene</>}
                            </button>
                        </div>
                    </CollapsibleSection>
                </div>
            );
        }

        return (
            <div className="text-center p-8">
                 <h2 className="text-2xl font-bold mb-2 text-slate-100">RC Crawler Studio</h2>
                 <p className="text-slate-400 max-w-md mx-auto">Define your RC vehicles and a video concept, and let the AI generate a cinematic script ready for VEO.</p>
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
                <CollapsibleSection title="Setup">
                    <FormField label="Video Concept">
                        <div className="relative">
                            <TextInput
                                value={concept}
                                onChange={e => setConcept(e.target.value)}
                                placeholder="e.g., A challenging forest trail adventure"
                            />
                            <button
                                onClick={onEnhanceConcept}
                                disabled={isEnhancingConcept || !concept.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center text-xs font-semibold text-purple-300 hover:text-purple-200 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors bg-[#101013] px-2 py-1 rounded"
                            >
                                {isEnhancingConcept ? (
                                    <svg className="animate-spin h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-4 h-4 mr-1.5" />
                                        Enhance
                                    </>
                                )}
                            </button>
                        </div>
                    </FormField>
                    <div className="space-y-4">
                        {crawlers.map((crawler, index) => (
                            <div key={crawler.id} className="p-4 bg-[#101013] rounded-lg border border-white/10 space-y-3">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-slate-200">Crawler {index + 1}</h3>
                                    <button onClick={() => handleRemoveCrawler(crawler.id)} className="p-1.5 text-slate-400 hover:text-red-400 rounded-full hover:bg-red-500/10">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <FormField label="Name"><TextInput value={crawler.name} onChange={e => handleUpdateCrawler(crawler.id, 'name', e.target.value)} placeholder="e.g., The Bronco" /></FormField>
                                    <FormField label="Model"><TextInput value={crawler.model} onChange={e => handleUpdateCrawler(crawler.id, 'model', e.target.value)} placeholder="e.g., Traxxas TRX-4" /></FormField>
                                    <FormField label="Color"><TextInput value={crawler.color} onChange={e => handleUpdateCrawler(crawler.id, 'color', e.target.value)} placeholder="e.g., Metallic Blue" /></FormField>
                                </div>
                                <FormField label="Modifications & Details">
                                    <TextArea rows={2} value={crawler.modifications} onChange={e => handleUpdateCrawler(crawler.id, 'modifications', e.target.value)} placeholder="e.g., Upgraded shocks, beadlock wheels, roof rack with scale accessories..." />
                                </FormField>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAddCrawler} className="w-full flex items-center justify-center py-2.5 text-sm font-semibold text-purple-300 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors">
                        <PlusIcon className="w-5 h-5 mr-2" /> Add Crawler
                    </button>
                </CollapsibleSection>

                <div className="mt-5">
                    <button onClick={onGenerate} disabled={isLoading || !concept.trim() || crawlers.length === 0} className={`w-full py-3 px-4 rounded-xl text-lg font-semibold text-white transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#16161a] focus:ring-purple-500 flex items-center justify-center ${isLoading || !concept.trim() || crawlers.length === 0 ? 'bg-slate-700/50 cursor-not-allowed text-slate-400' : 'bg-[#3A3549] hover:bg-[#4a455c]'}`}>
                        {isLoading ? <><svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" fill="currentColor"></path></svg>Generating...</> : 'Generate Scenes'}
                    </button>
                </div>
                
                <div className="mt-4">
                    {renderContent()}
                </div>
            </div>
        </GlassCard>
    );
};
