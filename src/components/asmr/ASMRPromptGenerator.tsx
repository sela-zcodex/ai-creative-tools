
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GlassCard } from '../ui/GlassCard';
import { ASMRCharacter, ASMRScene, LoadingState } from '../../types';
import { CopyIcon } from '../icons/CopyIcon';
import { ChevronUpIcon } from '../icons/ChevronUpIcon';
import { ErrorIcon } from '../icons/ErrorIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { BackIcon } from '../icons/BackIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface ASMRPromptGeneratorProps {
  concept: string;
  setConcept: (concept: string) => void;
  triggers: string[];
  // FIX: Allow functional updates for setTriggers state by using React.Dispatch<React.SetStateAction<string[]>>
  setTriggers: React.Dispatch<React.SetStateAction<string[]>>;
  setting: string;
  setSetting: (setting: string) => void;
  characters: ASMRCharacter[];
  setCharacters: React.Dispatch<React.SetStateAction<ASMRCharacter[]>>;
  scenes: ASMRScene[];
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

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea
        {...props}
        className="w-full bg-[#101013] border border-white/10 rounded-lg py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-colors resize-y"
    />
);

export const ASMRPromptGenerator: React.FC<ASMRPromptGeneratorProps> = ({
  concept, setConcept, triggers, setTriggers, setting, setSetting, characters, setCharacters, scenes,
  onGenerate, onExtendScene, onAddScene, onBack,
  loadingState, loadingMessage, error, extendingSceneId, isAddingScene
}) => {
    
    const isLoading = loadingState === LoadingState.GENERATING;
    
     const handleAddCharacter = () => {
        setCharacters(prev => [...prev, {
            id: uuidv4(), name: `ASMRtist ${prev.length + 1}`, description: ''
        }]);
    };

    const handleRemoveCharacter = (id: string) => {
        setCharacters(prev => prev.filter(c => c.id !== id));
    };

    const handleUpdateCharacter = (id: string, field: keyof Omit<ASMRCharacter, 'id'>, value: string) => {
        setCharacters(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    };


    const sceneToText = (scene: ASMRScene) => {
        return `Timestamp: ${scene.timestamp}\n\nAction: ${scene.action_description}\n\nSound: ${scene.sound_description}\n\nVisual: ${scene.visual_description}`;
    };

    const fullPromptText = () => {
        let text = `ASMR Video Concept: ${concept}\nSetting: ${setting}\nTriggers: ${triggers.join(', ')}\n\n`;
        scenes.forEach(s => {
            text += `--- SCENE ${s.scene_number} ---\n${sceneToText(s)}\n\n`;
        });
        return text.trim();
    };

    const renderContent = () => {
        if (isLoading) {
             return (
                <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                    <svg className="animate-spin h-10 w-10 text-purple-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="text-lg font-medium text-slate-200">{loadingMessage}</p>
                    <p className="text-sm text-slate-400 mt-1">AI is crafting a relaxing experience...</p>
                </div>
            )
        }
        if (error) {
             return (
                <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                     <div className="p-6 bg-red-900/30 rounded-lg border border-red-400/20"><ErrorIcon className="h-12 w-12 text-red-400 mb-4 mx-auto" /><h3 className="text-xl font-semibold text-red-300">An Error Occurred</h3><p className="text-red-400 mt-2 max-w-md break-words">{error}</p></div>
                </div>
            );
        }
        if (loadingState === LoadingState.SUCCESS && scenes.length > 0) {
            return (
                <div className="mt-6 space-y-4">
                    <div className="flex justify-end"><CopyButton text={fullPromptText()} /></div>
                    <CollapsibleSection title="Scene Breakdown">
                         {scenes.map(scene => (
                            <div key={scene.id} className="p-4 bg-[#101013] rounded-lg border border-white/10 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-slate-100">Scene {scene.scene_number} <span className="font-normal text-slate-400 text-sm ml-2">{scene.timestamp}</span></h4>
                                        <div className="mt-2 flex flex-wrap gap-2 items-center"><span className="text-xs text-slate-400 font-medium">Triggers:</span>{scene.triggers_present.map(trigger => (<span key={trigger} className="text-xs font-semibold text-purple-200 bg-purple-500/20 px-2.5 py-1 rounded-full">{trigger}</span>))}</div>
                                    </div>
                                    <CopyButton text={sceneToText(scene)} />
                                </div>
                                <div className="pt-4 border-t border-white/10"><h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Action</h5><p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{scene.action_description}</p></div>
                                <div className="pt-4 border-t border-white/10"><h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Sound</h5><p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{scene.sound_description}</p></div>
                                <div className="pt-4 border-t border-white/10"><h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Visual</h5><p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{scene.visual_description}</p></div>
                                <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
                                    <button onClick={() => onExtendScene(scene.id)} disabled={!!extendingSceneId || isAddingScene} className="flex items-center text-xs font-semibold text-purple-300 hover:text-purple-200 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors">{extendingSceneId === scene.id ? <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" fill="currentColor"></path></svg> : <SparklesIcon className="w-4 h-4 mr-1.5" />} {extendingSceneId === scene.id ? 'Extending...' : 'Extend Scene'}</button>
                                </div>
                            </div>
                        ))}
                        <div className="mt-6"><button onClick={onAddScene} disabled={isAddingScene || !!extendingSceneId} className="w-full flex items-center justify-center py-2.5 text-sm font-semibold text-purple-300 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed">{isAddingScene ? <><svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" fill="currentColor"></path></svg>Adding Scene...</> : <><PlusIcon className="w-5 h-5 mr-2" />Generate Next Scene</>}</button></div>
                    </CollapsibleSection>
                </div>
            );
        }
        return (<div className="text-center p-8"><h2 className="text-2xl font-bold mb-2 text-slate-100">ASMR Studio</h2><p className="text-slate-400 max-w-md mx-auto">Define your concept, triggers, and setting to generate a detailed script for a relaxing ASMR video.</p></div>);
    };

    return (
        <GlassCard>
            <div className="p-5">
                <button onClick={onBack} className="flex items-center text-sm font-semibold text-slate-300 hover:text-white mb-4"><BackIcon className="w-5 h-5 mr-2" /> Back to Studio Home</button>
                <CollapsibleSection title="Setup">
                    <FormField label="Video Concept"><TextArea value={concept} onChange={e => setConcept(e.target.value)} placeholder="e.g., Unboxing and examining a vintage watch" rows={2} /></FormField>
                    <FormField label="Setting / Environment"><TextArea value={setting} onChange={e => setSetting(e.target.value)} placeholder="e.g., A quiet, softly lit room with a wooden desk" rows={2} /></FormField>
                    <FormField label="ASMR Triggers">
                       <TextArea
                            value={triggers.join(', ')}
                            onChange={(e) => setTriggers(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                            placeholder="Enter triggers, separated by commas (e.g., Whispering, Tapping)"
                            rows={3}
                        />
                    </FormField>
                    <div>
                        <h3 className="text-sm font-medium text-slate-300 mb-1.5">ASMRtist (Optional)</h3>
                        {characters.map((char, index) => (
                            <div key={char.id} className="p-3 bg-[#101013] rounded-lg border border-white/10 space-y-3 mb-3">
                                <div className="flex justify-between items-center"><h4 className="font-semibold text-slate-200">ASMRtist {index + 1}</h4><button onClick={() => handleRemoveCharacter(char.id)} className="p-1.5 text-slate-400 hover:text-red-400 rounded-full hover:bg-red-500/10"><TrashIcon className="w-5 h-5" /></button></div>
                                <TextArea rows={2} value={char.description} onChange={e => handleUpdateCharacter(char.id, 'description', e.target.value)} placeholder="Describe the ASMRtist's hands, voice, or demeanor. e.g., 'Performer has gentle, soft-spoken female voice and clean, manicured hands.'" />
                            </div>
                        ))}
                        <button onClick={handleAddCharacter} className="w-full flex items-center justify-center py-2 text-sm font-semibold text-purple-300 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors"><PlusIcon className="w-5 h-5 mr-2" /> Add ASMRtist</button>
                    </div>
                </CollapsibleSection>
                <div className="mt-5"><button onClick={onGenerate} disabled={isLoading || !concept.trim() || triggers.length === 0} className={`w-full py-3 px-4 rounded-xl text-lg font-semibold text-white transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#16161a] focus:ring-purple-500 flex items-center justify-center ${isLoading || !concept.trim() || triggers.length === 0 ? 'bg-slate-700/50 cursor-not-allowed text-slate-400' : 'bg-[#3A3549] hover:bg-[#4a455c]'}`}>{isLoading ? <><svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" fill="currentColor"></path></svg>Generating...</> : 'Generate Scenes'}</button></div>
                <div className="mt-4">{renderContent()}</div>
            </div>
        </GlassCard>
    );
};
