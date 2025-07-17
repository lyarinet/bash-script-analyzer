
export interface CommandPart {
  part: string;
  explanation: string;
}

export interface GithubRepoSuggestion {
  readmeContent: string;
  gitignoreContent: string;
  fileStructure: string;
}

export interface AnalysisResponse {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  commandBreakdown: CommandPart[];
  githubRepo: GithubRepoSuggestion;
}
