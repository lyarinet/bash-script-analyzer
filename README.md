

---

# Bash Script Analyzer

An advanced tool that uses the Google Gemini API to analyze shell scripts, providing a detailed breakdown of functionality, strengths, weaknesses, and potential improvements. The user-friendly interface is built with React, Vite, and Tailwind CSS.



## ✨ Features

-   **In-Depth AI Analysis:** Leverages the Gemini API to provide a comprehensive understanding of any bash/shell script.
-   **Structured Feedback:** The analysis is broken down into clear sections:
    -   **Summary:** A high-level overview of the script's purpose.
    -   **Functionality Breakdown:** A detailed list of what each part of the script does.
    -   **Strengths:** Highlights well-implemented features and best practices.
    -   **Potential Improvements & Dangers:** Identifies weaknesses, security risks, and areas for refactoring.
-   **Interactive UI:** A clean, modern, and responsive single-page application built with React.
-   **Code-Ready Example:** Comes pre-loaded with a complex `ffmpeg` transcoding script to showcase the analyzer's capabilities.
-   **Fast & Modern Tooling:** Built with Vite for a fast development experience and optimized builds.
-   **Easy to Set Up:** Get up and running locally with just a few commands.

## 🛠️ Tech Stack

-   **Frontend:** [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
-   **AI:** [Google Gemini API](https://ai.google.dev/) via `@google/genai` SDK
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)

## 🚀 Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (version 18 or higher recommended)
-   An active Google Gemini API key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/lyarinet/bash-script-analyzer.git
    cd bash-script-analyzer
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    -   Create a new file named `.env.local` in the root of your project.
    -   Add your Gemini API key to this file. **Note:** Vite requires environment variables exposed to the browser to be prefixed with `VITE_`.

    ```ini
    # .env.local
    VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  Open your browser and navigate to the local URL provided in the terminal (usually `http://localhost:5173`).

You should now see the Bash Script Analyzer application running!

## ⚙️ How It Works

1.  **Input:** The user pastes their bash script into the code editor on the left side of the screen.
2.  **API Call:** When the "Analyze Script" button is clicked, the `handleAnalyze` function in `App.tsx` is triggered.
3.  **Gemini Service:** A service module (`src/services/geminiService.ts`) takes the script content and sends it to the Google Gemini API using the `@google/genai` SDK.
4.  **AI Processing:** A carefully crafted prompt instructs the Gemini model to perform a detailed analysis, identifying the script's summary, functionality, strengths, and weaknesses, and to return the output in a structured JSON format.
5.  **Display Results:** The React app receives the JSON response, parses it, and displays the analysis in a structured, easy-to-read format in the results panel on the right.

## 📁 Project Structure

```
.
├── public/                 # Static assets (like index.css)
├── src/
│   ├── components/         # Reusable React components
│   │   ├── AnalysisResult.tsx
│   │   ├── CodeInput.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── Header.tsx
│   │   └── Spinner.tsx
│   ├── services/
│   │   └── geminiService.ts  # Logic for interacting with the Gemini API
│   ├── types/
│   │   └── index.ts        # TypeScript type definitions (e.g., AnalysisResponse)
│   ├── App.tsx             # Main application component and layout
│   └── index.tsx           # React entry point
├── .env.local              # Local environment variables (not committed)
├── index.html              # Main HTML file for Vite
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## 📜 Available Scripts

In the project directory, you can run:

-   `npm run dev`: Starts the application in development mode with hot-reloading.
-   `npm run build`: Compiles and bundles the application for production into the `dist` folder.
-   `npm run preview`: Serves the production build locally to preview it before deployment.
