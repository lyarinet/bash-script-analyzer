
import React from 'react';
import { Script } from '../types';

interface CodeInputProps {
  scripts: Script[];
  activeScriptId: number;
  onActiveScriptChange: (id: number) => void;
  onScriptContentChange: (id: number, content: string) => void;
  onAddScript: () => void;
  onRemoveScript: (id: number) => void;
  onAnalyze: () => void;
  onAnalyzeAll: () => void;
  isLoading: boolean;
}

const CodeInput: React.FC<CodeInputProps> = ({ 
    scripts, activeScriptId, onActiveScriptChange, onScriptContentChange, 
    onAddScript, onRemoveScript, onAnalyze, onAnalyzeAll, isLoading 
}) => {

  const activeScript = scripts.find(s => s.id === activeScriptId);

  return (
    <div className="bg-gray-800/50 rounded-xl shadow-2xl flex flex-col h-full">
      <div className="p-2 border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-1 overflow-x-auto">
            {scripts.map(script => (
                <button
                    key={script.id}
                    onClick={() => onActiveScriptChange(script.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap ${
                        activeScriptId === script.id 
                            ? 'bg-gray-700 text-white' 
                            : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                    }`}
                >
                    {script.name}
                    {scripts.length > 1 && (
                         <span 
                            onClick={(e) => { e.stopPropagation(); onRemoveScript(script.id); }}
                            className="text-gray-500 hover:text-red-400"
                            aria-label={`Remove ${script.name}`}
                        >
                            &times;
                        </span>
                    )}
                </button>
            ))}
            <button onClick={onAddScript} className="ml-2 text-gray-400 hover:text-white" aria-label="Add new script">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            </button>
        </div>
      </div>
      <textarea
        className="w-full flex-grow p-4 bg-gray-900 text-gray-300 font-mono text-sm resize-none focus:outline-none rounded-b-xl"
        value={activeScript?.content || ''}
        onChange={(e) => activeScript && onScriptContentChange(activeScript.id, e.target.value)}
        placeholder="Paste your bash script here..."
        spellCheck="false"
        key={activeScriptId}
      />
      <div className="p-4 border-t border-gray-700 grid grid-cols-2 gap-3">
        <button
          onClick={onAnalyzeAll}
          disabled={isLoading}
          className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-500 disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center"
        >
          Analyze All
        </button>
        <button
          onClick={onAnalyze}
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            'Analyze Active Script'
          )}
        </button>
      </div>
    </div>
  );
};

export default CodeInput;
