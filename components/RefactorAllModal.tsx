
import React, { useEffect } from 'react';
import { RefactorResponse } from '../types';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import CodeBlock from './CodeBlock';

interface RefactorAllModalProps {
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  data: RefactorResponse[] | null;
  onClose: () => void;
  onApplyAllFixes: (fixes: RefactorResponse[]) => void;
}

const RefactorAllModal: React.FC<RefactorAllModalProps> = ({ isOpen, isLoading, error, data, onClose, onApplyAllFixes }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  const handleApplyAll = () => {
      if (data) {
          onApplyAllFixes(data);
          onClose();
      }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in-fast"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="refactor-all-title"
    >
      <div
        className="bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
          <h2 id="refactor-all-title" className="text-lg font-semibold text-gray-200">
            All Refactoring Suggestions
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors ml-4"
            aria-label="Close refactor preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <main className="p-6 overflow-y-auto w-full min-h-0">
          {isLoading && <Spinner />}
          {error && <ErrorMessage message={`Failed to generate fixes: ${error}`} />}
          {data && (
            <div className="space-y-8 animate-fade-in">
              {data.map((refactor, index) => (
                <div key={index} className="bg-gray-900/40 p-4 rounded-lg border border-gray-700/50">
                  <h3 className="text-md font-semibold text-indigo-300 mb-3" title={refactor.suggestion}>
                    Suggestion {index + 1}: {refactor.suggestion}
                  </h3>
                  <div className="mb-4 bg-gray-800/50 p-3 rounded-md border border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-200 mb-1">Explanation of Change</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">{refactor.explanation}</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                        Original Code
                      </h4>
                      <CodeBlock fileName="Before" content={refactor.originalCode} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                        Refactored Code
                      </h4>
                      <CodeBlock fileName="After" content={refactor.refactoredCode} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
        {data && !isLoading && (
            <footer className="p-4 border-t border-gray-700 flex-shrink-0 flex justify-end">
                <button
                    onClick={handleApplyAll}
                    className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-500 disabled:bg-green-800 transition-colors duration-300 flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Apply All Fixes
                </button>
            </footer>
        )}
      </div>
      <style>{`
        @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default RefactorAllModal;