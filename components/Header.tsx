
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-6v2M9 19v2m6-6v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3M5.636 5.636l-.707-.707M18.364 18.364l-.707-.707M5.636 18.364l-.707.707M18.364 5.636l-.707.707" />
        </svg>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Bash Script Analyzer
        </h1>
      </div>
    </header>
  );
};

export default Header;
