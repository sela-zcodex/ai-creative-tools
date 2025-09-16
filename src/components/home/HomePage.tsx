



import React from 'react';
import { GeneratorMode } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { ImageIcon } from '../icons/ImageIcon';
import { VideoIcon } from '../icons/VideoIcon';
import { TagIcon } from '../icons/TagIcon';
import { PromptIcon } from '../icons/PromptIcon';
import { TextIcon } from '../icons/TextIcon';


interface HomePageProps {
  setMode: (mode: GeneratorMode) => void;
}

interface Tool {
    name: string;
    description: string;
    icon: React.ReactNode;
    mode: GeneratorMode;
    guide: string[];
}

const tools: Tool[] = [
    {
        name: 'Image Generator',
        description: 'Create stunning, high-quality images from simple text descriptions using the Imagen model.',
        icon: <ImageIcon className="w-8 h-8 text-purple-300" />,
        mode: GeneratorMode.IMAGE,
        guide: [
            "Write a detailed prompt describing the image you want.",
            "Choose your desired aspect ratio and number of images.",
            "Click 'Generate' and watch your vision come to life."
        ]
    },
    {
        name: 'Video Generator',
        description: 'Produce dynamic video clips from text prompts or by animating a source image with the VEO model.',
        icon: <VideoIcon className="w-8 h-8 text-purple-300" />,
        mode: GeneratorMode.VIDEO,
        guide: [
            "Describe the scene and action for your video.",
            "Optionally, upload a 'conditioning image' to guide the style.",
            "Click 'Generate' and wait for the AI to render your video."
        ]
    },
    {
        name: 'Image Grader & Tagger',
        description: 'Grade image quality for stock sites, enhance rejected photos, and generate titles & keywords for accepted ones.',
        icon: <TagIcon className="w-8 h-8 text-purple-300" />,
        mode: GeneratorMode.IMAGE_GRADER,
        guide: [
            "Upload images for evaluation and grading.",
            "Click 'Grade Images' to get acceptance scores and feedback.",
            "For accepted images, click 'Generate Title & Tags' to get metadata.",
            "For rejected images, use the 'Enhance' option to improve them."
        ]
    },
     {
        name: 'AI Text Toolkit',
        description: 'A versatile set of tools to correct, translate, and synthesize text for any creative project.',
        icon: <TextIcon className="w-8 h-8 text-purple-300" />,
        mode: GeneratorMode.TEXT_TOOLKIT,
        guide: [
            "Select a mode: Corrector, Translator, or Text to Speech.",
            "Enter your text in the input box on the left.",
            "Use the controls to process the text and see the result on the right."
        ]
    },
    {
        name: 'VEO Prompt Helper',
        description: 'Construct complex, detailed prompts for the VEO video model using a structured, form-based editor.',
        icon: <PromptIcon className="w-8 h-8 text-purple-300" />,
        mode: GeneratorMode.VEO_PROMPT,
        guide: [
            "Define your characters, including their appearance and actions.",
            "Write dialogue for your characters and describe the environment.",
            "Copy the generated English, Khmer, or JSON prompt for use."
        ]
    },
    {
        name: 'Prompt Studio',
        description: 'A suite of specialized tools to generate detailed scripts for Movies, RC Crawlers, and ASMR videos.',
        icon: <PromptIcon className="w-8 h-8 text-purple-300" />,
        mode: GeneratorMode.PROMPT_STUDIO,
        guide: [
            "Select a specialized studio (Movie, RC Crawler, ASMR).",
            "Fill in the concept details and character/vehicle information.",
            "Generate, extend, and refine scenes to build a full video script."
        ]
    },
];


const ToolCard: React.FC<{ tool: Tool, onLaunch: () => void }> = ({ tool, onLaunch }) => (
    <GlassCard className="flex flex-col h-full hover:border-purple-400/50 transition-colors duration-300">
        <div className="p-6 flex-grow">
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-purple-500/10 p-3 rounded-lg border border-purple-400/20">
                    {tool.icon}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-100">{tool.name}</h3>
                    <p className="text-slate-400 mt-1 text-sm">{tool.description}</p>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
                <h4 className="text-sm font-semibold text-slate-200 mb-2">How to Use:</h4>
                <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-400">
                    {tool.guide.map((step, index) => <li key={index}>{step}</li>)}
                </ul>
            </div>
        </div>
        <div className="p-4 bg-black/20 rounded-b-xl mt-auto">
            <button
                onClick={onLaunch}
                className="w-full py-2 px-4 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-colors"
            >
                Launch Tool
            </button>
        </div>
    </GlassCard>
);


export const HomePage: React.FC<HomePageProps> = ({ setMode }) => {
  return (
    <div className="animate-fade-in">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-100 sm:text-5xl">
                Welcome to the GEN-SELA Creative Suite
            </h1>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                Your all-in-one platform for generating stunning visuals and detailed creative prompts with the power of Google's AI. Select a tool below to begin.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.sort((a,b) => a.name.localeCompare(b.name)).map(tool => (
                <ToolCard key={tool.name} tool={tool} onLaunch={() => setMode(tool.mode)} />
            ))}
        </div>
    </div>
  );
};
