
import React from 'react';

interface HeaderProps {
    isLiveAnalysis: boolean;
    onLiveAnalysisChange: (enabled: boolean) => void;
    onSettingsClick: () => void;
    onExportClick: () => void;
    isExportDisabled: boolean;
}

const Toggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string; }> = ({ checked, onChange, label }) => (
    <div className="flex items-center">
        <span className="text-sm font-medium text-gray-300 mr-2">{label}</span>
        <button
            type="button"
            className={`${checked ? 'bg-indigo-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
        >
            <span className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}/>
        </button>
    </div>
);


const Header: React.FC<HeaderProps> = ({ isLiveAnalysis, onLiveAnalysisChange, onSettingsClick, onExportClick, isExportDisabled }) => {
  return (
    <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-6v2M9 19v2m6-6v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3M5.636 5.636l-.707-.707M18.364 18.364l-.707-.707M5.636 18.364l-.707.707M18.364 5.636l-.707.707" />
          </svg>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Bash Script Analyzer
          </h1>
        </div>
        <div className="flex items-center gap-4">
            <Toggle label="Live Analysis" checked={isLiveAnalysis} onChange={onLiveAnalysisChange} />
             <button onClick={onExportClick} disabled={isExportDisabled} className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white disabled:text-gray-500 disabled:cursor-not-allowed transition-colors" aria-label="Export report">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" /><path d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 12H4V4h10v11z" /></svg>
                Export Report
            </button>
            <button onClick={onSettingsClick} className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors" aria-label="Open settings">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.982.031 2.242-.948 2.286-1.56.38-1.56 2.6 0 2.98.98.244 1.488 1.304.948 2.286-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.286.948c.38 1.56 2.6 1.56 2.98 0a1.532 1.532 0 012.286-.948c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.948-2.286c-1.56-.38-1.56-2.6 0-2.98a1.532 1.532 0 01.948-2.286c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.286-.948zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                Settings
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
