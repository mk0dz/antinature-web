'use client';

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface CodeBlockProps {
  className?: string;
  children: string;
}

export default function CodeBlock({ className, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const language = className ? className.replace(/language-/, '') : 'text';
  
  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    
    <div className="code-block-container my-4 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
      <link href="https://fonts.googleapis.com/css2?family=Chivo+Mono:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet"></link>
      <div style={{fontFamily: 'Chivo Mono'}} className="code-header flex items-center justify-between bg-gray-800 px-4 py-2">
        <span className="text-gray-300 text-sm font-mono">{language}</span>
        <button 
          className="text-gray-300 hover:text-white transition-colors px-3 py-1 rounded-md flex items-center gap-2 hover:bg-gray-700"
          onClick={handleCopy}
          aria-label="Copy code"
          title="Copy code"
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" />
                <path d="M7 8a1 1 0 012 0v.5a1 1 0 01-1 1H7v1a1 1 0 001 1h.5a1 1 0 010 2h-2a1 1 0 01-1-1v-5a1 1 0 011-1h.5z" />
                <path d="M12 8a1 1 0 00-1 1v.5h1.5a1 1 0 110 2H11v1a1 1 0 102 0v-3.5a1 1 0 00-1-1z" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter 
        language={language} 
        style={coldarkDark}
        className="rounded-b-md"
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.9rem',
          lineHeight: 1.5,
        }}
        showLineNumbers={true}
        wrapLines={true}
        wrapLongLines={true}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}