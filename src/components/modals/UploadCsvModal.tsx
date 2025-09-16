
import React, { useRef } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { CloseIcon } from '../icons/CloseIcon';
import { InfoIcon } from '../icons/InfoIcon';

interface UploadCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}

export const UploadCsvModal: React.FC<UploadCsvModalProps> = ({ isOpen, onClose, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    const csvContent = "data:text/csv;charset=utf-8,Filename,Title,Keywords,Category,Releases\n"
        + "image.jpg,A short title,keyword1,keyword2,123,Model Release 1.pdf\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
      onClose();
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const columns = [
    { name: 'Filename', description: 'The full name of the uploaded asset, including the extension (e.g., image.jpg, video.mov)' },
    { name: 'Title', description: 'Short and simple description of your asset (max 200 characters)' },
    { name: 'Keywords', description: 'Comma-separated keywords (max 49), ordered by relevance' },
    { name: 'Category', description: 'The numeric code for the asset category' },
    { name: 'Releases', description: 'The name(s) of the model or property releases, exactly as used when uploading them to your Adobe Stock portal. If multiple releases share the same name, the most recent one will be used.' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      aria-labelledby="csv-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0" onClick={onClose}></div>
      <GlassCard className="relative z-10 w-full max-w-2xl mx-4">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 id="csv-modal-title" className="text-2xl font-bold text-slate-100">Upload CSV file with your metadata</h2>
            <button
              onClick={onClose}
              className="p-2 -mt-2 -mr-2 text-slate-400 rounded-full hover:bg-white/10 hover:text-slate-100 transition-colors"
              aria-label="Close modal"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="text-sm text-slate-300 space-y-2">
            <p>Attach metadata to multiple assets at once by uploading a CSV file with the metadata. Each row should represent a recently uploaded asset.</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Column names must match exactly with the sample CSV, in English</li>
              <li>If a column name isn't recognized, it will be ignored</li>
              <li>Apart from the Filename, all values in the CSV are optional</li>
              <li>CSV file must not exceed 5000 rows or 5MB in size</li>
            </ul>
          </div>
          
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg flex items-start space-x-3">
            <InfoIcon className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-blue-200">
              <button onClick={handleDownloadSample} className="font-semibold underline hover:text-white">Download the sample CSV</button> to ensure the correct format.
            </span>
          </div>

          <div className="mt-4 border-t border-b border-white/10">
            <table className="w-full text-left text-sm">
                <thead className="text-slate-400">
                    <tr>
                        <th className="px-4 py-2 font-medium">Columns</th>
                        <th className="px-4 py-2 font-medium">Information expected</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                    {columns.map(col => (
                         <tr key={col.name}>
                            <td className="px-4 py-3 font-medium text-slate-200">{col.name}</td>
                            <td className="px-4 py-3 text-slate-300">{col.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 bg-slate-700/50 hover:bg-slate-700/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleChooseFile}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-colors"
            >
              Choose CSV file and upload
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="sr-only" accept=".csv, text/csv" />
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
