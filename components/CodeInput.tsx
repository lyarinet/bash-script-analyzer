
import React from 'react';

interface CodeInputProps {
  scriptContent: string;
  setScriptContent: (content: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

const CodeInput: React.FC<CodeInputProps> = ({ scriptContent, setScriptContent, onAnalyze, isLoading }) => {
  return (
    <div className="bg-gray-800/50 rounded-xl shadow-2xl flex flex-col h-full">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-200">Script to Analyze</h2>
      </div>
      <textarea
        className="w-full flex-grow p-4 bg-gray-900 text-gray-300 font-mono text-sm resize-none focus:outline-none rounded-b-xl"
        value={scriptContent}
        onChange={(e) => setScriptContent(e.target.value)}
        placeholder="Paste your bash script here..."
        spellCheck="false"
      />
      <div className="p-4 border-t border-gray-700">
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
            'Analyze Script'
          )}
        </button>
      </div>
    </div>
  );
};

export default CodeInput;
