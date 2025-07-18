import React, { useState, useCallback } from 'react';
import { AnalysisResponse, CommandPart, RefactorResponse, SecurityIssue, PerformanceIssue, PortabilityIssue } from '../types';
import AnalysisSection from './AnalysisSection';
import CodeBlock from './CodeBlock';
import MarkdownPreview from './MarkdownPreview';
import { getRefactoredCode, getRefactoringsForAll } from '../services/geminiService';
import RefactorModal from './RefactorModal';
import RefactorAllModal from './RefactorAllModal';
import MermaidChart from './MermaidChart';
import ChatAnalysis from './ChatAnalysis';

interface AnalysisResultProps {
  analysis: AnalysisResponse;
  scriptContent: string;
  onApplyFix: (originalCode: string, refactoredCode: string) => void;
  onApplyAllFixes: (fixes: RefactorResponse[]) => void;
}

const Table: React.FC<{ headers: string[], rows: (string | React.ReactNode)[][] }> = ({ headers, rows }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-gray-700/50">
                <tr>
                    {headers.map(header => (
                        <th key={header} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            {header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="bg-gray-800/50 divide-y divide-gray-700">
                {rows.map((row, index) => (
                    <tr key={index}>
                        {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-3 whitespace-pre-wrap text-sm text-gray-300 align-top">
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis, scriptContent, onApplyFix, onApplyAllFixes }) => {
  const [showReadmePreview, setShowReadmePreview] = useState(false);
  const [activeTranslation, setActiveTranslation] = useState<'python' | 'powershell'>('python');

  const [refactorModalState, setRefactorModalState] = useState<{
    isOpen: boolean; isLoading: boolean; error: string | null; data: RefactorResponse | null; suggestion: string | null;
  }>({ isOpen: false, isLoading: false, error: null, data: null, suggestion: null });

  const [refactorAllModalState, setRefactorAllModalState] = useState<{
    isOpen: boolean; isLoading: boolean; error: string | null; data: RefactorResponse[] | null;
  }>({ isOpen: false, isLoading: false, error: null, data: null });

  const handleShowFix = useCallback(async (suggestion: string) => {
    setRefactorModalState({ isOpen: true, isLoading: true, error: null, data: null, suggestion: suggestion });
    try {
      const result = await getRefactoredCode(scriptContent, suggestion);
      setRefactorModalState(prev => ({ ...prev, isLoading: false, data: result }));
    } catch (err) {
      setRefactorModalState(prev => ({ ...prev, isLoading: false, error: err instanceof Error ? err.message : "An unknown error occurred." }));
    }
  }, [scriptContent]);

  const handleCloseRefactorModal = () => setRefactorModalState({ isOpen: false, isLoading: false, error: null, data: null, suggestion: null });
  
  const handleFixAll = useCallback(async () => {
    if (!analysis.suggestions?.length) return;
    setRefactorAllModalState({ isOpen: true, isLoading: true, error: null, data: null });
    try {
        const result = await getRefactoringsForAll(scriptContent, analysis.suggestions);
        setRefactorAllModalState(prev => ({ ...prev, isLoading: false, data: result }));
    } catch (err) {
        setRefactorAllModalState(prev => ({ ...prev, isLoading: false, error: err instanceof Error ? err.message : "An unknown error occurred." }));
    }
  }, [scriptContent, analysis.suggestions]);

  const handleCloseRefactorAllModal = () => setRefactorAllModalState({ isOpen: false, isLoading: false, error: null, data: null });
  
  const renderFixAllButton = () => {
    if (!analysis.suggestions?.length) return null;
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
  
  const getPortabilityColor = (score: number) => {
      if (score >= 8) return 'text-green-400';
      if (score >= 5) return 'text-yellow-400';
      return 'text-red-400';
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <AnalysisSection title="Summary"><p className="text-gray-300 leading-relaxed">{analysis.summary}</p></AnalysisSection>
        
        <AnalysisSection title="Interactive Q&A" icon="chat">
            <ChatAnalysis scriptContent={scriptContent} />
        </AnalysisSection>

        <AnalysisSection title="Strengths" icon="check"><ul className="list-disc list-inside space-y-2 text-gray-300">{analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul></AnalysisSection>
        <AnalysisSection title="Weaknesses & Risks" icon="warning"><ul className="list-disc list-inside space-y-2 text-gray-300">{analysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul></AnalysisSection>

        <AnalysisSection title="Improvement Suggestions" icon="lightbulb" headerAction={renderFixAllButton()}>
          <ul className="space-y-3">
            {analysis.suggestions.map((suggestion, index) => (
              <li key={index} className="flex justify-between items-center text-gray-300 gap-4">
                <span className="flex-1">{suggestion}</span>
                <button onClick={() => handleShowFix(suggestion)} className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-md transition-all duration-200 whitespace-nowrap flex items-center gap-1.5" aria-label={`Show fix for: ${suggestion}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  Show Fix
                </button>
              </li>
            ))}
          </ul>
        </AnalysisSection>

        <AnalysisSection title="Security Audit" icon="shield"><Table headers={["Vulnerability", "Recommendation"]} rows={analysis.securityAudit.map(i => [i.vulnerability, i.recommendation])} /></AnalysisSection>
        <AnalysisSection title="Performance Profile" icon="bolt"><Table headers={["Issue", "Suggestion"]} rows={analysis.performanceProfile.map(i => [i.issue, i.suggestion])} /></AnalysisSection>
        
        <AnalysisSection title="Portability & Compatibility" icon="globe">
            <div className='space-y-4'>
                <div className='flex items-baseline gap-4 bg-gray-900/50 p-3 rounded-lg'>
                    <h4 className='text-md font-semibold text-gray-200'>Portability Score:</h4>
                    <span className={`text-3xl font-bold ${getPortabilityColor(analysis.portabilityAnalysis.score)}`}>{analysis.portabilityAnalysis.score}/10</span>
                    <p className='text-gray-400 text-sm flex-1'>{analysis.portabilityAnalysis.summary}</p>
                </div>
                <Table headers={["Non-Portable Code", "POSIX-Compliant Suggestion"]} rows={analysis.portabilityAnalysis.issues.map(i => [<code className='text-sm text-indigo-300 bg-gray-900/50 px-2 py-1 rounded'>{i.code}</code>, <code className='text-sm text-green-300 bg-gray-900/50 px-2 py-1 rounded'>{i.suggestion}</code>])} />
            </div>
        </AnalysisSection>

        <AnalysisSection title="Command Breakdown"><Table headers={["Command/Flag", "Explanation"]} rows={analysis.commandBreakdown.map(p => [<code className="text-sm text-indigo-300 bg-gray-900/50 px-2 py-1 rounded">{p.part}</code>, p.explanation])} /></AnalysisSection>

        <AnalysisSection title="Script Logic Visualization" icon="flowchart"><MermaidChart chart={analysis.mermaidFlowchart} /></AnalysisSection>

        <AnalysisSection title="Generated Test Suite" icon="beaker"><CodeBlock fileName={`test_script.bats (${analysis.testSuite.framework})`} content={analysis.testSuite.content} /></AnalysisSection>

        <AnalysisSection title="Translations" icon="translate">
            <div className='flex mb-2 border-b border-gray-700'>
                <button onClick={() => setActiveTranslation('python')} className={`px-4 py-2 text-sm font-medium ${activeTranslation === 'python' ? 'border-b-2 border-indigo-400 text-white' : 'text-gray-400'}`}>Python</button>
                <button onClick={() => setActiveTranslation('powershell')} className={`px-4 py-2 text-sm font-medium ${activeTranslation === 'powershell' ? 'border-b-2 border-indigo-400 text-white' : 'text-gray-400'}`}>PowerShell</button>
            </div>
            {activeTranslation === 'python' && <CodeBlock fileName="translation.py" content={analysis.translations.python} />}
            {activeTranslation === 'powershell' && <CodeBlock fileName="translation.ps1" content={analysis.translations.powershell} />}
        </AnalysisSection>

        <AnalysisSection title="GitHub Repository Suggestion" icon="github">
            <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-200">Suggested File Structure</h4><CodeBlock fileName="Directory Tree" content={analysis.githubRepo.fileStructure} />
                <div className="flex justify-between items-center"><h4 className="text-md font-semibold text-gray-200">README.md</h4><button onClick={() => setShowReadmePreview(true)} className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-indigo-500/10" aria-label="Preview README.md"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>Preview</button></div><CodeBlock fileName="README.md" content={analysis.githubRepo.readmeContent} />
                <h4 className="text-md font-semibold text-gray-200">.gitignore</h4><CodeBlock fileName=".gitignore" content={analysis.githubRepo.gitignoreContent} />
                <h4 className="text-md font-semibold text-gray-200">Dockerfile</h4><CodeBlock fileName="Dockerfile" content={analysis.githubRepo.dockerfileContent} />
                <h4 className="text-md font-semibold text-gray-200">Man Page</h4><CodeBlock fileName="script.1" content={analysis.githubRepo.manPageContent} />
            </div>
        </AnalysisSection>

        <style>{`@keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }`}</style>
      </div>
      {showReadmePreview && <MarkdownPreview content={analysis.githubRepo.readmeContent} onClose={() => setShowReadmePreview(false)} />}
      {refactorModalState.isOpen && <RefactorModal {...refactorModalState} onClose={handleCloseRefactorModal} onApplyFix={onApplyFix} />}
      {refactorAllModalState.isOpen && <RefactorAllModal {...refactorAllModalState} onClose={handleCloseRefactorAllModal} onApplyAllFixes={onApplyAllFixes} />}
    </>
  );
};

export default AnalysisResult;