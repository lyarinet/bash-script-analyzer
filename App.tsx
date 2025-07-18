
import React, { useState, useCallback, useEffect } from 'react';
import { AnalysisResponse, RefactorResponse, Script, AnalysisSettings } from './types';
import { analyzeScript } from './services/geminiService';
import Header from './components/Header';
import CodeInput from './components/CodeInput';
import AnalysisResult from './components/AnalysisResult';
import Spinner from './components/Spinner';
import ErrorMessage from './components/ErrorMessage';
import SettingsModal from './components/SettingsModal';
import { useDebouncedCallback } from './hooks/useDebouncedCallback';

const initialScripts: Script[] = [{
  id: 1,
  name: "script.sh",
  content: `#!/bin/bash

# A simple script to demonstrate the analyzer's capabilities.

# Set a variable
GREETING="Hello"
TARGET="World"

# Function to greet
function greet() {
  # This could be more robust
  echo "$GREETING, $TARGET!"
}

# Main execution
if [ -z "$1" ]; then
  greet
else
  # Using an external command
  echo "You provided an argument: $1"
  # Inefficient use of cat and grep
  echo "Searching for 'root' in /etc/passwd..."
  cat /etc/passwd | grep root
fi

# Hardcoded secret - a security risk
API_KEY="supersecret_12345"
echo "Using API key (but not really)"

exit 0
`
}];

const defaultAnalysisSettings: AnalysisSettings = {
    summary: true,
    interactiveQa: true,
    strengths: true,
    weaknesses: true,
    suggestions: true,
    security: true,
    performance: true,
    portability: true,
    commandBreakdown: true,
    logicVisualization: true,
    testSuite: true,
    translations: true,
    github: true,
};


const App: React.FC = () => {
  const [scripts, setScripts] = useState<Script[]>(initialScripts);
  const [activeScriptId, setActiveScriptId] = useState<number>(1);
  const [analyses, setAnalyses] = useState<Record<number, AnalysisResponse | null>>({});
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const [isLiveAnalysis, setIsLiveAnalysis] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [analysisSettings, setAnalysisSettings] = useState<AnalysisSettings>(defaultAnalysisSettings);

  const activeScript = scripts.find(s => s.id === activeScriptId);
  const activeAnalysis = activeScriptId ? analyses[activeScriptId] : null;
  const isAnalyzing = activeScriptId ? loadingStates[activeScriptId] : false;

  const handleAnalyze = useCallback(async (id: number) => {
    const scriptToAnalyze = scripts.find(s => s.id === id);
    if (!scriptToAnalyze || !scriptToAnalyze.content) {
      setError("Script content cannot be empty.");
      return;
    }
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    setError(null);
    setAnalyses(prev => ({ ...prev, [id]: null }));

    try {
      const result = await analyzeScript(scriptToAnalyze.content);
      setAnalyses(prev => ({ ...prev, [id]: result }));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Analysis failed for ${scriptToAnalyze.name}: ${err.message}`);
      } else {
        setError("An unknown error occurred during analysis.");
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }
  }, [scripts]);
  
  const debouncedAnalyze = useDebouncedCallback(handleAnalyze, 1500);

  useEffect(() => {
    if (isLiveAnalysis && activeScriptId) {
        debouncedAnalyze(activeScriptId);
    }
  }, [scripts.find(s => s.id === activeScriptId)?.content, isLiveAnalysis, activeScriptId, debouncedAnalyze]);


  const handleAnalyzeAll = useCallback(() => {
    scripts.forEach(script => {
        if (script.content) {
            handleAnalyze(script.id);
        }
    });
  }, [scripts, handleAnalyze]);

  const handleScriptContentChange = (id: number, content: string) => {
    setScripts(prev => prev.map(s => s.id === id ? { ...s, content } : s));
  };

  const handleAddScript = () => {
    const newId = Date.now();
    const newScript: Script = { id: newId, name: `script-${scripts.length + 1}.sh`, content: "#!/bin/bash\n\n" };
    setScripts(prev => [...prev, newScript]);
    setActiveScriptId(newId);
  };
  
  const handleRemoveScript = (id: number) => {
      setScripts(prev => prev.filter(s => s.id !== id));
      setAnalyses(prev => {
          const newAnalyses = {...prev};
          delete newAnalyses[id];
          return newAnalyses;
      });
      if (activeScriptId === id) {
          setActiveScriptId(scripts[0]?.id || 0);
      }
  }

  const handleApplyFix = useCallback((originalCode: string, refactoredCode: string) => {
    if (!activeScriptId) return;
    handleScriptContentChange(activeScriptId, activeScript?.content.replace(originalCode, refactoredCode) || '');
  }, [activeScript, activeScriptId]);

  const handleApplyAllFixes = useCallback((fixes: RefactorResponse[]) => {
    if (!activeScript) return;
    let currentScript = activeScript.content;
    fixes.forEach(fix => {
        currentScript = currentScript.replace(fix.originalCode, fix.refactoredCode);
    });
    handleScriptContentChange(activeScript.id, currentScript);
  }, [activeScript]);
  
  const handleExport = () => {
    if (!activeAnalysis) return;

    const generateHtml = (analysis: AnalysisResponse) => {
        const sections = [
            `<h1>Analysis Report for ${activeScript?.name}</h1>`,
            analysisSettings.summary ? `<h2>Summary</h2><p>${analysis.summary}</p>` : '',
            analysisSettings.strengths ? `<h2>Strengths</h2><ul>${analysis.strengths.map(s => `<li>${s}</li>`).join('')}</ul>` : '',
            analysisSettings.weaknesses ? `<h2>Weaknesses</h2><ul>${analysis.weaknesses.map(w => `<li>${w}</li>`).join('')}</ul>` : '',
        ].filter(Boolean).join('<hr>');
        
        return `<!DOCTYPE html><html><head><title>Analysis Report</title><style>body{font-family:sans-serif;line-height:1.6;padding:2rem;}ul{padding-left:20px;}h1,h2{border-bottom:1px solid #ccc;padding-bottom:5px;}</style></head><body>${sections}</body></html>`;
    }
    
    const htmlContent = generateHtml(activeAnalysis);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `analysis-report-${activeScript?.name}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header 
        isLiveAnalysis={isLiveAnalysis}
        onLiveAnalysisChange={setIsLiveAnalysis}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onExportClick={handleExport}
        isExportDisabled={!activeAnalysis}
      />
       {isSettingsOpen && (
        <SettingsModal 
          settings={analysisSettings} 
          onSettingsChange={setAnalysisSettings} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <CodeInput
            scripts={scripts}
            activeScriptId={activeScriptId}
            onActiveScriptChange={setActiveScriptId}
            onScriptContentChange={handleScriptContentChange}
            onAddScript={handleAddScript}
            onRemoveScript={handleRemoveScript}
            onAnalyze={() => activeScriptId && handleAnalyze(activeScriptId)}
            onAnalyzeAll={handleAnalyzeAll}
            isLoading={isAnalyzing}
          />
          <div className="bg-gray-800/50 rounded-xl shadow-2xl p-6 h-full min-h-[500px]">
            {isAnalyzing && <Spinner />}
            {error && !isAnalyzing && <ErrorMessage message={error} />}
            {activeAnalysis && !isAnalyzing && (
                <AnalysisResult 
                    key={activeScriptId}
                    analysis={activeAnalysis} 
                    scriptContent={activeScript?.content || ''}
                    onApplyFix={handleApplyFix}
                    onApplyAllFixes={handleApplyAllFixes}
                    analysisSettings={analysisSettings}
                />
            )}
            {!isAnalyzing && !error && !activeAnalysis && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                <h2 className="text-xl font-bold">Analysis Results for {activeScript?.name || "script"}</h2>
                <p className="mt-2 text-center">Your script analysis will appear here once you click the "Analyze" button.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;