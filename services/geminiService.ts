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
    summary: {
      type: Type.STRING,
      description: "A brief, one-paragraph summary of the script's purpose and main functionality.",
    },
    strengths: {
      type: Type.ARRAY,
      description: "A list of positive aspects of the script, such as good error handling, modularity, or clear structure.",
      items: { type: Type.STRING },
    },
    weaknesses: {
      type: Type.ARRAY,
      description: "A list of potential issues, risks, or areas lacking in the script, such as security vulnerabilities or potential bugs.",
      items: { type: Type.STRING },
    },
    suggestions: {
      type: Type.ARRAY,
      description: "A list of specific, actionable suggestions for improving the script.",
      items: { type: Type.STRING },
    },
    commandBreakdown: {
      type: Type.ARRAY,
      description: "A detailed breakdown of the main ffmpeg command the script constructs. Each part of the command should be explained.",
      items: {
        type: Type.OBJECT,
        properties: {
          part: {
            type: Type.STRING,
            description: "The specific command flag or argument (e.g., '-c:v libx264').",
          },
          explanation: {
            type: Type.STRING,
            description: "A clear explanation of what this part of the command does.",
          },
        },
        required: ["part", "explanation"],
      },
    },
    githubRepo: {
      type: Type.OBJECT,
      description: "A suggested structure for a GitHub repository for this script.",
      properties: {
        readmeContent: {
          type: Type.STRING,
          description: "The full content for a README.md file, formatted in Markdown. It should include a title, description, features, and usage sections."
        },
        gitignoreContent: {
          type: Type.STRING,
          description: "The full content for a standard .gitignore file suitable for a shell script project."
        },
        fileStructure: {
          type: Type.STRING,
          description: "A simple text-based tree representation of the suggested directory structure."
        }
      },
      required: ["readmeContent", "gitignoreContent", "fileStructure"],
    }
  },
  required: ["summary", "strengths", "weaknesses", "suggestions", "commandBreakdown", "githubRepo"],
};

export const analyzeScript = async (script: string): Promise<AnalysisResponse> => {
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following bash script. Provide a detailed breakdown of its functionality, strengths, weaknesses, and suggestions for improvement. Also, provide a detailed breakdown of the ffmpeg command it generates. Finally, based on the script, generate a suggested GitHub repository structure. This should include: 1. The full content for a README.md file, formatted in Markdown. 2. The full content for a standard .gitignore file for a shell script project. 3. A simple text-based tree representation of the suggested directory structure.\n\nSCRIPT:\n\`\`\`bash\n${script}\n\`\`\``,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const jsonText = result.text.trim();
    const parsedResponse = JSON.parse(jsonText);
    
    // Basic validation to ensure the parsed object matches the expected structure
    if (
      !parsedResponse.summary ||
      !Array.isArray(parsedResponse.strengths) ||
      !Array.isArray(parsedResponse.weaknesses) ||
      !Array.isArray(parsedResponse.suggestions) ||
      !Array.isArray(parsedResponse.commandBreakdown) ||
      !parsedResponse.githubRepo
    ) {
      throw new Error("API response is missing required fields.");
    }
    
    // Clean up string fields that might have escaped newlines from the API response.
    // This ensures that content like READMEs and file trees render with proper line breaks.
    if (parsedResponse.githubRepo) {
        if (typeof parsedResponse.githubRepo.readmeContent === 'string') {
            parsedResponse.githubRepo.readmeContent = parsedResponse.githubRepo.readmeContent.replace(/\\n/g, '\n');
        }
        if (typeof parsedResponse.githubRepo.gitignoreContent === 'string') {
            parsedResponse.githubRepo.gitignoreContent = parsedResponse.githubRepo.gitignoreContent.replace(/\\n/g, '\n');
        }
        if (typeof parsedResponse.githubRepo.fileStructure === 'string') {
            parsedResponse.githubRepo.fileStructure = parsedResponse.githubRepo.fileStructure.replace(/\\n/g, '\n');
        }
    }

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

        // Stricter validation to ensure all required fields are present.
        if (
            typeof parsedResponse.originalCode === 'undefined' ||
            typeof parsedResponse.refactoredCode === 'undefined' ||
            typeof parsedResponse.explanation === 'undefined'
        ) {
            throw new Error("API response for refactoring is missing required fields.");
        }
        
        // Clean up multiline strings that might have escaped newlines.
        if (typeof parsedResponse.originalCode === 'string') {
            parsedResponse.originalCode = parsedResponse.originalCode.replace(/\\n/g, '\n');
        }
        if (typeof parsedResponse.refactoredCode === 'string') {
            parsedResponse.refactoredCode = parsedResponse.refactoredCode.replace(/\\n/g, '\n');
        }
        if (typeof parsedResponse.explanation === 'string') {
            parsedResponse.explanation = parsedResponse.explanation.replace(/\\n/g, '\n');
        }

        return parsedResponse as RefactorResponse;

    } catch (error) {
        console.error("Error getting refactored code with Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get refactoring from Gemini API: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the Gemini API for refactoring.");
    }
};