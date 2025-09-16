import React from 'react';
import { GeneratedImage } from '../../types';
import { CloseIcon } from '../icons/CloseIcon';
import { GlassCard } from '../ui/GlassCard';

interface ImageLightboxProps {
  image: GeneratedImage | null;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ image, onClose }) => {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
      aria-labelledby="lightbox-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] w-full p-4"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image itself
      >
        <GlassCard className="p-2">
            <img 
                src={`data:image/png;base64,${image.src}`} 
                alt={image.prompt} 
                className="w-full h-full object-contain max-h-[calc(90vh-1rem)]"
            />
        </GlassCard>
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 p-2 text-slate-300 bg-[#16161a] rounded-full hover:bg-purple-600 hover:text-white transition-colors"
          aria-label="Close image view"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};