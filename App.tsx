
import React, { useState, useCallback } from 'react';
import { AnalysisResponse } from './types';
import { analyzeScript } from './services/geminiService';
import Header from './components/Header';
import CodeInput from './components/CodeInput';
import AnalysisResult from './components/AnalysisResult';
import Spinner from './components/Spinner';
import ErrorMessage from './components/ErrorMessage';

const initialScript = ``;

const App: React.FC = () => {
  const [scriptContent, setScriptContent] = useState<string>(initialScript);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!scriptContent) {
      setError("Script content cannot be empty.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeScript(scriptContent);
      setAnalysis(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Analysis failed: ${err.message}`);
      } else {
        setError("An unknown error occurred during analysis.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [scriptContent]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <CodeInput
            scriptContent={scriptContent}
            setScriptContent={setScriptContent}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
          <div className="bg-gray-800/50 rounded-xl shadow-2xl p-6 h-full min-h-[500px]">
            {isLoading && <Spinner />}
            {error && <ErrorMessage message={error} />}
            {analysis && !isLoading && <AnalysisResult analysis={analysis} scriptContent={scriptContent} />}
            {!isLoading && !error && !analysis && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                <h2 className="text-xl font-bold">Analysis Results</h2>
                <p className="mt-2 text-center">Your script analysis will appear here once you click the "Analyze Script" button.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
