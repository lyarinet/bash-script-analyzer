
import React from 'react';

interface AnalysisSectionProps {
  title: string;
  children: React.ReactNode;
  icon?: 'check' | 'warning' | 'lightbulb' | 'github' | 'shield' | 'bolt' | 'globe' | 'beaker' | 'translate' | 'flowchart' | 'chat' | 'pr';
  headerAction?: React.ReactNode;
}

const Icons: Record<string, React.ReactNode> = {
    check: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
    warning: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    lightbulb: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    github: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg>,
    shield: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5.05l.162.345a1.956 1.956 0 01-1.012 2.68l-.24.12a1.956 1.956 0 00-1.012 2.68l.162.345A11.954 11.954 0 0110 18.056a11.954 11.954 0 017.834-13.005l.162-.345a1.956 1.956 0 00-1.012-2.68l-.24-.12a1.956 1.956 0 01-1.012-2.68L17.834 5.05A11.954 11.954 0 0110 1.944zM9 13a1 1 0 112 0v2a1 1 0 11-2 0v-2zm1-8a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>,
    bolt: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>,
    globe: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.998 5.998 0 0116 10c0 .954-.223 1.856-.619 2.657a6 6 0 01-2.668 2.668A5.998 5.998 0 0110 16c-.954 0-1.856-.223-2.657-.619a6 6 0 01-2.668-2.668A5.998 5.998 0 014 10c0-.343.023-.678.068-1.007l.264.933a1.5 1.5 0 002.484.444l.004-.004A1.5 1.5 0 008 8.5V8a1 1 0 01-1-1 1.5 1.5 0 00-1.5-1.5h-.032l-.298.297z" clipRule="evenodd" /></svg>,
    beaker: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-fuchsia-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 2a1 1 0 00-.707.293L4.586 4H3a1 1 0 00-1 1v9a2 2 0 002 2h10a2 2 0 002-2V5a1 1 0 00-1-1h-1.586l-1.707-1.707A1 1 0 0013 2H7zm4 6a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" /></svg>,
    translate: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor"><path d="M5 8a1 1 0 100 2h1.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L6.586 8H5z" /><path d="M10 3a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V6h-1a1 1 0 110-2h1V4a1 1 0 011-1z" /><path d="M15.707 14.293a1 1 0 01-1.414 0l-1.293-1.293H11a1 1 0 110-2h1.586l-1.293-1.293a1 1 0 111.414-1.414l3 3a1 1 0 010 1.414l-3 3a1 1 0 010-1.414L13.414 15H15a1 1 0 110 2h-1.586l1.293 1.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" /></svg>,
    flowchart: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12 3a1 1 0 01.993.883L13 4v2h2a1 1 0 01.993.883L16 7v2a1 1 0 01-1 1h-1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2H9a1 1 0 01-1-1V7a1 1 0 011-1h2V4a1 1 0 011-1zM4 3a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V3zm0 10a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zM10 13a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z" clipRule="evenodd" /></svg>,
    chat: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.08-3.242A1.957 1.957 0 002 12c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.417 11a1 1 0 00-1.833.834L3.5 12a1 1 0 001.833-.834L4.5 11h-.083zM10 11a1 1 0 100-2 1 1 0 000 2zm3.583-1a1 1 0 10-1.833.834L12.5 11a1 1 0 101.833-.834L13.5 10h.083z" clipRule="evenodd" /></svg>,
    pr: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L8.586 12H4a1 1 0 110-2h4.586l-1.293-1.293a1 1 0 011.414-1.414l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414 0z" clipRule="evenodd" /><path fillRule="evenodd" d="M10 3a1 1 0 011 1v1.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L9 5.586V4a1 1 0 011-1z" clipRule="evenodd" /><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
};


const AnalysisSection: React.FC<AnalysisSectionProps> = ({ title, children, icon, headerAction }) => {
  return (
    <section>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-semibold text-gray-100 flex items-center">
          {icon && <span className="mr-2">{Icons[icon]}</span>}
          {title}
        </h3>
        {headerAction}
      </div>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        {children}
      </div>
    </section>
  );
};

export default AnalysisSection;
