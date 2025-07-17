
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResponse } from '../types';

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

    return parsedResponse as AnalysisResponse;

  } catch (error) {
    console.error("Error analyzing script with Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to get analysis from Gemini API: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
};
