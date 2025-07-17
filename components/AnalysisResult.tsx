
import React from 'react';
import { AnalysisResponse, CommandPart } from '../types';
import AnalysisSection from './AnalysisSection';
import CodeBlock from './CodeBlock';

interface AnalysisResultProps {
  analysis: AnalysisResponse;
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


const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis }) => {
  return (
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

      <AnalysisSection title="Improvement Suggestions" icon="lightbulb">
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          {analysis.suggestions.map((suggestion, index) => <li key={index}>{suggestion}</li>)}
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
                    <h4 className="text-md font-semibold text-gray-200">README.md</h4>
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
  );
};

export default AnalysisResult;
