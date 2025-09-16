


import React from 'react';
import { AspectRatio } from './types';
import { PhotoIcon } from './components/icons/PhotoIcon';
import { AnimeIcon } from './components/icons/AnimeIcon';
import { FantasyArtIcon } from './components/icons/FantasyArtIcon';
import { PixelArtIcon } from './components/icons/PixelArtIcon';
import { ModernMinimalisticIcon } from './components/icons/ModernMinimalisticIcon';
import { UltraRealisticIcon } from './components/icons/UltraRealisticIcon';
import { ThreeDRenderIcon } from './components/icons/ThreeDRenderIcon';
import { ThreeDRenderLuxuryIcon } from './components/icons/ThreeDRenderLuxuryIcon';
import { ThreeDIllustrationIcon } from './components/icons/ThreeDIllustrationIcon';
import { ThreeDIconIcon } from './components/icons/ThreeDIconIcon';
import { ThreeDClayIcon } from './components/icons/ThreeDClayIcon';
import { ThreeDWoodenIcon } from './components/icons/ThreeDWoodenIcon';
import { ThreeDMinimalistPastelIcon } from './components/icons/ThreeDMinimalistPastelIcon';
import { ThreeDCuteIcon } from './components/icons/ThreeDCuteIcon';
import { ThreeDNatureIcon } from './components/icons/ThreeDNatureIcon';
import { ThreeDCloudIcon } from './components/icons/ThreeDCloudIcon';


export const VEO_LOADING_MESSAGES: string[] = [
  'Warming up the creative engines...',
  'Gathering pixels and photons...',
  'Directing the digital actors...',
  'Rendering the first few frames...',
  'This can take a few minutes, good things come to those who wait!',
  'Applying cinematic color grading...',
  'Composing the perfect shot...',
  'Almost there, the masterpiece is nearly complete...'
];

export const IMAGE_ASPECT_RATIOS: AspectRatio[] = ['1:1', '16:9', '9:16', '4:3', '3:4'];

export const IMAGE_STYLE_PRESETS: { name: string; icon: React.FC<{className?: string}> }[] = [
    { name: 'Photorealistic', icon: PhotoIcon },
    { name: 'Anime', icon: AnimeIcon },
    { name: 'Fantasy Art', icon: FantasyArtIcon },
    { name: 'Pixel Art', icon: PixelArtIcon },
    { name: 'Modern Minimalistic', icon: ModernMinimalisticIcon },
    { name: 'Ultra Realistic', icon: UltraRealisticIcon },
    { name: '3D Render', icon: ThreeDRenderIcon },
    { name: '3D Render Luxury', icon: ThreeDRenderLuxuryIcon },
    { name: '3D Illustration', icon: ThreeDIllustrationIcon },
    { name: '3D Icon', icon: ThreeDIconIcon },
    { name: '3D Clay Icon', icon: ThreeDClayIcon },
    { name: '3D Wooden Icon', icon: ThreeDWoodenIcon },
    { name: '3D Minimalist Pastel', icon: ThreeDMinimalistPastelIcon },
    { name: '3D Cute Icon', icon: ThreeDCuteIcon },
    { name: '3D Nature', icon: ThreeDNatureIcon },
    { name: '3D Cloud Icon', icon: ThreeDCloudIcon },
];


// VEO Prompt Generator Options
export const RACE_ETHNICITY_OPTIONS: string[] = [
  'Human', 'Khmer', 'African', 'African American', 'Asian', 'Caucasian', 
  'Hispanic/Latinx', 'Middle Eastern', 'Native American', 'Pacific Islander',
  'South Asian', 'Southeast Asian', 'Mixed Race', 'Elf', 'Dwarf', 'Orc', 'Goblin', 
  'Fairy', 'Robot', 'Cyborg', 'Alien', 'Other'
];

export const GENDER_OPTIONS: string[] = ['Female', 'Male', 'Non-binary', 'Other'];

export const VOICE_OPTIONS: string[] = [
    'Natural', 'Deep', 'High-pitched', 'Raspy', 'Smooth', 'Robotic', 'Child-like', 
    'Elderly', 'Whispering', 'Booming', 'Melodious'
];

export const LIGHTING_OPTIONS: string[] = [
    'Cinematic', 'Film noir', 'Golden hour', 'Blue hour', 'Backlight', 'Studio lighting',
    'Natural light', 'Moonlight', 'Candlelight', 'Neon', 'Hard lighting', 'Soft lighting',
    'High-key', 'Low-key'
];

export const CAMERA_ANGLE_OPTIONS: string[] = [
    'Eye-level shot', 'Low-angle shot', 'High-angle shot', 'Over-the-shoulder shot',
    'Bird\'s-eye view', 'Worm\'s-eye view', 'Dutch angle', 'Point-of-view (POV)',
    'Close-up', 'Medium shot', 'Long shot', 'Extreme close-up', 'Wide shot'
];

export const SHOOTING_STYLE_OPTIONS: string[] = [
    'Handheld', 'Steadicam', 'Tripod shot', 'Drone shot', 'Found footage',
    'Documentary style', 'Time-lapse', 'Slow motion', 'Single take', 'Rack focus',
    'Wes Anderson style', 'Quentin Tarantino style', 'David Fincher style'
];

export const MOVIE_GENRE_OPTIONS: string[] = [
    'Sci-Fi', 'Fantasy', 'Horror', 'Action', 'Adventure', 'Comedy', 'Drama', 'Thriller',
    'Mystery', 'Romance', 'Western', 'Cyberpunk', 'Post-Apocalyptic'
];

export const TRANSLATION_LANGUAGE_OPTIONS: string[] = [
    'English', 'Spanish', 'French', 'German', 'Chinese (Simplified)', 'Japanese', 
    'Korean', 'Russian', 'Portuguese', 'Italian', 'Dutch', 'Arabic', 'Hindi',
    'Bengali', 'Urdu', 'Indonesian', 'Turkish', 'Vietnamese', 'Khmer'
];

export const ASMR_TRIGGER_OPTIONS: string[] = [
    'Whispering', 'Tapping', 'Crinkling', 'Page Turning', 'Typing', 'Brushing',
    'Liquid Sounds', 'Soft Speaking', 'Scratching', 'Sticky Sounds', 'Personal Attention',
    'Keyboard Sounds', 'Water Sounds', 'Eating Sounds', 'Fabric Sounds'
];
