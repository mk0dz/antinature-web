'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import Image from 'next/image';

interface CellOutput {
  output_type: string;
  data?: {
    'text/plain'?: string[];
    'text/html'?: string[];
    'image/png'?: string;
    'application/vnd.jupyter.widget-view+json'?: any;
    'text/latex'?: string[];
  };
  text?: string[];
  traceback?: string[];
}

interface NotebookCell {
  cell_type: 'markdown' | 'code';
  source: string[];
  outputs?: CellOutput[];
  execution_count?: number | null;
}

interface NotebookData {
  cells: NotebookCell[];
  metadata: any;
}

interface NotebookRendererProps {
  notebook: NotebookData;
}

export default function NotebookRenderer({ notebook }: NotebookRendererProps) {
  const [expandedCells, setExpandedCells] = useState<{[key: number]: boolean}>({});

  const toggleCell = (index: number) => {
    setExpandedCells(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const renderMarkdownCell = (source: string[]) => {
    // Simple markdown rendering - in a real app you might use a markdown library
    const markdown = source.join('');
    
    // Handle math expressions
    const parts = markdown.split(/(\$\$.*?\$\$|\$.*?\$)/s);
    
    return (
      <div className="prose dark:prose-invert max-w-none mb-4">
        {parts.map((part, i) => {
          if (part.startsWith('$$') && part.endsWith('$$')) {
            // Block math
            return <BlockMath key={i} math={part.slice(2, -2)} />;
          } else if (part.startsWith('$') && part.endsWith('$')) {
            // Inline math
            return <InlineMath key={i} math={part.slice(1, -1)} />;
          }
          
          // Regular markdown - this is a simplified implementation
          // In a production app, use a proper markdown renderer
          return (
            <div key={i} dangerouslySetInnerHTML={{ __html: part
              .replace(/# (.*)/g, '<h1>$1</h1>')
              .replace(/## (.*)/g, '<h2>$1</h2>')
              .replace(/### (.*)/g, '<h3>$1</h3>')
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/`(.*?)`/g, '<code>$1</code>')
              .replace(/\n\n/g, '<br/><br/>')
            }} />
          );
        })}
      </div>
    );
  };

  const renderCodeCell = (cell: NotebookCell, index: number) => {
    const isExpanded = expandedCells[index] === undefined ? true : expandedCells[index];
    const code = cell.source.join('');
    
    return (
      <div className="mb-6 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
        <div 
          className="flex justify-between items-center py-2 px-4 bg-gray-100 dark:bg-gray-800 cursor-pointer"
          onClick={() => toggleCell(index)}
        >
          <div className="font-mono text-sm">
            {cell.execution_count !== null ? `In [${cell.execution_count}]:` : 'In [ ]:'}
          </div>
          <button className="text-gray-500 dark:text-gray-400">
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
        
        {isExpanded && (
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900">
            <SyntaxHighlighter
              language="python"
              style={oneDark}
              customStyle={{ margin: 0 }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        )}
        
        {isExpanded && cell.outputs && cell.outputs.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-2 bg-white dark:bg-gray-950">
              {cell.outputs.map((output, i) => renderOutput(output, i))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOutput = (output: CellOutput, key: number) => {
    switch (output.output_type) {
      case 'execute_result':
      case 'display_data':
        if (output.data) {
          // Handle HTML output
          if (output.data['text/html']) {
            return (
              <div 
                key={key}
                dangerouslySetInnerHTML={{ __html: output.data['text/html'].join('') }} 
              />
            );
          }
          
          // Handle LaTeX output
          if (output.data['text/latex']) {
            return (
              <BlockMath key={key} math={output.data['text/latex'].join('').replace(/\$\$(.*?)\$\$/s, '$1')} />
            );
          }
          
          // Handle image output
          if (output.data['image/png']) {
            return (
              <div key={key} className="my-2">
                <img 
                  src={`data:image/png;base64,${output.data['image/png']}`}
                  alt="Output"
                  className="max-w-full"
                />
              </div>
            );
          }
          
          // Handle plain text
          if (output.data['text/plain']) {
            return (
              <pre key={key} className="font-mono text-sm overflow-x-auto p-2">
                {output.data['text/plain'].join('')}
              </pre>
            );
          }
        }
        return null;
        
      case 'stream':
        return (
          <pre key={key} className="font-mono text-sm overflow-x-auto p-2">
            {output.text?.join('') || ''}
          </pre>
        );
        
      case 'error':
        return (
          <pre key={key} className="font-mono text-sm bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-2 overflow-x-auto">
            {output.traceback?.join('') || ''}
          </pre>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="notebook-container py-4">
      {notebook.cells.map((cell, index) => (
        <div key={index} className="mb-4">
          {cell.cell_type === 'markdown' 
            ? renderMarkdownCell(cell.source)
            : renderCodeCell(cell, index)
          }
        </div>
      ))}
    </div>
  );
} 