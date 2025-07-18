
import React, { useState, useCallback } from 'react';
import { AnalysisResponse, CommandPart, RefactorResponse } from '../types';
import AnalysisSection from './AnalysisSection';
import CodeBlock from './CodeBlock';
import MarkdownPreview from './MarkdownPreview';
import { getRefactoredCode, getRefactoringsForAll } from '../services/geminiService';
import RefactorModal from './RefactorModal';
import RefactorAllModal from './RefactorAllModal';

interface AnalysisResultProps {
  analysis: AnalysisResponse;
  scriptContent: string;
}

const CommandBreakdownTable: React.FC<{ parts: CommandPart[] }> = ({ parts }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-gray-700/50">
                <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/3">
                        Command / Flag
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Explanation
                    </th>
                </tr>
            </thead>
            <tbody className="bg-gray-800/50 divide-y divide-gray-700">
                {parts.map((item, index) => (
                    <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap">
                            <code className="text-sm text-indigo-300 bg-gray-900/50 px-2 py-1 rounded">{item.part}</code>
                        </td>
                        <td className="px-4 py-3 whitespace-pre-wrap text-sm text-gray-300">
                            {item.explanation}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis, scriptContent }) => {
  const [showReadmePreview, setShowReadmePreview] = useState(false);
  const [refactorModalState, setRefactorModalState] = useState<{
    isOpen: boolean;
    isLoading: boolean;
    error: string | null;
    data: RefactorResponse | null;
    suggestion: string | null;
  }>({
    isOpen: false,
    isLoading: false,
    error: null,
    data: null,
    suggestion: null,
  });

  const [refactorAllModalState, setRefactorAllModalState] = useState<{
    isOpen: boolean;
    isLoading: boolean;
    error: string | null;
    data: RefactorResponse[] | null;
  }>({
    isOpen: false,
    isLoading: false,
    error: null,
    data: null,
  });


  const handleShowFix = useCallback(async (suggestion: string) => {
    setRefactorModalState({
      isOpen: true,
      isLoading: true,
      error: null,
      data: null,
      suggestion: suggestion
    });

    try {
      const result = await getRefactoredCode(scriptContent, suggestion);
      setRefactorModalState(prev => ({ ...prev, isLoading: false, data: result }));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setRefactorModalState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
    }
  }, [scriptContent]);

  const handleCloseRefactorModal = () => {
    setRefactorModalState({ isOpen: false, isLoading: false, error: null, data: null, suggestion: null });
  };
  
  const handleFixAll = useCallback(async () => {
    if (!analysis.suggestions || analysis.suggestions.length === 0) return;

    setRefactorAllModalState({
        isOpen: true,
        isLoading: true,
        error: null,
        data: null,
    });

    try {
        const result = await getRefactoringsForAll(scriptContent, analysis.suggestions);
        setRefactorAllModalState(prev => ({ ...prev, isLoading: false, data: result }));
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setRefactorAllModalState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
    }
  }, [scriptContent, analysis.suggestions]);

  const handleCloseRefactorAllModal = () => {
    setRefactorAllModalState({ isOpen: false, isLoading: false, error: null, data: null });
  };
  
  const renderFixAllButton = () => {
    if (!analysis.suggestions || analysis.suggestions.length === 0) return null;
    return (
        <button
            onClick={handleFixAll}
            className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-md transition-all duration-200 flex items-center gap-1.5 disabled:bg-indigo-800 disabled:cursor-not-allowed"
            aria-label="Fix all suggestions"
            disabled={refactorAllModalState.isLoading}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 011-1h.5a1.5 1.5 0 000-3H6a1 1 0 01-1-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
            </svg>
            {refactorAllModalState.isLoading ? 'Fixing...' : 'Fix All'}
        </button>
    );
  };


  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <AnalysisSection title="Summary">
          <p className="text-gray-300 leading-relaxed">{analysis.summary}</p>
        </AnalysisSection>

        <AnalysisSection title="Strengths" icon="check">
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            {analysis.strengths.map((strength, index) => <li key={index}>{strength}</li>)}
          </ul>
        </AnalysisSection>
        
        <AnalysisSection title="Weaknesses & Risks" icon="warning">
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            {analysis.weaknesses.map((weakness, index) => <li key={index}>{weakness}</li>)}
          </ul>
        </AnalysisSection>

        <AnalysisSection title="Improvement Suggestions" icon="lightbulb" headerAction={renderFixAllButton()}>
          <ul className="space-y-3">
            {analysis.suggestions.map((suggestion, index) => (
              <li key={index} className="flex justify-between items-center text-gray-300">
                <span className="flex-1 mr-4">{suggestion}</span>
                <button
                  onClick={() => handleShowFix(suggestion)}
                  className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-md transition-all duration-200 whitespace-nowrap flex items-center gap-1.5"
                  aria-label={`Show fix for: ${suggestion}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  Show Fix
                </button>
              </li>
            ))}
          </ul>
        </AnalysisSection>

        <AnalysisSection title="FFmpeg Command Breakdown">
          <CommandBreakdownTable parts={analysis.commandBreakdown} />
        </AnalysisSection>

        {analysis.githubRepo && (
          <AnalysisSection title="GitHub Repository Suggestion" icon="github">
              <div className="space-y-4">
                  <div>
                      <h4 className="text-md font-semibold text-gray-200">Suggested File Structure</h4>
                      <CodeBlock fileName="Directory Tree" content={analysis.githubRepo.fileStructure} />
                  </div>
                  <div>
                      <div className="flex justify-between items-center">
                        <h4 className="text-md font-semibold text-gray-200">README.md</h4>
                          <button
                            onClick={() => setShowReadmePreview(true)}
                            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-indigo-500/10"
                            aria-label="Preview README.md"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Preview
                          </button>
                      </div>
                      <CodeBlock fileName="README.md" content={analysis.githubRepo.readmeContent} />
                  </div>
                  <div>
                      <h4 className="text-md font-semibold text-gray-200">.gitignore</h4>
                      <CodeBlock fileName=".gitignore" content={analysis.githubRepo.gitignoreContent} />
                  </div>
              </div>
          </AnalysisSection>
        )}

        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
          }
        `}</style>
      </div>
      {showReadmePreview && analysis.githubRepo && (
        <MarkdownPreview 
          content={analysis.githubRepo.readmeContent}
          onClose={() => setShowReadmePreview(false)}
        />
      )}
      {refactorModalState.isOpen && (
        <RefactorModal
            isOpen={refactorModalState.isOpen}
            isLoading={refactorModalState.isLoading}
            error={refactorModalState.error}
            data={refactorModalState.data}
            suggestion={refactorModalState.suggestion}
            onClose={handleCloseRefactorModal}
        />
      )}
      {refactorAllModalState.isOpen && (
        <RefactorAllModal
            isOpen={refactorAllModalState.isOpen}
            isLoading={refactorAllModalState.isLoading}
            error={refactorAllModalState.error}
            data={refactorAllModalState.data}
            onClose={handleCloseRefactorAllModal}
        />
      )}
    </>
  );
};

export default AnalysisResult;
