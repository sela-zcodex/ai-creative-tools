
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { TRANSLATION_LANGUAGE_OPTIONS } from '../../constants';
import { CopyIcon } from '../icons/CopyIcon';
import { SpeakerIcon } from '../icons/SpeakerIcon';
import { SwitchIcon } from '../icons/SwitchIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { CustomSelect } from '../ui/CustomSelect';
import { VoiceSelector } from './VoiceSelector';

type ToolMode = 'corrector' | 'translator' | 'tts';

interface TextToolkitProps {
    inputText: string;
    setInputText: (text: string) => void;
    outputText: string;
    setOutpuText: (text: string) => void;
    isLoading: boolean;
    onCorrect: () => void;
    onTranslate: (targetLanguage: string) => void;
    onSuggestVoice: (text: string, voices: SpeechSynthesisVoice[]) => void;
    suggestedVoice: string;
}

const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} className="text-xs text-slate-400 hover:text-purple-300 flex items-center transition-colors">
            <CopyIcon className="w-4 h-4 mr-1.5" />
            {copied ? 'Copied!' : 'Copy'}
        </button>
    );
};


export const TextToolkit: React.FC<TextToolkitProps> = ({ inputText, setInputText, outputText, setOutpuText, isLoading, onCorrect, onTranslate, onSuggestVoice, suggestedVoice }) => {
    const [mode, setMode] = useState<ToolMode>('corrector');
    const [targetLanguage, setTargetLanguage] = useState('Khmer');

    // TTS State
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<string>('');
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        const loadVoices = () => {
            const systemVoices = window.speechSynthesis.getVoices();
            if (systemVoices.length > 0) {
                 setVoices(systemVoices);
                if (!selectedVoice) {
                    const defaultVoice = systemVoices.find(v => v.default) || systemVoices[0];
                    if (defaultVoice) {
                        setSelectedVoice(defaultVoice.name);
                    }
                }
            }
        };
        loadVoices();
        // Voices may load asynchronously
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
            if(window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    useEffect(() => {
        if (suggestedVoice && voices.some(v => v.name === suggestedVoice)) {
            setSelectedVoice(suggestedVoice);
        }
    }, [suggestedVoice, voices]);


    const handleSpeak = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }
        if (!inputText.trim()) return;

        const utterance = new SpeechSynthesisUtterance(inputText);
        const voice = voices.find(v => v.name === selectedVoice);
        if (voice) {
            utterance.voice = voice;
        }
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
            console.error("Speech synthesis error:", e);
            setIsSpeaking(false);
        }; 
        
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    };
    
    const handleSwapLanguages = () => {
        setInputText(outputText);
        setOutpuText(inputText);
    }

    const renderControls = () => {
        switch (mode) {
            case 'corrector':
                return (
                    <button onClick={onCorrect} disabled={isLoading || !inputText.trim()} className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-colors disabled:bg-slate-700/50 disabled:cursor-not-allowed flex-shrink-0 flex justify-center items-center">
                        {isLoading ? <LoadingSpinner /> : 'Correct Text'}
                    </button>
                );
            case 'translator':
                return (
                    <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full">
                         <div className="w-full sm:w-56 flex-shrink-0">
                            <CustomSelect value={targetLanguage} options={TRANSLATION_LANGUAGE_OPTIONS} onChange={setTargetLanguage} />
                         </div>
                         <button onClick={() => onTranslate(targetLanguage)} disabled={isLoading || !inputText.trim()} className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-colors disabled:bg-slate-700/50 disabled:cursor-not-allowed flex-shrink-0 flex justify-center items-center">
                            {isLoading ? <LoadingSpinner /> : 'Translate'}
                         </button>
                    </div>
                );
            case 'tts':
                return (
                    <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full justify-center">
                        <div className="w-full sm:w-64 flex-shrink-0">
                            <VoiceSelector 
                                voices={voices}
                                selectedVoiceName={selectedVoice}
                                onSelectVoice={setSelectedVoice}
                                suggestedVoiceName={suggestedVoice}
                            />
                        </div>
                         <button onClick={() => onSuggestVoice(inputText, voices)} disabled={isLoading || !inputText.trim()} className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 transition-colors disabled:bg-slate-700/50 disabled:cursor-not-allowed flex-shrink-0 flex items-center justify-center">
                            {isLoading ? <LoadingSpinner /> : <SparklesIcon className="w-5 h-5 mr-2" />}
                            Suggest Voice
                         </button>
                        <button onClick={handleSpeak} disabled={!inputText.trim() || isLoading} className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-colors disabled:bg-slate-700/50 disabled:cursor-not-allowed flex-shrink-0 flex items-center justify-center">
                            <SpeakerIcon className="w-5 h-5 mr-2" />
                            {isSpeaking ? 'Stop' : 'Speak'}
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <GlassCard>
            <div className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">AI Text Toolkit</h1>
                        <p className="text-slate-400 text-sm">Correct, translate, and synthesize text with ease.</p>
                    </div>
                    <div className="bg-[#101013] p-1 rounded-lg flex space-x-1 mt-4 sm:mt-0">
                        {(['corrector', 'translator', 'tts'] as ToolMode[]).map(m => (
                            <button key={m} onClick={() => setMode(m)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${mode === m ? 'bg-[#2a2a32] text-slate-100' : 'text-slate-400 hover:bg-white/5'}`}>
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-center relative">
                    {/* Input */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-slate-300">Input</label>
                            { inputText && <CopyButton text={inputText} /> }
                        </div>
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            rows={12}
                            className="w-full bg-[#101013] border border-white/10 rounded-lg shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-colors resize-y hover:border-slate-600"
                            placeholder="Type or paste your text here..."
                        />
                    </div>

                    { mode === 'translator' && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 my-auto hidden md:block">
                            <button onClick={handleSwapLanguages} className="p-2 rounded-full bg-slate-700/80 border border-white/10 text-slate-300 hover:bg-purple-500/20 hover:text-white transition-colors">
                                <SwitchIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                    
                    {/* Output */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-slate-300">Output</label>
                            { outputText && <CopyButton text={outputText} /> }
                        </div>
                        <textarea
                            value={outputText}
                            readOnly
                            rows={12}
                            className="w-full bg-[#101013] border border-white/10 rounded-lg shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-colors resize-y cursor-not-allowed"
                            placeholder="Result will appear here..."
                        />
                    </div>
                </div>
                
                <div className="mt-6 flex justify-center">
                    {renderControls()}
                </div>
            </div>
        </GlassCard>
    );
};
