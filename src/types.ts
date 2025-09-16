



export enum GeneratorMode {
  HOME = 'HOME',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  VEO_PROMPT = 'VEO_PROMPT',
  IMAGE_GRADER = 'IMAGE_GRADER',
  TEXT_TOOLKIT = 'TEXT_TOOLKIT',
  PROMPT_STUDIO = 'PROMPT_STUDIO',
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
  filename: string;
}

export interface GeneratedVideo {
  src: string;
  prompt:string;
  filename: string;
}

// VEO Prompt Generator Types
export interface VEOCharacter {
    id: string;
    name: string;
    race: string;
    gender: string;
    age: string;
    outfit: string;
    hairstyle: string;
    voice: string;
    description: string;
    action: string;
}

export interface VEODialogue {
    id:string;
    characterId: string;
    dialogue: string;
}

export interface VEOEnvironment {
    description: string;
    lighting: string;
    cameraAngle: string;
    shootingStyle: string;
}

// Bulk Image Grader Types
export interface GradedImage {
  id: string;
  file: File;
  base64: string;
  status: 'PENDING' | 'GRADING' | 'GRADED' | 'ENHANCING' | 'TAGGING' | 'ERROR';
  acceptanceProbability: number | null;
  feedback: string;
  rejectionReasons: string[];
  title?: string;
  keywords?: string[];
}


// Movie Prompt Generator Types
export interface MovieCharacter {
  name: string;
  description: string;
}

export interface DialogueLine {
  character: string;
  voice_description: string;
  line: string;
}

export interface MovieScene {
  id: string;
  scene_number: number;
  principal_character_description: string;
  scene_action: string;
  cinematography: string;
  dialogue: DialogueLine[];
  characters_present: string[];
}

// RC Crawler Prompt Generator Types
export type ShotType = 'Establishing Shot' | 'Action Shot' | 'Detail Shot' | 'Hero Shot' | 'Any';

export interface RCCrawlerCharacter {
  id: string;
  name: string;
  model: string;
  color: string;
  modifications: string;
}

export interface RCCrawlerScene {
  id: string;
  scene_number: number;
  crawler_description: string; // Scene-specific description
  scene_action: string;
  environment: string;
  cinematography: string;
  crawlers_present: string[];
}

// ASMR Prompt Generator Types
export interface ASMRCharacter {
    id: string;
    name: string;
    description: string;
}

export interface ASMRScene {
    id: string;
    scene_number: number;
    timestamp: string;
    action_description: string;
    sound_description: string;
    visual_description: string;
    triggers_present: string[];
}
