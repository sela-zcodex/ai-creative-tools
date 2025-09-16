
export enum GeneratorMode {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

export enum LoadingState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  POLLING = 'POLLING', // Specifically for video
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface ImageConfig {
  numberOfImages: number;
  aspectRatio: AspectRatio;
}

export interface GeneratedImage {
  src: string;
  prompt: string;
  // FIX: Add filename property to support download functionality.
  filename: string;
}

export interface GeneratedVideo {
  src: string;
  prompt: string;
  // FIX: Add filename property to support download functionality.
  filename: string;
}
