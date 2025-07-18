import React, { useEffect } from 'react';
import { AnalysisSettings } from '../types';

interface SettingsModalProps {
  settings: AnalysisSettings;
  onSettingsChange: (newSettings: AnalysisSettings) => void;
  onClose: () => void;
}

const settingLabels: Record<keyof AnalysisSettings, string> = {
    summary: 'Summary',
    interactiveQa: 'Interactive Q&A',
    strengths: 'Strengths',
    weaknesses: 'Weaknesses & Risks',
    suggestions: 'Improvement Suggestions',
    security: 'Security Audit',
    performance: 'Performance Profile',
    portability: 'Portability Analysis',
    commandBreakdown: 'Command Breakdown',
    logicVisualization: 'Logic Visualization',
    testSuite: 'Generated Test Suite',
    translations: 'Translations',
    github: 'GitHub Assets',
};

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSettingsChange, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleToggle = (key: keyof AnalysisSettings) => {
    onSettingsChange({ ...settings, [key]: !settings[key] });
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in-fast"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div
        className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
          <h2 id="settings-title" className="text-lg font-semibold text-gray-200">
            Analysis Settings
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close settings">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <main className="p-6 overflow-y-auto">
            <p className="text-gray-400 mb-4">Select which analysis sections to display in the results.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(settingLabels).map(([key, label]) => (
                    <label key={key} className="flex items-center space-x-3 bg-gray-900/50 p-3 rounded-md hover:bg-gray-700/50 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings[key as keyof AnalysisSettings] ?? false}
                            onChange={() => handleToggle(key as keyof AnalysisSettings)}
                            className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-gray-300">{label}</span>
                    </label>
                ))}
            </div>
        </main>
      </div>
      <style>{`
        @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default SettingsModal;