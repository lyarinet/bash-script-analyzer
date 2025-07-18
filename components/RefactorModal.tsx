
import React, { useEffect } from 'react';
import { RefactorResponse } from '../types';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import CodeBlock from './CodeBlock';

interface RefactorModalProps {
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  data: RefactorResponse | null;
  suggestion: string | null;
  onClose: () => void;
}

const RefactorModal: React.FC<RefactorModalProps> = ({ isOpen, isLoading, error, data, suggestion, onClose }) => {
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in-fast"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="refactor-title"
    >
      <div
        className="bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 id="refactor-title" className="text-lg font-semibold text-gray-200 truncate" title={suggestion ?? ''}>
              Refactoring Suggestion: {suggestion}
            </h2>
          </div>
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
        <main className="p-6 overflow-y-auto w-full">
          {isLoading && <Spinner />}
          {error && <ErrorMessage message={`Failed to generate fix: ${error}`} />}
          {data && (
            <div className="animate-fade-in">
              <div className="mb-6 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <h3 className="text-md font-semibold text-gray-200 mb-2">Explanation of Change</h3>
                <p className="text-gray-300 leading-relaxed">{data.explanation}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-semibold text-red-400 mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    Original Code
                  </h3>
                  <CodeBlock fileName="Before" content={data.originalCode} />
                </div>
                <div>
                  <h3 className="text-md font-semibold text-green-400 mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    Refactored Code
                  </h3>
                  <CodeBlock fileName="After" content={data.refactoredCode} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
       <style>{`
        @keyframes fade-in-fast {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-fast {
          animation: fade-in-fast 0.2s ease-out forwards;
        }
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
          }
      `}</style>
    </div>
  );
};

export default RefactorModal;
