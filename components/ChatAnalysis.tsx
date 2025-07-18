
import React, { useState, useCallback, useRef, useEffect } from 'react';
// @ts-ignore
import { marked } from 'https://esm.sh/marked@12.0.2';
import { ChatMessage } from '../types';
import { askQuestionAboutScript } from '../services/geminiService';

interface ChatAnalysisProps {
  scriptContent: string;
}

const ChatAnalysis: React.FC<ChatAnalysisProps> = ({ scriptContent }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const assistantResponse = await askQuestionAboutScript(scriptContent, input);
      const assistantMessage: ChatMessage = { role: 'assistant', content: assistantResponse };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = { role: 'assistant', content: `Sorry, I encountered an error: ${err instanceof Error ? err.message : 'Unknown error'}` };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, scriptContent]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  const AssistantMessage: React.FC<{ content: string }> = ({ content }) => {
      const htmlContent = marked.parse(content);
      return <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  };

  return (
    <div className="flex flex-col h-[500px] bg-gray-900/50 rounded-lg">
        <p className="p-3 text-sm text-gray-400 border-b border-gray-700/50">
            Ask a question about the script to understand it better.
        </p>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-violet-500/50 flex-shrink-0 flex items-center justify-center text-violet-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 12.586V8a6 6 0 00-6-6zM10 16a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
              </div>
            )}
            <div className={`max-w-xl p-3 rounded-xl ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
              {msg.role === 'user' ? msg.content : <AssistantMessage content={msg.content} />}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-indigo-500/50 flex-shrink-0 flex items-center justify-center text-indigo-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-3">
                 <div className="w-8 h-8 rounded-full bg-violet-500/50 flex-shrink-0 flex items-center justify-center text-violet-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 12.586V8a6 6 0 00-6-6zM10 16a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                </div>
                <div className="max-w-xl p-3 rounded-xl bg-gray-700 text-gray-300 flex items-center">
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse [animation-delay:-0.15s] mx-1"></div>
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t border-gray-700/50 flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          disabled={isLoading}
          className="w-full bg-gray-800 text-gray-300 placeholder-gray-500 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-700"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatAnalysis;
