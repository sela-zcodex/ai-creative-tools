
import React, { useCallback, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GradedImage } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { UploadIcon } from '../icons/UploadIcon';
import { ErrorIcon } from '../icons/ErrorIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { XCircleIcon } from '../icons/XCircleIcon';
import { CsvIcon } from '../icons/CsvIcon';


interface BulkImageGraderProps {
  images: GradedImage[];
  setImages: React.Dispatch<React.SetStateAction<GradedImage[]>>;
  onStartGrader: () => void;
  isGrading: boolean;
  onError: (error: unknown) => void;
  onEnhance: (id: string, reasons: string[]) => void;
  onClearAll: () => void;
  onGenerateAllMetadata: () => void;
  isTagging: boolean;
  onDownloadCsv: () => void;
}

const ImageUploader: React.FC<{ onUpload: (files: File[]) => void }> = ({ onUpload }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onUpload(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onUpload(Array.from(e.dataTransfer.files));
  };

  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="mt-1 flex justify-center p-10 bg-[#101013] border-2 border-white/10 border-dashed rounded-xl transition-colors hover:border-purple-400/50"
    >
      <div className="space-y-2 text-center">
        <UploadIcon className="mx-auto h-12 w-12 text-slate-500" />
        <div className="flex text-sm text-slate-400 justify-center items-center">
          <label htmlFor="image-grade-upload" className="relative cursor-pointer bg-slate-700/80 rounded-md font-medium text-purple-300 hover:text-purple-200 px-3 py-1.5 transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2 focus-within:ring-offset-[#101013]">
            <span>Choose files</span>
            <input id="image-grade-upload" name="image-grade-upload" type="file" className="sr-only" accept="image/png, image/jpeg" multiple onChange={handleFileChange} />
          </label>
          <p className="pl-2">or drag and drop</p>
        </div>
        <p className="text-xs text-slate-500">PNG, JPG files are supported</p>
      </div>
    </div>
  );
};


const ImageCard: React.FC<{ image: GradedImage, onEnhance: (id: string, reasons: string[]) => void }> = ({ image, onEnhance }) => {
    const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
    
    const handleReasonToggle = (reason: string) => {
        setSelectedReasons(prev =>
            prev.includes(reason)
                ? prev.filter(r => r !== reason)
                : [...prev, reason]
        );
    };

    const isProcessing = image.status === 'GRADING' || image.status === 'ENHANCING' || image.status === 'TAGGING';
    const isRejected = image.status === 'GRADED' && image.acceptanceProbability !== null && image.acceptanceProbability < 50;

    const getScoreColor = (score: number | null) => {
        if (score === null) return 'bg-slate-600';
        if (score < 40) return 'bg-red-500';
        if (score < 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const scoreColor = getScoreColor(image.acceptanceProbability);

    return (
        <div className={`bg-[#101013] rounded-lg border border-white/10 overflow-hidden flex flex-col relative ${image.status === 'ERROR' ? 'border-red-500/50' : ''}`}>
            {isProcessing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="text-center">
                        <svg className="animate-spin h-8 w-8 text-purple-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-sm font-semibold mt-2 text-slate-200">
                            {image.status === 'GRADING' ? 'Grading...' : 
                             image.status === 'ENHANCING' ? 'Enhancing...' : 
                             'Generating...'}
                        </p>
                    </div>
                </div>
            )}
            {image.status === 'ERROR' && (
                <div className="absolute top-2 right-2 text-red-400 z-10" title="An error occurred">
                   <ErrorIcon className="w-5 h-5"/>
                </div>
            )}
            
            <img src={URL.createObjectURL(image.file)} alt={image.file.name} className="w-full h-40 object-cover" />
            
            <div className="p-3 flex flex-col flex-grow space-y-3">
                <p className="text-xs text-slate-400 break-all truncate" title={image.file.name}>{image.file.name}</p>
                
                {image.status === 'GRADED' && image.acceptanceProbability !== null ? (
                    <div className="space-y-3">
                        {image.title && (
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-slate-300">Title:</p>
                                <p className="text-sm font-semibold text-slate-100">{image.title}</p>
                            </div>
                        )}
                        
                        {image.keywords && image.keywords.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-slate-300">Keywords:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {image.keywords.map((keyword, i) => (
                                        <span key={i} className="text-xs font-semibold text-sky-200 bg-sky-500/10 px-2.5 py-1 rounded-full">
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                           <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-slate-300">Acceptance Probability</span>
                                <span className={`text-sm font-bold ${scoreColor.replace('bg-', 'text-')}`}>{image.acceptanceProbability}%</span>
                           </div>
                           <div className="w-full bg-slate-700/50 rounded-full h-2.5">
                                <div className={`${scoreColor} h-2.5 rounded-full`} style={{ width: `${image.acceptanceProbability}%` }}></div>
                           </div>
                        </div>

                        <div>
                            <p className="text-xs font-medium text-slate-300 mb-1">AI Feedback:</p>
                            <p className="text-xs text-slate-400 p-2 bg-[#0d0d12] rounded-md">{image.feedback}</p>
                        </div>
                        
                        {image.rejectionReasons.length > 0 && (
                            <div>
                                <p className="text-xs font-medium text-slate-300 mb-1.5">Potential Rejection Reasons:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {image.rejectionReasons.map((reason, i) => (
                                        <span key={i} className="flex items-center text-xs font-semibold text-red-300 bg-red-500/10 px-2.5 py-1 rounded-full">
                                            <XCircleIcon className="w-3.5 h-3.5 mr-1.5" />
                                            {reason}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                         {isRejected && (
                             <div className="mt-2 pt-3 border-t border-white/10 space-y-3">
                                <p className="text-xs font-medium text-slate-300">Select enhancements:</p>
                                <div className="flex flex-wrap gap-2">
                                    {image.rejectionReasons.map(reason => (
                                        <button
                                            key={reason}
                                            onClick={() => handleReasonToggle(reason)}
                                            className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors border ${
                                                selectedReasons.includes(reason)
                                                ? 'bg-purple-500/80 border-purple-400 text-white'
                                                : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50'
                                            }`}
                                        >
                                            {reason}
                                        </button>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => onEnhance(image.id, selectedReasons)}
                                    disabled={isProcessing || selectedReasons.length === 0}
                                    className="w-full flex items-center justify-center mt-2 px-3 py-2 bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <SparklesIcon className="w-5 h-5 mr-2"/>
                                    Enhance Selected ({selectedReasons.length})
                                </button>
                            </div>
                         )}

                    </div>
                ) : (
                   <div className="flex-grow flex items-center justify-center">
                     <p className="text-sm text-slate-500">Pending grade...</p>
                   </div>
                )}
            </div>
        </div>
    );
}

export const BulkImageTagger: React.FC<BulkImageGraderProps> = ({ images, setImages, onStartGrader, isGrading, onEnhance, onClearAll, onGenerateAllMetadata, isTagging, onDownloadCsv }) => {

    const handleUpload = useCallback((files: File[]) => {
        const newImages: GradedImage[] = files
            .filter(file => /\.(jpe?g|png)$/i.test(file.name))
            .map(file => {
                const id = uuidv4();
                return { 
                    id, 
                    file, 
                    base64: '', 
                    status: 'PENDING', 
                    acceptanceProbability: null,
                    feedback: '',
                    rejectionReasons: [],
                    title: '',
                    keywords: [],
                };
            });
        
        newImages.forEach(newImage => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                setImages(prev => prev.map(img => img.id === newImage.id ? { ...img, base64 } : img));
            };
            reader.readAsDataURL(newImage.file);
        });

        setImages(prev => [...prev, ...newImages]);
    }, [setImages]);


    const pendingImagesCount = useMemo(() => images.filter(img => img.status === 'PENDING').length, [images]);
    const acceptedUntaggedCount = useMemo(() => images.filter(img => img.status === 'GRADED' && (img.acceptanceProbability ?? 0) >= 50 && !img.title).length, [images]);
    const taggedImagesCount = useMemo(() => images.filter(img => !!img.title).length, [images]);

  return (
    <GlassCard>
      <div className="p-5">
        <h1 className="text-2xl font-bold text-slate-100">Bulk Image Grader & Tagger</h1>
        <p className="text-slate-400 mb-5 text-sm">Get AI feedback on your images, enhance them, and generate metadata to speed up your workflow.</p>
        
        <ImageUploader onUpload={handleUpload} />

        {images.length > 0 && (
            <div className="mt-6 p-4 bg-[#101013] rounded-lg border border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center flex-wrap gap-3">
                    <button
                        onClick={onStartGrader}
                        disabled={isGrading || pendingImagesCount === 0}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-colors disabled:bg-slate-700/50 disabled:cursor-not-allowed"
                    >
                        {isGrading ? 'Grading...' : `Grade All (${pendingImagesCount})`}
                    </button>
                    <button
                        onClick={onGenerateAllMetadata}
                        disabled={isTagging || acceptedUntaggedCount === 0}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors disabled:bg-slate-700/50 disabled:cursor-not-allowed"
                    >
                        {isTagging ? 'Generating...' : `Generate Metadata (${acceptedUntaggedCount})`}
                    </button>
                    <button
                        onClick={onDownloadCsv}
                        disabled={taggedImagesCount === 0}
                        className="flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-500 transition-colors disabled:bg-slate-700/50 disabled:cursor-not-allowed"
                    >
                        <CsvIcon className="w-5 h-5 mr-2" />
                        Download CSV
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <p className="text-sm text-slate-400">{images.length} image{images.length !== 1 ? 's' : ''} loaded.</p>
                    <button onClick={onClearAll} className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors" title="Clear All Images">
                       <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )}
        
        {images.length > 0 && (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                {images.map(image => (
                   <ImageCard key={image.id} image={image} onEnhance={onEnhance} />
                ))}
            </div>
        )}
      </div>
    </GlassCard>
  );
};