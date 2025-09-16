


import React, { useState, useCallback, useEffect, useRef } from 'react';
import { PromptBuilder } from './components/generator/PromptBuilder';
import { OutputDisplay } from './components/generator/OutputDisplay';
import { Header } from './components/layout/Header';
import { 
    initializeAiClient, generateImage, generateVideo, pollVideoStatus, 
    fetchVideoBlob, translateText, gradeImage, generateTitleAndTagsForImage,
    generateSynopsisAndCharacters, generateSceneBreakdown, extendMovieScene, generateNextScene, correctText, generateSpeech, type VideosOperation, 
    generateRCCrawlerConcept, extendRCCrawlerScene, generateNextRCCrawlerScene, enhanceRCConcept, enhanceImage,
    generateASMRConcept, extendASMRScene, generateNextASMRScene
} from './services/geminiService';
import { 
    GeneratorMode, LoadingState, GeneratedImage, GeneratedVideo, ImageConfig, 
    VEOCharacter, VEODialogue, VEOEnvironment, GradedImage, MovieCharacter, MovieScene, RCCrawlerCharacter, RCCrawlerScene, ShotType,
    ASMRCharacter, ASMRScene
} from './types';
import { VEO_LOADING_MESSAGES, MOVIE_GENRE_OPTIONS } from './constants';
import { SettingsModal } from './components/modals/SettingsModal';
import { Toast } from './components/ui/Toast';
import { ImageLightbox } from './components/modals/ImageLightbox';
import { VeoPromptGenerator } from './components/veo/VeoPromptGenerator';
import { VeoPromptOutput } from './components/veo/VeoPromptOutput';
import { BulkImageTagger } from './components/tagger/BulkImageTagger';
import { v4 as uuidv4 } from 'uuid';
import { Footer } from './components/layout/Footer';
import { MoviePromptGenerator } from './components/movie/MoviePromptGenerator';
import { HomePage } from './components/home/HomePage';
import { TextToolkit } from './components/text/TextToolkit';
import { RCCrawlerPromptGenerator } from './components/rc_crawler/RCCrawlerPromptGenerator';
import { PromptStudioHomePage } from './components/prompt_studio/PromptStudioHomePage';
import { ASMRPromptGenerator } from './components/asmr/ASMRPromptGenerator';

interface ParsedError {
  panelMessage: string;
  toast: {
    message: string;
    action?: {
      text: string;
      onClick: () => void;
    }
  } | null;
}

interface BatchProgress {
    current: number;
    total: number;
    batch: number;
    totalBatches: number;
}

type PromptStudioMode = 'home' | 'movie' | 'rc_crawler' | 'asmr';


// Debounce hook
function useDebounce(value: any, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}


const App: React.FC = () => {
  const [mode, setMode] = useState<GeneratorMode>(GeneratorMode.HOME);
  const [prompt, setPrompt] = useState<string>('');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);

  const [imageConfig, setImageConfig] = useState<ImageConfig>({
    numberOfImages: 4,
    aspectRatio: '1:1',
  });
  const [conditioningImage, setConditioningImage] = useState<{ file: File, base64: string } | null>(null);

  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; action?: { text: string; onClick: () => void; } } | null>(null);
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null);
  const cancelGenerationRef = useRef(false);


  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null);

  // VEO Prompt State
  const [characters, setCharacters] = useState<VEOCharacter[]>([]);
  const [dialogues, setDialogues] = useState<VEODialogue[]>([]);
  const [environment, setEnvironment] = useState<VEOEnvironment>({
    description: '',
    lighting: '',
    cameraAngle: '',
    shootingStyle: '',
  });
  const [veoPrompts, setVeoPrompts] = useState({ khmer: '', english: '', json: '' });
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Image Grader State
  const [gradedImages, setGradedImages] = useState<GradedImage[]>([]);
  const [isGrading, setIsGrading] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  
  // Prompt Studio State
  const [promptStudioMode, setPromptStudioMode] = useState<PromptStudioMode>('home');
  const [extendingSceneId, setExtendingSceneId] = useState<string | null>(null);
  const [isAddingScene, setIsAddingScene] = useState<boolean>(false);
  
  // Movie Prompt State
  const [movieTitle, setMovieTitle] = useState('');
  const [movieGenre, setMovieGenre] = useState<string>(MOVIE_GENRE_OPTIONS[0]);
  const [movieSynopsis, setMovieSynopsis] = useState('');
  const [fullStory, setFullStory] = useState('');
  const [movieCharacters, setMovieCharacters] = useState<MovieCharacter[]>([]);
  const [movieScenes, setMovieScenes] = useState<MovieScene[]>([]);
  
  // Text Toolkit State
  const [textToolkitInput, setTextToolkitInput] = useState('');
  const [textToolkitOutput, setTextToolkitOutput] = useState('');
  const [textToolkitLoading, setTextToolkitLoading] = useState(false);
  const [suggestedVoice, setSuggestedVoice] = useState('');

  // RC Crawler State
  const [rcConcept, setRCConcept] = useState('');
  const [isEnhancingConcept, setIsEnhancingConcept] = useState(false);
  const [rcCrawlers, setRCCrawlers] = useState<RCCrawlerCharacter[]>([]);
  const [rcScenes, setRCScenes] = useState<RCCrawlerScene[]>([]);

  // ASMR State
  const [asmrConcept, setASMRConcept] = useState('');
  const [asmrTriggers, setASMRTriggers] = useState<string[]>([]);
  const [asmrSetting, setASMRSetting] = useState('');
  const [asmrCharacters, setASMRCharacters] = useState<ASMRCharacter[]>([]);
  const [asmrScenes, setASMRScenes] = useState<ASMRScene[]>([]);


  const debouncedVeoInputs = useDebounce({ characters, dialogues, environment }, 500);

  const parseApiError = (e: unknown): ParsedError => {
    const defaultError = {
      panelMessage: 'An unexpected error occurred. Please check the console for details.',
      toast: null
    };

    if (e instanceof Error) {
        const errorMessage = e.message.toLowerCase();
        
        if (errorMessage.includes('api key not valid')) {
            return {
                panelMessage: 'The provided API key is invalid or has expired. Please check your key in the settings.',
                toast: {
                    message: 'Your Google Gemini API key is invalid.',
                    action: { text: 'Open Settings', onClick: () => setIsSettingsOpen(true) }
                }
            };
        }
        
        if (errorMessage.includes('quota') || errorMessage.includes('resource_exhausted')) {
             return {
                panelMessage: `You have exceeded your current quota. Please check your plan and billing details. For more information, visit the Google AI documentation.`,
                toast: {
                    message: 'API quota exceeded. Please check your plan and billing details.',
                    action: { text: 'Get started', onClick: () => window.open('https://ai.google.dev/pricing', '_blank') }
                }
            };
        }
        
        if (errorMessage.includes('api client not initialized')) {
             return {
                panelMessage: 'Please set your Google Gemini API key in the settings to start generating.',
                toast: {
                    message: 'Please set your API key to continue.',
                    action: { text: 'Open Settings', onClick: () => setIsSettingsOpen(true) }
                }
            };
        }

        return { ...defaultError, panelMessage: e.message };
    }
    
    return defaultError;
  };

  const handleApiError = (e: unknown) => {
    console.error("API Error caught:", e);
    const parsed = parseApiError(e);
    if (parsed.toast) {
        setToast(parsed.toast);
    } else {
        setToast({ message: parsed.panelMessage });
    }
  };


  useEffect(() => {
    const storedApiKey = localStorage.getItem('gemini-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      initializeAiClient(storedApiKey);
    } else {
      setIsSettingsOpen(true);
    }
  }, []);
  
  useEffect(() => {
    if (mode !== GeneratorMode.PROMPT_STUDIO) {
        setPromptStudioMode('home');
    }
  }, [mode]);

  useEffect(() => {
    const isVeoMode = mode === GeneratorMode.VEO_PROMPT;
    if (!isVeoMode) return;

    const generateEnglishPrompt = () => {
        let parts: string[] = [];
        if (environment.description) parts.push(environment.description);
        
        characters.forEach(c => {
            let charDesc = `${c.description || `${c.age}-year-old ${c.race} ${c.gender}`} wearing ${c.outfit || 'clothes'} with ${c.hairstyle || 'hair'}.`;
            if (c.action) charDesc += ` The character is ${c.action}.`;
            parts.push(charDesc);
        });

        dialogues.forEach(d => {
            const char = characters.find(c => c.id === d.characterId);
            if(char) {
                parts.push(`${char.name || `Character ${char.id.substring(0,4)}`} says: "${d.dialogue}"`);
            }
        });
        
        let sceneDetails: string[] = [];
        if (environment.lighting) sceneDetails.push(`lighting is ${environment.lighting}`);
        if (environment.cameraAngle) sceneDetails.push(`camera angle is ${environment.cameraAngle}`);
        if (environment.shootingStyle) sceneDetails.push(`shot in a ${environment.shootingStyle} style`);
        if (sceneDetails.length > 0) parts.push(`The scene's ${sceneDetails.join(', ')}.`);

        return parts.join(' ');
    };
    
    const englishPrompt = generateEnglishPrompt();
    const jsonPrompt = JSON.stringify({ characters, dialogues, environment }, null, 2);
    setVeoPrompts(prev => ({ ...prev, english: englishPrompt, json: jsonPrompt }));

    if (englishPrompt.trim()) {
        setIsTranslating(true);
        translateText(englishPrompt, 'Khmer').then(translated => {
            setVeoPrompts(prev => ({ ...prev, khmer: translated }));
        }).catch(err => {
            console.error("Translation error:", err);
            handleApiError(err);
            setVeoPrompts(prev => ({ ...prev, khmer: "Error translating prompt." }));
        }).finally(() => {
            setIsTranslating(false);
        });
    } else {
        setVeoPrompts(prev => ({...prev, khmer: ''}));
    }

  }, [debouncedVeoInputs, mode]);


  useEffect(() => {
    let interval: number;
    if (loadingState === LoadingState.POLLING) {
      setLoadingMessage(VEO_LOADING_MESSAGES[0]);
      let messageIndex = 1;
      interval = window.setInterval(() => {
        setLoadingMessage(VEO_LOADING_MESSAGES[messageIndex % VEO_LOADING_MESSAGES.length]);
        messageIndex++;
      }, 5000);
    }
    return () => window.clearInterval(interval);
  }, [loadingState]);
  
  const handleAddCharacter = () => {
    setCharacters(prev => [...prev, {
        id: uuidv4(), name: `Character ${prev.length + 1}`, race: 'Human', gender: 'Female', age: '30',
        outfit: '', hairstyle: '', voice: 'Natural', description: '', action: ''
    }]);
  };

  const handleRemoveCharacter = (id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
    // Also remove associated dialogues
    setDialogues(prev => prev.filter(d => d.characterId !== id));
  };
  
  const handleUpdateCharacter = (id: string, updatedCharacter: VEOCharacter) => {
    setCharacters(prev => prev.map(c => c.id === id ? updatedCharacter : c));
  };

  const handleAddDialogue = () => {
    if (characters.length === 0) {
        setToast({message: "Please add a character first before adding dialogue."});
        return;
    }
    setDialogues(prev => [...prev, { id: uuidv4(), characterId: characters[0].id, dialogue: '' }]);
  };
  
  const handleRemoveDialogue = (id: string) => {
    setDialogues(prev => prev.filter(d => d.id !== id));
  };

  const handleUpdateDialogue = (id: string, updatedDialogue: VEODialogue) => {
    // FIX: `c` was undefined, it should be `d` to return the original item when not updated.
    setDialogues(prev => prev.map(d => d.id === id ? updatedDialogue : d));
  };


  const handleSaveApiKey = useCallback((newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('gemini-api-key', newApiKey);
    initializeAiClient(newApiKey);
    setIsSettingsOpen(false);
    if(error) {
      setLoadingState(LoadingState.IDLE);
      setError(null);
    }
    setToast({ message: "API Key saved successfully." });
  }, [error]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || loadingState === LoadingState.GENERATING || loadingState === LoadingState.POLLING) return;
    
    setLoadingState(LoadingState.GENERATING);
    setError(null);
    setToast(null);
    setGeneratedImages([]);
    setGeneratedVideo(null);
    cancelGenerationRef.current = false;
    
    try {
      if (mode === GeneratorMode.IMAGE) {
        const totalImages = imageConfig.numberOfImages;
        const API_BATCH_SIZE = 8;

        if (totalImages > API_BATCH_SIZE) {
            // Batch generation logic
            const totalBatches = Math.ceil(totalImages / API_BATCH_SIZE);
            let accumulatedImages: GeneratedImage[] = [];

            for (let i = 0; i < totalBatches; i++) {
                if (cancelGenerationRef.current) {
                    setLoadingState(LoadingState.IDLE);
                    break;
                }
                const imagesInThisBatch = Math.min(API_BATCH_SIZE, totalImages - (i * API_BATCH_SIZE));
                setBatchProgress({
                    current: i * API_BATCH_SIZE,
                    total: totalImages,
                    batch: i + 1,
                    totalBatches,
                });

                const batchConfig = { ...imageConfig, numberOfImages: imagesInThisBatch };
                const images = await generateImage(prompt, batchConfig);
                const generated: GeneratedImage[] = images.map((base64, idx) => ({
                    src: base64,
                    prompt,
                    filename: `${prompt.substring(0, 20).replace(/\s+/g, '_')}_${i * API_BATCH_SIZE + idx + 1}.png`
                }));
                accumulatedImages = [...accumulatedImages, ...generated];
                setGeneratedImages(accumulatedImages);
            }
            if (!cancelGenerationRef.current) {
                setLoadingState(LoadingState.SUCCESS);
            }

        } else {
            // Single batch generation
            const images = await generateImage(prompt, imageConfig);
            const generated: GeneratedImage[] = images.map((base64, i) => ({
                src: base64,
                prompt,
                filename: `${prompt.substring(0, 20).replace(/\s+/g, '_')}_${i + 1}.png`
            }));
            setGeneratedImages(generated);
            setLoadingState(LoadingState.SUCCESS);
        }

      } else if (mode === GeneratorMode.VIDEO) {
        setLoadingMessage('Initializing video generation...');
        let operation: VideosOperation = await generateVideo(prompt, conditioningImage?.base64 ?? null);
        setLoadingState(LoadingState.POLLING);
        
        while (!operation.done) {
            if (cancelGenerationRef.current) {
                // Video cancellation is not directly supported by the API after starting.
                // We just stop polling and return to idle state.
                setLoadingState(LoadingState.IDLE);
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await pollVideoStatus(operation);
        }

        if (operation.response?.generatedVideos?.[0]?.video?.uri) {
            const uri = operation.response.generatedVideos[0].video.uri;
            const blob = await fetchVideoBlob(uri, apiKey!);
            const videoUrl = URL.createObjectURL(blob);
            setGeneratedVideo({
                src: videoUrl,
                prompt,
                filename: `${prompt.substring(0, 20).replace(/\s+/g, '_')}.mp4`
            });
            setLoadingState(LoadingState.SUCCESS);
        } else {
            throw new Error('Video generation finished but no video URI was found.');
        }
      }
    } catch (e) {
      console.error(e);
      const parsed = parseApiError(e);
      setError(parsed.panelMessage);
      if (parsed.toast) {
        setToast(parsed.toast);
      }
      setLoadingState(LoadingState.ERROR);
    } finally {
        setBatchProgress(null);
        cancelGenerationRef.current = false;
    }
  }, [prompt, mode, imageConfig, conditioningImage, loadingState, apiKey]);
  
   const handleCancelGeneration = () => {
    cancelGenerationRef.current = true;
  };

  const handleGradeImages = useCallback(async () => {
    setIsGrading(true);
    setToast(null);
    const imagesToGrade = gradedImages.filter(img => img.status === 'PENDING' && img.base64);

    if (imagesToGrade.length === 0) {
        setIsGrading(false);
        return;
    }

    const gradingPromises = imagesToGrade.map(async (image) => {
        setGradedImages(prev => prev.map(img => img.id === image.id ? { ...img, status: 'GRADING' } : img));
        try {
            const { acceptanceProbability, feedback, rejectionReasons } = await gradeImage(image.base64);
            setGradedImages(prev => prev.map(img => 
                img.id === image.id 
                ? { ...img, acceptanceProbability, feedback, rejectionReasons, status: 'GRADED' } 
                : img
            ));
        } catch (e) {
            console.error(`Failed to grade image ${image.file.name}:`, e);
            handleApiError(e);
            setGradedImages(prev => prev.map(img => img.id === image.id ? { ...img, status: 'ERROR' } : img));
        }
    });

    await Promise.all(gradingPromises);
    setIsGrading(false);
  }, [gradedImages, handleApiError]);
  
  const handleEnhanceImage = useCallback(async (imageId: string, reasonsToFix: string[]) => {
    const imageToEnhance = gradedImages.find(img => img.id === imageId);
    if (!imageToEnhance || !imageToEnhance.base64 || reasonsToFix.length === 0) return;
    
    setGradedImages(prev => prev.map(img => img.id === imageId ? { ...img, status: 'ENHANCING' } : img));
    try {
        const enhancedBase64 = await enhanceImage(imageToEnhance.base64, reasonsToFix);
        
        const byteString = atob(enhancedBase64);
        const mimeString = 'image/jpeg';
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const enhancedFile = new File([blob], `enhanced_${imageToEnhance.file.name}`, { type: mimeString });
        
        setGradedImages(prev => prev.map(img =>
            img.id === imageId
                ? { ...img, base64: enhancedBase64, file: enhancedFile, status: 'PENDING', acceptanceProbability: null, feedback: '', rejectionReasons: [], title: '', keywords: [] }
                : img
        ));
        setToast({ message: `Successfully enhanced ${imageToEnhance.file.name}. It is now ready for re-grading.` });
    } catch (e) {
        console.error(`Failed to enhance image ${imageToEnhance.file.name}:`, e);
        handleApiError(e);
        setGradedImages(prev => prev.map(img => img.id === imageId ? { ...img, status: 'ERROR' } : img));
    }
  }, [gradedImages, handleApiError]);

  const handleGenerateAllMetadata = useCallback(async () => {
    const imagesToTag = gradedImages.filter(img => 
        img.status === 'GRADED' && 
        (img.acceptanceProbability ?? 0) >= 50 && 
        !img.title &&
        img.base64
    );

    if (imagesToTag.length === 0) return;

    setIsTagging(true);
    setToast({ message: `Starting metadata generation for ${imagesToTag.length} images...` });

    for (const imageToTag of imagesToTag) {
        try {
            setGradedImages(prev => prev.map(img => img.id === imageToTag.id ? { ...img, status: 'TAGGING' } : img));
            const { title, keywords } = await generateTitleAndTagsForImage(imageToTag.base64);
            setGradedImages(prev => prev.map(img =>
                img.id === imageToTag.id
                    ? { ...img, title, keywords, status: 'GRADED' }
                    : img
            ));
        } catch (e) {
            console.error(`Failed to generate tags for image ${imageToTag.file.name}:`, e);
            handleApiError(e);
            setGradedImages(prev => prev.map(img => img.id === imageToTag.id ? { ...img, status: 'ERROR' } : img));
        }
    }
    
    setIsTagging(false);
    setToast({ message: `Finished generating metadata.` });
}, [gradedImages, handleApiError]);


  const handleDownloadCsv = () => {
    const imagesWithMetadata = gradedImages.filter(img => img.title && img.keywords);
    if (imagesWithMetadata.length === 0) {
        setToast({ message: 'No images with metadata to export.' });
        return;
    }

    const header = ['Filename', 'Title', 'Keywords', 'AcceptanceProbability', 'Feedback', 'RejectionReasons'];
    const rows = imagesWithMetadata.map(img => {
        const filename = `"${img.file.name.replace(/"/g, '""')}"`;
        const title = `"${img.title?.replace(/"/g, '""') ?? ''}"`;
        const keywords = `"${img.keywords?.join(', ').replace(/"/g, '""') ?? ''}"`;
        const probability = img.acceptanceProbability ?? '';
        const feedback = `"${img.feedback.replace(/"/g, '""')}"`;
        const reasons = `"${img.rejectionReasons.join(', ').replace(/"/g, '""')}"`;
        return [filename, title, keywords, probability, feedback, reasons].join(',');
    });

    const csvContent = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'image_metadata.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearAllImages = () => {
    setGradedImages([]);
  };

  const handleGenerateMovieScript = useCallback(async () => {
    if (!movieTitle.trim()) return;
    setLoadingState(LoadingState.GENERATING);
    setError(null);
    setToast(null);
    setMovieSynopsis('');
    setFullStory('');
    setMovieCharacters([]);
    setMovieScenes([]);

    try {
      setLoadingMessage('Generating synopsis and characters...');
      const { synopsis, characters, fullStory } = await generateSynopsisAndCharacters(movieTitle, movieGenre);
      setMovieSynopsis(synopsis);
      setFullStory(fullStory);
      setMovieCharacters(characters);

      setLoadingMessage('Writing scene breakdown...');
      const { scenes } = await generateSceneBreakdown(synopsis, characters, fullStory);
      const scenesWithIds = scenes.map(scene => ({...scene, id: uuidv4() }));
      setMovieScenes(scenesWithIds);
      
      setLoadingState(LoadingState.SUCCESS);
    } catch (e) {
      console.error(e);
      const parsed = parseApiError(e);
      setError(parsed.panelMessage);
      if (parsed.toast) setToast(parsed.toast);
      setLoadingState(LoadingState.ERROR);
    } finally {
      setLoadingMessage('');
    }
  }, [movieTitle, movieGenre]);

  const handleExtendScene = useCallback(async (sceneId: string) => {
    if (extendingSceneId || isAddingScene) return;
    const sceneToExtend = movieScenes.find(s => s.id === sceneId);
    if (!sceneToExtend) return;

    setExtendingSceneId(sceneId);
    setToast(null);
    try {
        const extendedData = await extendMovieScene(movieSynopsis, movieCharacters, fullStory, sceneToExtend);
        setMovieScenes(prevScenes => 
            prevScenes.map(scene => 
                scene.id === sceneId ? { ...scene, ...extendedData } : scene
            )
        );
    } catch (e) {
        console.error("Error extending scene:", e);
        handleApiError(e);
    } finally {
        setExtendingSceneId(null);
    }
  }, [extendingSceneId, isAddingScene, movieScenes, movieSynopsis, movieCharacters, fullStory, handleApiError]);

  const handleAddScene = useCallback(async () => {
    if (isAddingScene || extendingSceneId) return;

    setIsAddingScene(true);
    setToast(null);
    try {
        const newScene = await generateNextScene(movieSynopsis, movieCharacters, fullStory, movieScenes);
        setMovieScenes(prevScenes => [...prevScenes, { ...newScene, id: uuidv4() }]);
    } catch (e) {
        console.error("Error adding new scene:", e);
        handleApiError(e);
    } finally {
        setIsAddingScene(false);
    }
  }, [isAddingScene, extendingSceneId, movieScenes, movieSynopsis, movieCharacters, fullStory, handleApiError]);
  
  const handleCorrectText = useCallback(async () => {
    if (!textToolkitInput.trim() || textToolkitLoading) return;
    setTextToolkitLoading(true);
    setTextToolkitOutput('');
    try {
        const corrected = await correctText(textToolkitInput);
        setTextToolkitOutput(corrected);
    } catch(e) {
        handleApiError(e);
        setTextToolkitOutput('Error correcting text.');
    } finally {
        setTextToolkitLoading(false);
    }
  }, [textToolkitInput, textToolkitLoading, handleApiError]);

  const handleTranslateText = useCallback(async (targetLanguage: string) => {
    if (!textToolkitInput.trim() || textToolkitLoading) return;
    setTextToolkitLoading(true);
    setTextToolkitOutput('');
    try {
        const translated = await translateText(textToolkitInput, targetLanguage);
        setTextToolkitOutput(translated);
    } catch(e) {
        handleApiError(e);
        setTextToolkitOutput('Error translating text.');
    } finally {
        setTextToolkitLoading(false);
    }
  }, [textToolkitInput, textToolkitLoading, handleApiError]);

  const handleSuggestVoice = useCallback(async (text: string, voices: SpeechSynthesisVoice[]) => {
    if (!text.trim() || textToolkitLoading) return;
    setTextToolkitLoading(true);
    setSuggestedVoice('');
    try {
        const voiceOptions = voices.map(v => ({ name: v.name, lang: v.lang, isLocal: v.localService }));
        const bestVoiceName = await generateSpeech(text, voiceOptions);
        
        if (voices.some(v => v.name === bestVoiceName)) {
            setSuggestedVoice(bestVoiceName);
            setToast({ message: `AI suggested voice: ${bestVoiceName}`});
        } else {
            console.warn("AI suggested a voice that is not available on this system:", bestVoiceName);
            setToast({ message: "AI suggested a voice not available on your system." });
        }
    } catch(e) {
        handleApiError(e);
    } finally {
        setTextToolkitLoading(false);
    }
  }, [textToolkitLoading, handleApiError]);

  const handleGenerateRCCrawlerScript = useCallback(async () => {
    if (!rcConcept.trim() || rcCrawlers.length === 0) {
        setToast({ message: "Please provide a video concept and at least one RC crawler." });
        return;
    }
    setLoadingState(LoadingState.GENERATING);
    setError(null);
    setToast(null);
    setRCScenes([]);

    try {
      setLoadingMessage('Generating RC crawler scenes...');
      const { scenes } = await generateRCCrawlerConcept(rcConcept, rcCrawlers);
      const scenesWithIds = scenes.map(scene => ({...scene, id: uuidv4() }));
      setRCScenes(scenesWithIds);
      setLoadingState(LoadingState.SUCCESS);
    } catch (e) {
      console.error(e);
      const parsed = parseApiError(e);
      setError(parsed.panelMessage);
      if (parsed.toast) setToast(parsed.toast);
      setLoadingState(LoadingState.ERROR);
    } finally {
      setLoadingMessage('');
    }
  }, [rcConcept, rcCrawlers]);

  const handleExtendRCScene = useCallback(async (sceneId: string) => {
    if (extendingSceneId || isAddingScene) return;
    const sceneToExtend = rcScenes.find(s => s.id === sceneId);
    if (!sceneToExtend) return;

    setExtendingSceneId(sceneId);
    setToast(null);
    try {
        const extendedData = await extendRCCrawlerScene(rcConcept, rcCrawlers, sceneToExtend);
        setRCScenes(prevScenes => 
            prevScenes.map(scene => 
                scene.id === sceneId ? { ...scene, ...extendedData } : scene
            )
        );
    } catch (e) {
        console.error("Error extending RC scene:", e);
        handleApiError(e);
    } finally {
        setExtendingSceneId(null);
    }
  }, [extendingSceneId, isAddingScene, rcScenes, rcConcept, rcCrawlers, handleApiError]);

  const handleAddRCScene = useCallback(async (shotType: ShotType) => {
    if (isAddingScene || extendingSceneId) return;

    setIsAddingScene(true);
    setToast(null);
    try {
        const newScene = await generateNextRCCrawlerScene(rcConcept, rcCrawlers, rcScenes, shotType);
        setRCScenes(prevScenes => [...prevScenes, { ...newScene, id: uuidv4() }]);
    } catch (e) {
        console.error("Error adding new RC scene:", e);
        handleApiError(e);
    } finally {
        setIsAddingScene(false);
    }
  }, [isAddingScene, extendingSceneId, rcScenes, rcConcept, rcCrawlers, handleApiError]);
  
  const handleEnhanceRCConcept = useCallback(async () => {
    if (!rcConcept.trim() || isEnhancingConcept) return;
    setIsEnhancingConcept(true);
    try {
        const enhanced = await enhanceRCConcept(rcConcept);
        setRCConcept(enhanced);
    } catch(e) {
        handleApiError(e);
    } finally {
        setIsEnhancingConcept(false);
    }
  }, [rcConcept, isEnhancingConcept, handleApiError]);

  // ASMR Handlers
  const handleGenerateASMRScript = useCallback(async () => {
    if (!asmrConcept.trim() || asmrTriggers.length === 0) {
        setToast({ message: "Please provide a video concept and at least one ASMR trigger." });
        return;
    }
    setLoadingState(LoadingState.GENERATING);
    setError(null);
    setToast(null);
    setASMRScenes([]);

    try {
      setLoadingMessage('Generating ASMR scenes...');
      const { scenes } = await generateASMRConcept(asmrConcept, asmrTriggers, asmrSetting, asmrCharacters);
      const scenesWithIds = scenes.map(scene => ({...scene, id: uuidv4() }));
      setASMRScenes(scenesWithIds);
      setLoadingState(LoadingState.SUCCESS);
    } catch (e) {
      console.error(e);
      const parsed = parseApiError(e);
      setError(parsed.panelMessage);
      if (parsed.toast) setToast(parsed.toast);
      setLoadingState(LoadingState.ERROR);
    } finally {
      setLoadingMessage('');
    }
  }, [asmrConcept, asmrTriggers, asmrSetting, asmrCharacters]);
  
  const handleExtendASMRScene = useCallback(async (sceneId: string) => {
    if (extendingSceneId || isAddingScene) return;
    const sceneToExtend = asmrScenes.find(s => s.id === sceneId);
    if (!sceneToExtend) return;

    setExtendingSceneId(sceneId);
    setToast(null);
    try {
        const extendedData = await extendASMRScene(asmrConcept, sceneToExtend);
        setASMRScenes(prevScenes => 
            prevScenes.map(scene => 
                scene.id === sceneId ? { ...scene, ...extendedData } : scene
            )
        );
    } catch (e) {
        console.error("Error extending ASMR scene:", e);
        handleApiError(e);
    } finally {
        setExtendingSceneId(null);
    }
  }, [extendingSceneId, isAddingScene, asmrScenes, asmrConcept, handleApiError]);
  
  const handleAddASMRScene = useCallback(async () => {
    if (isAddingScene || extendingSceneId) return;
    setIsAddingScene(true);
    setToast(null);
    try {
        const newScene = await generateNextASMRScene(asmrConcept, asmrScenes);
        setASMRScenes(prevScenes => [...prevScenes, { ...newScene, id: uuidv4() }]);
    } catch (e) {
        console.error("Error adding new ASMR scene:", e);
        handleApiError(e);
    } finally {
        setIsAddingScene(false);
    }
  }, [isAddingScene, extendingSceneId, asmrScenes, asmrConcept, handleApiError]);


  const renderCurrentMode = () => {
    switch (mode) {
        case GeneratorMode.HOME:
             return (
                <div className="lg:col-span-5">
                    <HomePage setMode={setMode} />
                </div>
            );
        case GeneratorMode.VEO_PROMPT:
            return (
                <>
                    <div className="lg:col-span-2 self-start sticky top-6">
                        <VeoPromptGenerator
                            characters={characters}
                            dialogues={dialogues}
                            environment={environment}
                            onAddCharacter={handleAddCharacter}
                            onRemoveCharacter={handleRemoveCharacter}
                            onUpdateCharacter={handleUpdateCharacter}
                            onAddDialogue={handleAddDialogue}
                            onRemoveDialogue={handleRemoveDialogue}
                            onUpdateDialogue={handleUpdateDialogue}
                            setEnvironment={setEnvironment}
                        />
                    </div>
                    <div className="lg:col-span-3 min-w-0">
                        <VeoPromptOutput
                            prompts={veoPrompts}
                            isTranslating={isTranslating}
                        />
                    </div>
                </>
            );
        case GeneratorMode.IMAGE_GRADER:
            return (
                <div className="lg:col-span-5">
                    <BulkImageTagger
                        images={gradedImages}
                        setImages={setGradedImages}
                        onStartGrader={handleGradeImages}
                        isGrading={isGrading}
                        onError={handleApiError}
                        onEnhance={handleEnhanceImage}
                        onClearAll={handleClearAllImages}
                        onGenerateAllMetadata={handleGenerateAllMetadata}
                        isTagging={isTagging}
                        onDownloadCsv={handleDownloadCsv}
                    />
                </div>
            );
        case GeneratorMode.PROMPT_STUDIO:
            return (
                <div className="lg:col-span-5">
                    {promptStudioMode === 'home' && <PromptStudioHomePage setPromptStudioMode={setPromptStudioMode} />}
                    {promptStudioMode === 'movie' && (
                        <MoviePromptGenerator 
                            title={movieTitle}
                            setTitle={setMovieTitle}
                            genre={movieGenre}
                            setGenre={setMovieGenre}
                            synopsis={movieSynopsis}
                            fullStory={fullStory}
                            characters={movieCharacters}
                            scenes={movieScenes}
                            onGenerate={handleGenerateMovieScript}
                            onExtendScene={handleExtendScene}
                            onAddScene={handleAddScene}
                            onBack={() => setPromptStudioMode('home')}
                            loadingState={loadingState}
                            loadingMessage={loadingMessage}
                            error={error}
                            extendingSceneId={extendingSceneId}
                            isAddingScene={isAddingScene}
                        />
                    )}
                    {promptStudioMode === 'rc_crawler' && (
                         <RCCrawlerPromptGenerator
                            concept={rcConcept}
                            setConcept={setRCConcept}
                            crawlers={rcCrawlers}
                            setCrawlers={setRCCrawlers}
                            scenes={rcScenes}
                            onGenerate={handleGenerateRCCrawlerScript}
                            onExtendScene={handleExtendRCScene}
                            onAddScene={handleAddRCScene}
                            onEnhanceConcept={handleEnhanceRCConcept}
                            onBack={() => setPromptStudioMode('home')}
                            isEnhancingConcept={isEnhancingConcept}
                            loadingState={loadingState}
                            loadingMessage={loadingMessage}
                            error={error}
                            extendingSceneId={extendingSceneId}
                            isAddingScene={isAddingScene}
                        />
                    )}
                     {promptStudioMode === 'asmr' && (
                         <ASMRPromptGenerator
                            concept={asmrConcept}
                            setConcept={setASMRConcept}
                            triggers={asmrTriggers}
                            setTriggers={setASMRTriggers}
                            setting={asmrSetting}
                            setSetting={setASMRSetting}
                            characters={asmrCharacters}
                            setCharacters={setASMRCharacters}
                            scenes={asmrScenes}
                            onGenerate={handleGenerateASMRScript}
                            onExtendScene={handleExtendASMRScene}
                            onAddScene={handleAddASMRScene}
                            onBack={() => setPromptStudioMode('home')}
                            loadingState={loadingState}
                            loadingMessage={loadingMessage}
                            error={error}
                            extendingSceneId={extendingSceneId}
                            isAddingScene={isAddingScene}
                        />
                    )}
                </div>
            );
        case GeneratorMode.TEXT_TOOLKIT:
            return (
                <div className="lg:col-span-5">
                    <TextToolkit
                        inputText={textToolkitInput}
                        setInputText={setTextToolkitInput}
                        outputText={textToolkitOutput}
                        setOutpuText={setTextToolkitOutput}
                        isLoading={textToolkitLoading}
                        onCorrect={handleCorrectText}
                        onTranslate={handleTranslateText}
                        onSuggestVoice={handleSuggestVoice}
                        suggestedVoice={suggestedVoice}
                    />
                </div>
            );
        case GeneratorMode.IMAGE:
        case GeneratorMode.VIDEO:
        default:
            return (
                <>
                    <div className="lg:col-span-2 self-start sticky top-6">
                        <PromptBuilder
                            mode={mode}
                            prompt={prompt}
                            setPrompt={setPrompt}
                            imageConfig={imageConfig}
                            setImageConfig={setImageConfig}
                            conditioningImage={conditioningImage}
                            setConditioningImage={setConditioningImage}
                            onGenerate={handleGenerate}
                            isLoading={loadingState === LoadingState.GENERATING || loadingState === LoadingState.POLLING}
                            batchProgress={batchProgress}
                            onCancel={handleCancelGeneration}
                            onError={handleApiError}
                        />
                    </div>
                    <div className="lg:col-span-3 min-w-0">
                        <OutputDisplay
                            loadingState={loadingState}
                            loadingMessage={loadingMessage}
                            error={error}
                            generatedImages={generatedImages}
                            generatedVideo={generatedVideo}
                            mode={mode}
                            aspectRatio={imageConfig.aspectRatio}
                            onImageClick={setLightboxImage}
                        />
                    </div>
                </>
            );
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 font-sans relative">
      <Header 
        mode={mode} 
        setMode={setMode} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        apiKeyStatus={!!apiKey}
      />

      <main className="flex-grow container mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6 lg:items-start">
        {renderCurrentMode()}
      </main>
      
      <Footer />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveApiKey}
      />

      <ImageLightbox
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />

      {toast && (
        <Toast 
          message={toast.message}
          action={toast.action}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default App;