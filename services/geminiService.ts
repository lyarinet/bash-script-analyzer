
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResponse, RefactorResponse } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A brief, one-paragraph summary of the script's purpose and main functionality." },
    strengths: { type: Type.ARRAY, description: "A list of positive aspects of the script.", items: { type: Type.STRING } },
    weaknesses: { type: Type.ARRAY, description: "A list of potential issues or risks.", items: { type: Type.STRING } },
    suggestions: { type: Type.ARRAY, description: "A list of specific, actionable suggestions for improving the script.", items: { type: Type.STRING } },
    commandBreakdown: {
      type: Type.ARRAY,
      description: "A detailed breakdown of any major commands the script constructs.",
      items: {
        type: Type.OBJECT, properties: {
          part: { type: Type.STRING, description: "The command flag or argument." },
          explanation: { type: Type.STRING, description: "Explanation of this part." },
        }, required: ["part", "explanation"],
      },
    },
    securityAudit: {
        type: Type.ARRAY,
        description: "A security audit identifying vulnerabilities like command injection, hardcoded secrets, etc.",
        items: {
            type: Type.OBJECT, properties: {
                vulnerability: { type: Type.STRING, description: "The name of the vulnerability found."},
                recommendation: { type: Type.STRING, description: "How to fix the vulnerability."}
            }, required: ["vulnerability", "recommendation"]
        }
    },
    performanceProfile: {
        type: Type.ARRAY,
        description: "An analysis of potential performance bottlenecks like inefficient loops or commands.",
        items: {
            type: Type.OBJECT, properties: {
                issue: { type: Type.STRING, description: "The performance issue identified."},
                suggestion: { type: Type.STRING, description: "How to optimize it."}
            }, required: ["issue", "suggestion"]
        }
    },
    portabilityAnalysis: {
        type: Type.OBJECT,
        description: "Analysis of compatibility with other shells (POSIX compliance).",
        properties: {
            score: { type: Type.NUMBER, description: "A score from 1 (low) to 10 (high) for portability."},
            summary: { type: Type.STRING, description: "A summary of the portability."},
            issues: {
                type: Type.ARRAY, items: {
                    type: Type.OBJECT, properties: {
                        code: { type: Type.STRING, description: "The non-portable code."},
                        suggestion: { type: Type.STRING, description: "The POSIX-compliant alternative."}
                    }, required: ["code", "suggestion"]
                }
            }
        }, required: ["score", "summary", "issues"]
    },
    testSuite: {
        type: Type.OBJECT,
        description: "A generated test suite for the script using a common framework.",
        properties: {
            framework: { type: Type.STRING, description: "The testing framework used, e.g., 'bats-core'."},
            content: { type: Type.STRING, description: "The full content of the test script file."}
        }, required: ["framework", "content"]
    },
    translations: {
        type: Type.OBJECT,
        description: "Translation of the script's logic into other languages.",
        properties: {
            python: { type: Type.STRING, description: "The script's logic translated to Python."},
            powershell: { type: Type.STRING, description: "The script's logic translated to PowerShell."}
        }, required: ["python", "powershell"]
    },
    mermaidFlowchart: {
        type: Type.STRING,
        description: "A Mermaid.js flowchart diagram representing the script's logic. CRITICAL RULE: ALL node text MUST be enclosed in double quotes using the `id[\"...\"]` syntax. Any internal double quotes MUST be escaped as '&quot;'. Example: `A[\"echo &quot;Hello&quot;\"]`. Do NOT use other syntax like `A(text)`. This is mandatory."
    },
    githubRepo: {
      type: Type.OBJECT,
      description: "A suggested structure for a GitHub repository for this script.",
      properties: {
        readmeContent: { type: Type.STRING, description: "Full content for a README.md file." },
        gitignoreContent: { type: Type.STRING, description: "Full content for a .gitignore file." },
        fileStructure: { type: Type.STRING, description: "A text-based tree of the directory structure." },
        dockerfileContent: { type: Type.STRING, description: "Full content for a Dockerfile to containerize the script."},
        manPageContent: { type: Type.STRING, description: "Content for a UNIX-style man page for the script."},
        pullRequestTitle: { type: Type.STRING, description: "A concise, well-formed title for a pull request that would apply the improvement suggestions." },
        pullRequestBody: { type: Type.STRING, description: "A detailed markdown body for a pull request, explaining the changes and referencing the suggestions." },
      },
      required: ["readmeContent", "gitignoreContent", "fileStructure", "dockerfileContent", "manPageContent", "pullRequestTitle", "pullRequestBody"],
    }
  },
  required: ["summary", "strengths", "weaknesses", "suggestions", "commandBreakdown", "securityAudit", "performanceProfile", "portabilityAnalysis", "testSuite", "translations", "mermaidFlowchart", "githubRepo"],
};

const analysisPrompt = `You are an expert-level bash script analyzer. Your goal is to provide a comprehensive, multi-faceted analysis of the provided script. Generate a single JSON object that conforms to the provided schema.

Analysis Dimensions:
1.  **Core Analysis**: Provide a summary, strengths, weaknesses, and improvement suggestions.
2.  **Command Breakdown**: Deconstruct any major commands.
3.  **Security Audit**: Act as a security expert. Identify vulnerabilities like command injection, hardcoded secrets, insecure temp files, and permission issues. Provide clear recommendations.
4.  **Performance Profile**: Identify bottlenecks like inefficient commands (e.g., \`cat | grep\`) or slow loops. Suggest optimizations.
5.  **Portability Analysis**: Check for "bashisms" and non-POSIX features. Provide a portability score (1-10), a summary, and POSIX-compliant alternatives.
6.  **Test Generation**: Generate a simple test suite using the 'bats-core' framework. The tests should cover the script's basic functionality.
7.  **Translation**: Translate the script's core logic into Python and PowerShell.
8.  **Logic Visualization**: Generate a flowchart of the script's logic using Mermaid.js syntax.
    CRITICAL RULE: ALL node text, without exception, MUST be enclosed in double quotes using the format \`id["..."]\`.
    Any double quotes *inside* the node text MUST be escaped as the HTML entity \`&quot;\`.
    - **CORRECT**: \`A["Start"]\`
    - **CORRECT**: \`B["Set GREETING=&quot;Hello&quot;"]\`
    - **CORRECT**: \`C["echo &quot;User provided: $1&quot;"]\`
    - **INCORRECT**: \`A(Start)\`
    - **INCORRECT**: \`B[Set GREETING="Hello"]\`
    - **INCORRECT**: \`C(echo "User provided: $1")\`
    This rule is mandatory to prevent all parsing errors.
9.  **Repo Generation**: Suggest files for a new GitHub repo: a detailed README.md, a standard .gitignore, a directory tree, a Dockerfile to run the script, and a UNIX-style man page.
10. **Pull Request Suggestion**: Generate a title and markdown body for a GitHub Pull Request that would implement the suggested refactorings. The body should clearly summarize the purpose of the changes.

SCRIPT TO ANALYZE:
\`\`\`bash
_SCRIPT_CONTENT_
\`\`\``;


export const analyzeScript = async (script: string): Promise<AnalysisResponse> => {
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: analysisPrompt.replace('_SCRIPT_CONTENT_', script),
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const jsonText = result.text.trim();
    const parsedResponse = JSON.parse(jsonText);
    
    // Deeper validation
    if (
      !parsedResponse.summary ||
      !Array.isArray(parsedResponse.strengths) ||
      !Array.isArray(parsedResponse.weaknesses) ||
      !Array.isArray(parsedResponse.suggestions) ||
      !Array.isArray(parsedResponse.commandBreakdown) ||
      !Array.isArray(parsedResponse.securityAudit) ||
      !Array.isArray(parsedResponse.performanceProfile) ||
      !parsedResponse.portabilityAnalysis ||
      !parsedResponse.testSuite ||
      !parsedResponse.translations ||
      !parsedResponse.mermaidFlowchart ||
      !parsedResponse.githubRepo ||
      !parsedResponse.githubRepo.pullRequestTitle
    ) {
      throw new Error("API response is missing required fields.");
    }
    
    // Clean up multiline string fields that might have escaped newlines
    const cleanString = (str: unknown) => (typeof str === 'string' ? str.replace(/\\n/g, '\n') : str);
    
    if (parsedResponse.githubRepo) {
        parsedResponse.githubRepo.readmeContent = cleanString(parsedResponse.githubRepo.readmeContent);
        parsedResponse.githubRepo.gitignoreContent = cleanString(parsedResponse.githubRepo.gitignoreContent);
        parsedResponse.githubRepo.fileStructure = cleanString(parsedResponse.githubRepo.fileStructure);
        parsedResponse.githubRepo.dockerfileContent = cleanString(parsedResponse.githubRepo.dockerfileContent);
        parsedResponse.githubRepo.manPageContent = cleanString(parsedResponse.githubRepo.manPageContent);
        parsedResponse.githubRepo.pullRequestBody = cleanString(parsedResponse.githubRepo.pullRequestBody);
    }
    if(parsedResponse.testSuite) {
        parsedResponse.testSuite.content = cleanString(parsedResponse.testSuite.content);
    }
    if(parsedResponse.translations) {
        parsedResponse.translations.python = cleanString(parsedResponse.translations.python);
        parsedResponse.translations.powershell = cleanString(parsedResponse.translations.powershell);
    }
    parsedResponse.mermaidFlowchart = cleanString(parsedResponse.mermaidFlowchart);


    return parsedResponse as AnalysisResponse;

  } catch (error) {
    console.error("Error analyzing script with Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to get analysis from Gemini API: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
};

const refactorResponseSchema = {
  type: Type.OBJECT,
  properties: {
    originalCode: {
      type: Type.STRING,
      description: "The original code snippet from the script that needs to be changed.",
    },
    refactoredCode: {
      type: Type.STRING,
      description: "The new, improved code snippet that implements the suggestion.",
    },
    explanation: {
        type: Type.STRING,
        description: "A brief explanation of what was changed and why."
    }
  },
  required: ["originalCode", "refactoredCode", "explanation"],
};

export const getRefactoredCode = async (script: string, suggestion: string): Promise<RefactorResponse> => {
    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a bash script refactoring expert.
Given the following bash script:
--- SCRIPT START ---
${script}
--- SCRIPT END ---

And the following improvement suggestion:
'${suggestion}'

Please provide a JSON object containing the original code snippet to be replaced, the refactored code snippet that implements the suggestion, and a brief explanation of the change.
The JSON object must have keys: "originalCode", "refactoredCode", and "explanation".
Focus only on the code snippet relevant to the suggestion. Do not provide the full script back.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: refactorResponseSchema,
            }
        });

        const jsonText = result.text.trim();
        const parsedResponse = JSON.parse(jsonText);

        if (
            typeof parsedResponse.originalCode === 'undefined' ||
            typeof parsedResponse.refactoredCode === 'undefined' ||
            typeof parsedResponse.explanation === 'undefined'
        ) {
            throw new Error("API response for refactoring is missing required fields.");
        }
        
        const cleanString = (str: unknown) => (typeof str === 'string' ? str.replace(/\\n/g, '\n') : str);
        parsedResponse.originalCode = (cleanString(parsedResponse.originalCode) as string).trim();
        parsedResponse.refactoredCode = cleanString(parsedResponse.refactoredCode);
        parsedResponse.explanation = cleanString(parsedResponse.explanation);

        return parsedResponse as RefactorResponse;

    } catch (error) {
        console.error("Error getting refactored code with Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get refactoring from Gemini API: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the Gemini API for refactoring.");
    }
};

export const getRefactoringsForAll = async (script: string, suggestions: string[]): Promise<RefactorResponse[]> => {
    const refactorAllSchema = {
        type: Type.ARRAY,
        description: "A list of refactoring objects, one for each suggestion.",
        items: {
            type: Type.OBJECT,
            properties: {
                suggestion: { type: Type.STRING, description: "The improvement suggestion this refactoring is for." },
                originalCode: { type: Type.STRING, description: "The original code snippet to be changed." },
                refactoredCode: { type: Type.STRING, description: "The new, improved code snippet." },
                explanation: { type: Type.STRING, description: "A brief explanation of the change." }
            },
            required: ["suggestion", "originalCode", "refactoredCode", "explanation"],
        }
    };

    try {
        const suggestionsList = suggestions.map(s => `- ${s}`).join('\n');
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a bash script refactoring expert.
Given the following bash script:
--- SCRIPT START ---
${script}
--- SCRIPT END ---

And the following list of improvement suggestions:
--- SUGGESTIONS START ---
${suggestionsList}
--- SUGGESTIONS END ---

For each suggestion, please provide a JSON object containing the original suggestion text, the original code snippet to be replaced, the refactored code snippet that implements the suggestion, and a brief explanation of the change.
Return a single JSON array containing these objects.
Each object in the array must have keys: "suggestion", "originalCode", "refactoredCode", and "explanation".
Focus only on the code snippet relevant to the suggestion. Do not provide the full script back.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: refactorAllSchema,
            }
        });

        const jsonText = result.text.trim();
        const parsedResponse = JSON.parse(jsonText);

        if (!Array.isArray(parsedResponse)) {
            throw new Error("API response for all refactorings is not an array.");
        }
        
        const cleanString = (str: unknown) => (typeof str === 'string' ? str.replace(/\\n/g, '\n') : str);

        parsedResponse.forEach(item => {
            if ( !item.suggestion || !item.originalCode || !item.refactoredCode || !item.explanation ) {
                throw new Error("An item in the refactoring array is missing required fields.");
            }
            item.originalCode = (cleanString(item.originalCode) as string).trim();
            item.refactoredCode = cleanString(item.refactoredCode);
            item.explanation = cleanString(item.explanation);
        });

        return parsedResponse as RefactorResponse[];

    } catch (error) {
        console.error("Error getting all refactored code with Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get all refactorings from Gemini API: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the Gemini API for all refactorings.");
    }
};


export const askQuestionAboutScript = async (script: string, question: string): Promise<string> => {
    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are an intelligent assistant integrated into a bash script analysis tool. Your purpose is to answer user questions specifically about the bash script provided below.

RULES:
- Base all your answers strictly on the provided script content. Do not invent functionality that isn't present.
- If the question is unclear or unrelated to the script, politely state that you can only answer questions about the provided script.
- Keep your answers concise and to the point.
- Use markdown for formatting, especially for code snippets (\` \` for inline code, and \`\`\`bash ... \`\`\` for code blocks).

--- SCRIPT CONTENT ---
${script}
--- END SCRIPT CONTENT ---

USER QUESTION: "${question}"

Your Answer:`,
        });

        return result.text;
    } catch (error) {
        console.error("Error asking question with Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get answer from Gemini API: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the Gemini API for Q&A.");
    }
};
