import React, { useState, useEffect } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { CloseIcon } from '../icons/CloseIcon';
import { EyeIcon } from '../icons/EyeIcon';
import { EyeOffIcon } from '../icons/EyeOffIcon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');
  const [isKeyVisible, setIsKeyVisible] = useState(false);

  useEffect(() => {
    // Reset input when modal is opened/closed or key is saved elsewhere
    const storedKey = localStorage.getItem('gemini-api-key') || '';
    setApiKey(storedKey);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(apiKey);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0" onClick={onClose}></div>
      <GlassCard className="relative z-10 w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
                <h2 id="modal-title" className="text-2xl font-bold text-slate-100">Settings</h2>
                <p className="mt-1 text-sm text-slate-400">Manage your application settings.</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 rounded-full hover:bg-white/10 hover:text-slate-100 transition-colors"
              aria-label="Close settings"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <div>
                <label htmlFor="api-key" className="block text-sm font-medium text-slate-300">
                    Google Gemini API Key
                </label>
                <div className="relative mt-2">
                    <input
                        type={isKeyVisible ? 'text' : 'password'}
                        id="api-key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your API key"
                        className="w-full bg-[#101013] border border-white/10 rounded-lg py-2.5 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-colors"
                    />
                    <button
                        onClick={() => setIsKeyVisible(!isKeyVisible)}
                        className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-slate-200"
                        aria-label={isKeyVisible ? 'Hide API key' : 'Show API key'}
                    >
                        {isKeyVisible ? <EyeOffIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                    </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                    Your key is stored securely in your browser's local storage.
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="ml-1 text-purple-400 hover:underline">
                        Get an API key from Google AI Studio.
                    </a>
                </p>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
             <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 bg-slate-700/50 hover:bg-slate-700/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};