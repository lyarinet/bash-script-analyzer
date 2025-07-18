
export interface CommandPart {
  part: string;
  explanation: string;
}

export interface SecurityIssue {
    vulnerability: string;
    recommendation: string;
}

export interface PerformanceIssue {
    issue: string;
    suggestion: string;
}

export interface PortabilityIssue {
    code: string;
    suggestion: string;
}

export interface PortabilityAnalysis {
    score: number;
    summary: string;
    issues: PortabilityIssue[];
}

export interface TestSuite {
    framework: string;
    content: string;
}

export interface GithubRepoSuggestion {
  readmeContent: string;
  gitignoreContent: string;
  fileStructure: string;
  dockerfileContent: string;
  manPageContent: string;
}

export interface AnalysisResponse {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  commandBreakdown: CommandPart[];
  securityAudit: SecurityIssue[];
  performanceProfile: PerformanceIssue[];
  portabilityAnalysis: PortabilityAnalysis;
  testSuite: TestSuite;
  translations: {
    python: string;
    powershell: string;
  };
  mermaidFlowchart: string;
  githubRepo: GithubRepoSuggestion;
}

export interface RefactorResponse {
  originalCode: string;
  refactoredCode: string;
  explanation: string;
  suggestion?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}