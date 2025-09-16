

import React, { useCallback, useState, useEffect } from 'react';
import { GeneratorMode, ImageConfig } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { UploadIcon } from '../icons/UploadIcon';
import { CloseIcon } from '../icons/CloseIcon';
import { IMAGE_ASPECT_RATIOS, IMAGE_STYLE_PRESETS } from '../../constants';
import { CustomSelect } from '../ui/CustomSelect';
import { enhancePrompt } from '../../services/geminiService';
import { SparklesIcon } from '../icons/SparklesIcon';

interface BatchProgress {
    current: number;
    total: number;
    batch: number;
    totalBatches: number;
}

interface PromptBuilderProps {
  mode: GeneratorMode;
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  imageConfig: ImageConfig;
  setImageConfig: (config: ImageConfig) => void;
  conditioningImage: { file: File, base64: string } | null;
  setConditioningImage: (file: { file: File, base64: string } | null) => void;
  onGenerate: () => void;
  isLoading: boolean;
  batchProgress: BatchProgress | null;
  onCancel: () => void;
  onError: (error: unknown) => void;
}

const StyleGrid: React.FC<{ prompt: string; setPrompt: React.Dispatch<React.SetStateAction<string>>; }> = ({ prompt, setPrompt }) => {
  
  const handleStyleClick = (styleName: string) => {
    const trimmedPrompt = prompt.trim();
    const styleWithComma = `, ${styleName}`;
    const promptHasStyle = trimmedPrompt.endsWith(styleName) || trimmedPrompt.includes(styleWithComma);

    let newPrompt = trimmedPrompt;

    if (promptHasStyle) {
      // Remove the style
      newPrompt = newPrompt.replace(styleWithComma, ''); // remove from middle
      if(newPrompt.endsWith(styleName)) { // remove from end
        newPrompt = newPrompt.substring(0, newPrompt.length - styleName.length).trim();
        if (newPrompt.endsWith(',')) {
          newPrompt = newPrompt.slice(0, -1);
        }
      }
    } else {
      // Add the style
      if (newPrompt) {
        newPrompt += styleWithComma;
      } else {
        newPrompt = styleName;
      }
    }
    setPrompt(newPrompt);
  };


  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">Style</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {IMAGE_STYLE_PRESETS.map(style => {
          const isSelected = prompt.includes(style.name);
          return (
             <button
                key={style.name}
                onClick={() => handleStyleClick(style.name)}
                className={`flex items-center space-x-2 p-2 rounded-md border text-left text-sm transition-all duration-200 ${
                  isSelected 
                  ? 'bg-blue-500/80 border-blue-400 text-white' 
                  : 'bg-[#101013] border-white/10 text-slate-300 hover:bg-white/5 hover:border-slate-500'
                }`}
              >
                <style.icon className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{style.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  );
};


const ImageOptions: React.FC<{ config: ImageConfig, setConfig: (config: ImageConfig) => void }> = ({ config, setConfig }) => {
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
        setConfig({ ...config, numberOfImages: Math.max(1, Math.min(100, value)) });
    } else if (e.target.value === '') {
        setConfig({ ...config, numberOfImages: 1 });
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="numberOfImages" className="block text-sm font-medium text-slate-300 mb-2">Number of Images</label>
        <input
          type="number"
          id="numberOfImages"
          min="1"
          max="100"
          value={config.numberOfImages}
          onChange={handleNumberChange}
          className="w-full bg-[#101013] border border-white/10 rounded-lg shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <p className="text-xs text-slate-500 mt-1.5">Max 8 per request. Larger jobs are batched.</p>
      </div>
      <div>
        <label htmlFor="aspectRatio" className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
        <CustomSelect
          value={config.aspectRatio}
          options={IMAGE_ASPECT_RATIOS}
          onChange={(newRatio) => setConfig({ ...config, aspectRatio: newRatio as ImageConfig['aspectRatio'] })}
        />
      </div>
    </div>
  );
};


const VideoOptions: React.FC<{ 
    conditioningImage: { file: File, base64: string } | null;
    setConditioningImage: (file: { file: File, base64: string } | null) => void 
}> = ({ conditioningImage, setConditioningImage }) => {
  const handleFileChange = useCallback((files: FileList | null) => {
    const file = files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setConditioningImage({file, base64: base64String});
      };
      reader.readAsDataURL(file);
    } else if (file) {
      alert("File size exceeds 10MB.");
    }
  }, [setConditioningImage]);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFileChange(e.dataTransfer.files);
  };

  if (conditioningImage) {
    return (
        <div>
             <label className="block text-sm font-medium text-slate-300 mb-2">Conditioning Image</label>
             <div className="relative group">
                <img src={URL.createObjectURL(conditioningImage.file)} alt="Conditioning Preview" className="w-full rounded-lg border border-white/10" />
                <button 
                    onClick={() => setConditioningImage(null)}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-slate-300 hover:bg-black/80 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                    aria-label="Remove image"
                >
                    <CloseIcon className="w-5 h-5"/>
                </button>
             </div>
        </div>
    )
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">Conditioning Image (Optional)</label>
       <div 
        onDragOver={onDragOver}
        onDrop={onDrop}
        className="mt-1 flex justify-center p-6 bg-[#101013] border-2 border-white/10 border-dashed rounded-xl transition-colors hover:border-purple-400/50">
          <div className="space-y-2 text-center">
            <UploadIcon className="mx-auto h-10 w-10 text-slate-500"/>
            <div className="flex text-sm text-slate-400 justify-center items-center">
              <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-700/80 rounded-md font-medium text-purple-300 hover:text-purple-200 px-3 py-1.5 transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2 focus-within:ring-offset-[#101013]">
                <span>Upload a file</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e.target.files)} />
              </label>
              <p className="pl-2">or drag and drop</p>
            </div>
            <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
          </div>
        </div>
    </div>
  );
};


export const PromptBuilder: React.FC<PromptBuilderProps> = ({ mode, prompt, setPrompt, imageConfig, setImageConfig, conditioningImage, setConditioningImage, onGenerate, isLoading, batchProgress, onCancel, onError }) => {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhance = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const enhancedPrompt = await enhancePrompt(prompt);
      setPrompt(enhancedPrompt);
    } catch (error) {
      console.error("Failed to enhance prompt:", error);
      onError(error);
    } finally {
      setIsEnhancing(false);
    }
  };
  
  const renderGenerateButtonContent = () => {
    if (isLoading) {
        if (batchProgress) {
            return (
                <div className="w-full flex items-center justify-between">
                    <div className="relative w-full h-2 bg-slate-700/50 rounded-full overflow-hidden mr-3">
                       <div 
                         className="absolute top-0 left-0 h-full bg-purple-500 transition-all duration-300"
                         style={{width: `${(batchProgress.current / batchProgress.total) * 100}%`}}
                       ></div>
                    </div>
                    <span className="text-sm font-semibold whitespace-nowrap text-slate-300 mr-4">
                        {batchProgress.current}/{batchProgress.total}
                    </span>
                    <button 
                        onClick={onCancel}
                        className="p-1 text-slate-400 hover:text-white"
                        aria-label="Cancel generation"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
            )
        }
        return (
            <div className="flex justify-center items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
            </div>
        )
    }
    return `Generate ${mode === GeneratorMode.IMAGE ? 'Image' : 'Video'}`;
  }


  return (
    <GlassCard>
      <div className="p-5 flex flex-col">
        <h1 className="text-2xl font-bold text-slate-100">Prompt Studio</h1>
        <p className="text-slate-400 mb-5 text-sm">Craft your vision and bring it to life.</p>
        
        <div className="mt-5 flex flex-col space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="prompt" className="block text-sm font-medium text-slate-300">Your Prompt</label>
               {mode === GeneratorMode.IMAGE && (
                <button
                  onClick={handleEnhance}
                  disabled={isEnhancing || !prompt.trim() || isLoading}
                  className="flex items-center text-xs font-semibold text-purple-300 hover:text-purple-200 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                >
                  {isEnhancing ? (
                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <SparklesIcon className="w-4 h-4 mr-1.5" />
                  )}
                  {isEnhancing ? 'Enhancing...' : 'Enhance'}
                </button>
              )}
            </div>
            <textarea
              id="prompt"
              rows={5}
              className="w-full bg-[#101013] border border-white/10 rounded-lg shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-colors resize-none hover:border-slate-600"
              placeholder={"e.g., A cinematic shot of a futuristic city at night..."}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          {mode === GeneratorMode.IMAGE && (
            <div className="pt-1">
              <StyleGrid prompt={prompt} setPrompt={setPrompt} />
            </div>
          )}
          
          <div className="transition-all duration-300">
            {mode === GeneratorMode.IMAGE ? (
              <ImageOptions config={imageConfig} setConfig={setImageConfig} />
            ) : (
              <VideoOptions conditioningImage={conditioningImage} setConditioningImage={setConditioningImage}/>
            )}
          </div>
        </div>

        <div className="mt-5">
          <button
            onClick={onGenerate}
            disabled={isLoading || !prompt.trim()}
            className={`w-full py-3 px-4 rounded-xl text-lg font-semibold text-white transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#16161a] focus:ring-purple-500
                       ${isLoading || !prompt.trim() 
                         ? 'bg-slate-700/50 cursor-not-allowed text-slate-400' 
                         : 'bg-[#3A3549] hover:bg-[#4a455c]'
                       }`}
          >
           {renderGenerateButtonContent()}
          </button>
        </div>
      </div>
    </GlassCard>
  );
};