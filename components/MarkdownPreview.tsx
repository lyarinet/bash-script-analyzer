
import React, { useEffect, useState } from 'react';
// @ts-ignore
import { marked } from 'https://esm.sh/marked@12.0.2';

interface MarkdownPreviewProps {
  title: string;
  content: string;
  onClose: () => void;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ title, content, onClose }) => {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    if (content) {
      setHtmlContent(marked.parse(content) as string);
    }
  }, [content]);

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

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in-fast"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
    >
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
          <h2 id="preview-title" className="text-lg font-semibold text-gray-200">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <main className="prose prose-invert p-6 overflow-y-auto w-full max-w-none">
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
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
        .prose-invert code::before, .prose-invert code::after {
            content: none;
        }
      `}</style>
    </div>
  );
};

export default MarkdownPreview;
