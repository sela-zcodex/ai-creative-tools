import React from 'react';
import { LoadingState, GeneratedImage, GeneratedVideo, GeneratorMode, AspectRatio } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { DownloadIcon } from '../icons/DownloadIcon';
import { ErrorIcon } from '../icons/ErrorIcon';

interface OutputDisplayProps {
  loadingState: LoadingState;
  loadingMessage: string;
  error: string | null;
  generatedImages: GeneratedImage[];
  generatedVideo: GeneratedVideo | null;
  mode: GeneratorMode;
  aspectRatio: AspectRatio;
  onImageClick: (image: GeneratedImage) => void;
}

const CenteredMessage: React.FC<{children: React.ReactNode}> = ({children}) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
        {children}
    </div>
);

const LoadingIndicator: React.FC<{ message: string }> = ({ message }) => (
  <CenteredMessage>
    <svg className="animate-spin h-10 w-10 text-purple-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="text-lg font-medium text-slate-200">{message}</p>
    <p className="text-sm text-slate-400 mt-1">Please wait, the AI is working its magic...</p>
  </CenteredMessage>
);

const WelcomeMessage: React.FC = () => (
    <CenteredMessage>
        <h2 className="text-3xl font-bold mb-2 text-slate-100">Your Creations Appear Here</h2>
        <p className="text-slate-400 max-w-md">Use the panel on the left to describe the image or video you want to create. Your results will be displayed in this area.</p>
    </CenteredMessage>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <CenteredMessage>
         <div className="p-6 bg-red-900/30 rounded-lg border border-red-400/20">
            <ErrorIcon className="h-12 w-12 text-red-400 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-red-300">An Error Occurred</h3>
            <p className="text-red-400 mt-2 max-w-md break-words">{message}</p>
         </div>
    </CenteredMessage>
);

const DownloadButton: React.FC<{ href: string, downloadName: string }> = ({ href, downloadName }) => (
    <a
        href={href}
        download={downloadName}
        className="absolute bottom-4 right-4 p-2.5 bg-black/50 rounded-full text-slate-300 hover:bg-purple-600 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
        aria-label="Download"
    >
        <DownloadIcon className="w-5 h-5"/>
    </a>
);

const ImageGallery: React.FC<{ images: GeneratedImage[], aspectRatio: AspectRatio, onImageClick: (image: GeneratedImage) => void }> = ({ images, aspectRatio, onImageClick }) => {
    const getAspectRatioClass = (ratio: AspectRatio) => {
        switch (ratio) {
            case '16:9': return 'aspect-video';
            case '9:16': return 'aspect-[9/16]';
            case '4:3': return 'aspect-[4/3]';
            case '3:4': return 'aspect-[3/4]';
            case '1:1':
            default:
                return 'aspect-square';
        }
    };

    const gridColsClass = images.length > 1 ? 'sm:grid-cols-2' : 'sm:grid-cols-1';

    return (
        <div className={`p-4 grid grid-cols-1 ${gridColsClass} gap-4 overflow-y-auto h-full`}>
            {images.map((image, index) => (
                <div 
                    key={index} 
                    className={`relative group rounded-lg overflow-hidden shadow-lg border border-white/10 ${getAspectRatioClass(aspectRatio)} cursor-pointer`}
                    onClick={() => onImageClick(image)}
                >
                    <img src={`data:image/png;base64,${image.src}`} alt={image.prompt} className="w-full h-full object-cover"/>
                    <DownloadButton href={`data:image/png;base64,${image.src}`} downloadName={image.filename} />
                </div>
            ))}
        </div>
    );
};


const VideoPlayer: React.FC<{ video: GeneratedVideo }> = ({ video }) => (
    <div className="p-4 flex items-center justify-center h-full">
        <div className="relative group w-full max-w-full aspect-video rounded-lg overflow-hidden shadow-lg border border-white/10">
            <video src={video.src} controls autoPlay loop className="w-full h-full object-contain bg-black" />
            <DownloadButton href={video.src} downloadName={video.filename} />
        </div>
    </div>
);


export const OutputDisplay: React.FC<OutputDisplayProps> = ({ loadingState, loadingMessage, error, generatedImages, generatedVideo, mode, aspectRatio, onImageClick }) => {
  const renderContent = () => {
    switch (loadingState) {
      case LoadingState.GENERATING:
      case LoadingState.POLLING:
        return <LoadingIndicator message={loadingMessage || 'Generating...'} />;
      case LoadingState.ERROR:
        return <ErrorDisplay message={error || 'An unknown error occurred.'} />;
      case LoadingState.SUCCESS:
        if (mode === GeneratorMode.IMAGE && generatedImages.length > 0) {
          return <ImageGallery images={generatedImages} aspectRatio={aspectRatio} onImageClick={onImageClick} />;
        }
        if (mode === GeneratorMode.VIDEO && generatedVideo) {
          return <VideoPlayer video={generatedVideo} />;
        }
        return <WelcomeMessage />;
      case LoadingState.IDLE:
      default:
         if (mode === GeneratorMode.IMAGE && generatedImages.length > 0) {
          return <ImageGallery images={generatedImages} aspectRatio={aspectRatio} onImageClick={onImageClick} />;
        }
        if (mode === GeneratorMode.VIDEO && generatedVideo) {
          return <VideoPlayer video={generatedVideo} />;
        }
        return <WelcomeMessage />;
    }
  };

  return (
    <GlassCard className="h-full">
        <div className="h-full w-full">
            {renderContent()}
        </div>
    </GlassCard>
  );
};