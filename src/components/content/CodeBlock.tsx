import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface CodeBlockProps {
  className?: string;
  children: string;
}

export default function CodeBlock({ className, children }: CodeBlockProps) {
  const language = className ? className.replace(/language-/, '') : 'text';
  
  return (
    <div className="code-block-container my-4 rounded-md overflow-hidden">
      <div className="code-header flex items-center justify-between bg-gray-800 px-4 py-2">
        <span className="text-gray-300 text-sm">{language}</span>
        <button 
          className="text-gray-300 hover:text-white"
          onClick={() => navigator.clipboard.writeText(children)}
        >
          Copy
        </button>
      </div>
      <SyntaxHighlighter 
        language={language} 
        style={coldarkDark}
        className="rounded-b-md"
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}