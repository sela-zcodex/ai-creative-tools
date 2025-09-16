import React, { useState } from 'react';
import { VEOCharacter, VEODialogue, VEOEnvironment } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { CustomSelect } from '../ui/CustomSelect';
import { PlusIcon } from '../icons/PlusIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { ChevronUpIcon } from '../icons/ChevronUpIcon';
import {
  RACE_ETHNICITY_OPTIONS, GENDER_OPTIONS, VOICE_OPTIONS,
  LIGHTING_OPTIONS, CAMERA_ANGLE_OPTIONS, SHOOTING_STYLE_OPTIONS
} from '../../constants';

interface VeoPromptGeneratorProps {
  characters: VEOCharacter[];
  dialogues: VEODialogue[];
  environment: VEOEnvironment;
  onAddCharacter: () => void;
  onRemoveCharacter: (id: string) => void;
  onUpdateCharacter: (id: string, character: VEOCharacter) => void;
  onAddDialogue: () => void;
  onRemoveDialogue: (id: string) => void;
  onUpdateDialogue: (id: string, dialogue: VEODialogue) => void;
  setEnvironment: (environment: VEOEnvironment) => void;
}

const CollapsibleSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="border-b border-white/10 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center py-4 text-left"
            >
                <h2 className="text-xl font-bold text-slate-100">{title}</h2>
                <ChevronUpIcon className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${!isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="pb-6 space-y-4">{children}</div>}
        </div>
    );
};

const FormField: React.FC<{ label: string, children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
        {children}
    </div>
);

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input
        type="text"
        {...props}
        className="w-full bg-[#101013] border border-white/10 rounded-lg py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-colors"
    />
);

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea
        {...props}
        className="w-full bg-[#101013] border border-white/10 rounded-lg py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-colors resize-y"
    />
);

export const VeoPromptGenerator: React.FC<VeoPromptGeneratorProps> = ({
  characters, dialogues, environment,
  onAddCharacter, onRemoveCharacter, onUpdateCharacter,
  onAddDialogue, onRemoveDialogue, onUpdateDialogue,
  setEnvironment,
}) => {
    
    const handleCharacterChange = (id: string, field: keyof VEOCharacter, value: string) => {
        const char = characters.find(c => c.id === id);
        if (char) onUpdateCharacter(id, { ...char, [field]: value });
    };

    const handleDialogueChange = (id: string, field: keyof VEODialogue, value: string) => {
        const dialogue = dialogues.find(d => d.id === id);
        if (dialogue) onUpdateDialogue(id, { ...dialogue, [field]: value });
    };

    const handleEnvironmentChange = (field: keyof VEOEnvironment, value: string) => {
        setEnvironment({ ...environment, [field]: value });
    };

  return (
    <GlassCard>
      <div className="p-5 flex flex-col">
        <CollapsibleSection title="Characters">
            {characters.map((char, index) => (
                <div key={char.id} className="p-4 bg-[#101013] rounded-lg border border-white/10 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-slate-200">Character {index + 1}</h3>
                        <button onClick={() => onRemoveCharacter(char.id)} className="p-1.5 text-slate-400 hover:text-red-400 rounded-full hover:bg-red-500/10">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <FormField label="Name">
                        <TextInput value={char.name} onChange={e => handleCharacterChange(char.id, 'name', e.target.value)} />
                    </FormField>
                    <FormField label="Race/Ethnicity">
                        <CustomSelect options={RACE_ETHNICITY_OPTIONS} value={char.race} onChange={val => handleCharacterChange(char.id, 'race', val)} />
                    </FormField>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Gender">
                            <CustomSelect options={GENDER_OPTIONS} value={char.gender} onChange={val => handleCharacterChange(char.id, 'gender', val)} />
                        </FormField>
                        <FormField label="Age">
                            <TextInput value={char.age} onChange={e => handleCharacterChange(char.id, 'age', e.target.value)} />
                        </FormField>
                    </div>
                    <FormField label="Outfit">
                        <TextInput value={char.outfit} onChange={e => handleCharacterChange(char.id, 'outfit', e.target.value)} />
                    </FormField>
                    <FormField label="Hairstyle">
                        <TextInput value={char.hairstyle} onChange={e => handleCharacterChange(char.id, 'hairstyle', e.target.value)} />
                    </FormField>
                     <FormField label="Voice">
                        <CustomSelect options={VOICE_OPTIONS} value={char.voice} onChange={val => handleCharacterChange(char.id, 'voice', val)} />
                    </FormField>
                    <FormField label="Description">
                        <TextArea rows={2} value={char.description} onChange={e => handleCharacterChange(char.id, 'description', e.target.value)} placeholder="Physical appearance, personality traits..." />
                    </FormField>
                    <FormField label="Action">
                        <TextArea rows={2} value={char.action} onChange={e => handleCharacterChange(char.id, 'action', e.target.value)} placeholder="What is the character doing?" />
                    </FormField>
                </div>
            ))}
            <button onClick={onAddCharacter} className="w-full flex items-center justify-center py-2.5 text-sm font-semibold text-purple-300 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors">
                <PlusIcon className="w-5 h-5 mr-2" /> Add Character
            </button>
        </CollapsibleSection>

        <CollapsibleSection title="Dialogue">
            {dialogues.map((dialogue, index) => (
                 <div key={dialogue.id} className="p-4 bg-[#101013] rounded-lg border border-white/10 space-y-4">
                     <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-slate-200">Line {index + 1}</h3>
                        <button onClick={() => onRemoveDialogue(dialogue.id)} className="p-1.5 text-slate-400 hover:text-red-400 rounded-full hover:bg-red-500/10">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                     <FormField label="Character">
                        <CustomSelect 
                            options={characters.map(c => c.name || `Character ${c.id.substring(0,4)}`)}
                            value={characters.find(c => c.id === dialogue.characterId)?.name || ''}
                            onChange={val => {
                                const charId = characters.find(c => c.name === val)?.id;
                                if(charId) handleDialogueChange(dialogue.id, 'characterId', charId);
                            }}
                        />
                    </FormField>
                     <FormField label="Dialogue Text">
                        <TextArea rows={2} value={dialogue.dialogue} onChange={e => handleDialogueChange(dialogue.id, 'dialogue', e.target.value)} />
                    </FormField>
                 </div>
            ))}
            <button onClick={onAddDialogue} className="w-full flex items-center justify-center py-2.5 text-sm font-semibold text-purple-300 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors">
                <PlusIcon className="w-5 h-5 mr-2" /> Add Dialogue
            </button>
        </CollapsibleSection>

        <CollapsibleSection title="Environment & Camera">
            <FormField label="Environment Description">
                <TextArea rows={3} value={environment.description} onChange={e => handleEnvironmentChange('description', e.target.value)} placeholder="e.g., A bustling futuristic city at night, neon lights reflecting on wet streets..." />
            </FormField>
            <FormField label="Lighting">
                <CustomSelect options={LIGHTING_OPTIONS} value={environment.lighting} onChange={val => handleEnvironmentChange('lighting', val)} />
            </FormField>
            <FormField label="Camera Angle">
                <CustomSelect options={CAMERA_ANGLE_OPTIONS} value={environment.cameraAngle} onChange={val => handleEnvironmentChange('cameraAngle', val)} />
            </FormField>
            <FormField label="Shooting Style">
                <CustomSelect options={SHOOTING_STYLE_OPTIONS} value={environment.shootingStyle} onChange={val => handleEnvironmentChange('shootingStyle', val)} />
            </FormField>
        </CollapsibleSection>
      </div>
    </GlassCard>
  );
};