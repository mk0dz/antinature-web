'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import katex from 'katex';

interface SimplifiedMDXContentProps {
  content: string;
}

// Define a custom Text component that will look for math placeholders
const MathText = ({ 
  text, 
  mathExpressions 
}: { 
  text: string, 
  mathExpressions: {[key: string]: string} 
}) => {
  // Check if this is a math placeholder
  if (text.startsWith('DISPLAY_MATH_') && mathExpressions[text]) {
    try {
      const html = katex.renderToString(mathExpressions[text], {
        displayMode: true,
        throwOnError: false,
        strict: false
      });
      // Return the HTML as a string with a special marker for later replacement
      return <span data-math-display="true" dangerouslySetInnerHTML={{ __html: html }} />;
    } catch (err) {
      console.error('Error rendering display math:', err);
      return <span className="math-error">Error rendering: {mathExpressions[text]}</span>;
    }
  }
  
  if (text.startsWith('INLINE_MATH_') && mathExpressions[text]) {
    try {
      const html = katex.renderToString(mathExpressions[text], {
        displayMode: false,
        throwOnError: false, 
        strict: false
      });
      return <span className="math-inline" dangerouslySetInnerHTML={{ __html: html }} />;
    } catch (err) {
      console.error('Error rendering inline math:', err);
      return <span className="math-error">Error rendering: {mathExpressions[text]}</span>;
    }
  }
  
  // Regular text, just return it
  return <>{text}</>;
};

// Custom paragraph component to handle math expressions
const CustomParagraph = ({ 
  children, 
  mathExpressions 
}: { 
  children: React.ReactNode, 
  mathExpressions: {[key: string]: string} 
}) => {
  // Process all children
  const processedChildren = React.Children.toArray(children).map((child, index) => {
    if (typeof child === 'string') {
      return <MathText key={index} text={child} mathExpressions={mathExpressions} />;
    }
    return child;
  });
  
  // Use a div instead of p to avoid HTML nesting issues
  return (
    <div className="mb-4 text-base leading-7">
      {processedChildren.map((child, index) => {
        // Check if this is a display math element and apply proper styling
        if (React.isValidElement(child) && child.props['data-math-display']) {
          return (
            <div key={index} className="math-display my-4">
              {React.cloneElement(child)}
            </div>
          );
        }
        return child;
      })}
    </div>
  );
};

export default function SimplifiedMDXContent({ content }: SimplifiedMDXContentProps) {
  const [sanitizedContent, setSanitizedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mathExpressions, setMathExpressions] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (!content) {
      setError('No content provided');
      setIsLoading(false);
      return;
    }

    try {
      // Check if content is a JSON string from a Jupyter notebook
      let processedContent = content;
      
      if (content.trim().startsWith('{') && content.includes('"cells"')) {
        processedContent = extractTextFromJupyterNotebook(content);
      }
      
      // Apply aggressive sanitization to the content
      const { sanitized, mathExps } = sanitizeMarkdownWithMath(processedContent);
      setSanitizedContent(sanitized);
      setMathExpressions(mathExps);
    } catch (err: unknown) {
      console.error('Error sanitizing content:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error preparing content: ${errorMessage}`);
      // Still try to render the original content as a fallback
      setSanitizedContent(content);
    }
    
    setIsLoading(false);
  }, [content]);

  // Helper function to sanitize markdown and extract math expressions
  function sanitizeMarkdownWithMath(markdown: string): { sanitized: string, mathExps: {[key: string]: string} } {
    console.log('Sanitizing markdown content with math extraction...');
    let sanitized = markdown;
    const mathExps: {[key: string]: string} = {};
    
    // Replace code blocks first to protect them from processing
    const codeBlocks: string[] = [];
    sanitized = sanitized.replace(/```[\s\S]*?```/g, (match) => {
      const placeholder = `CODE_BLOCK_${codeBlocks.length}`;
      codeBlocks.push(match);
      return placeholder;
    });
    
    // Extract display math ($$...$$)
    let displayMathCounter = 0;
    sanitized = sanitized.replace(/\$\$([\s\S]*?)\$\$/g, (match, expr) => {
      const placeholder = `DISPLAY_MATH_${displayMathCounter}`;
      mathExps[placeholder] = expr.trim();
      displayMathCounter++;
      return placeholder;
    });
    
    // Extract inline math ($...$)
    let inlineMathCounter = 0;
    sanitized = sanitized.replace(/\$([^\$\n]+?)\$/g, (match, expr) => {
      const placeholder = `INLINE_MATH_${inlineMathCounter}`;
      mathExps[placeholder] = expr.trim();
      inlineMathCounter++;
      return placeholder;
    });
    
    // Fix problematic table cells like empty cells
    sanitized = sanitized.replace(/\|\s*\|/g, '| |');
    
    // Aggressively handle tables
    // First, add empty lines around tables
    sanitized = sanitized.replace(/([^\n])\n(\|(?:.*\|)+)/g, '$1\n\n$2');
    sanitized = sanitized.replace(/(\|(?:.*\|)+)\n([^\n])/g, '$1\n\n$2');
    
    // Fix table rows with inconsistent cell counts
    const tableRegex = /(\|(?:.*\|)+\n)+/g;
    sanitized = sanitized.replace(tableRegex, (tableBlock) => {
      try {
        // Split into rows and process
        const rows = tableBlock.trim().split('\n');
        if (rows.length < 2) return tableBlock; // Not a real table
        
        // Count cells in each row
        const cellCounts = rows.map(row => (row.match(/\|/g) || []).length - 1);
        const maxCells = Math.max(...cellCounts);
        
        // Fix rows with fewer cells
        const fixedRows = rows.map((row) => {
          const currentCells = (row.match(/\|/g) || []).length - 1;
          if (currentCells < maxCells) {
            return row.replace(/\|$/, ' |'.repeat(maxCells - currentCells) + '|');
          }
          return row;
        });
        
        // Ensure there's a separator row if this looks like a table with a header
        if (rows.length >= 2 && !rows[1].includes('-')) {
          const separatorRow = '|' + ' --- |'.repeat(maxCells);
          fixedRows.splice(1, 0, separatorRow);
        }
        
        return fixedRows.join('\n') + '\n';
      } catch (err) {
        console.error('Error processing table:', err);
        // If anything goes wrong, return a simplified version of the table
        return tableBlock.replace(/\|/g, '\\|');
      }
    });
    
    // Process headings to ensure proper spacing
    sanitized = sanitized.replace(/^(#{1,6})\s*(.+)$/gm, (match, hashes, text) => {
      return `${hashes} ${text.trim()}`;
    });
    
    // Ensure there's a blank line before headings
    sanitized = sanitized.replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2');
    
    // Restore code blocks
    sanitized = sanitized.replace(/CODE_BLOCK_(\d+)/g, (_, index) => 
      codeBlocks[parseInt(index)] || '```\nCode block error\n```'
    );
    
    // Remove problematic imports/exports
    sanitized = sanitized.replace(/import\s+.*\s+from\s+["'].*["']/g, '<!-- import removed -->');
    sanitized = sanitized.replace(/export\s+.*{.*}/g, '<!-- export removed -->');
    
    // Remove problematic HTML that react-markdown might not handle well
    sanitized = sanitized.replace(/<(script|style|iframe)[\s\S]*?<\/\1>/gi, '<!-- removed -->');
    
    // Ensure proper spacing for list items
    sanitized = sanitized.replace(/^(\s*)([*+-]|\d+\.)\s*/gm, '$1$2 ');
    
    console.log('Sanitization complete with math extraction');
    console.log(`Extracted ${displayMathCounter} display math and ${inlineMathCounter} inline math expressions`);
    return { sanitized, mathExps };
  }

  // Function to extract markdown and code text from Jupyter notebook JSON
  function extractTextFromJupyterNotebook(notebookJson: string): string {
    try {
      console.log('Parsing Jupyter notebook JSON');
      const notebook = JSON.parse(notebookJson) as {
        cells: Array<{ 
          cell_type: string; 
          source: string | string[]; 
          outputs?: Array<{
            output_type: string;
            text?: string | string[];
            data?: Record<string, string | string[]>;
            traceback?: string[];
            ename?: string;
            evalue?: string;
          }>;
        }>;
        metadata?: { 
          language_info?: { 
            name: string 
          } 
        };
      };
      let extractedContent = '';
      
      if (Array.isArray(notebook.cells)) {
        console.log(`Processing ${notebook.cells.length} cells from notebook`);
        notebook.cells.forEach((cell, index) => {
          try {
            if (cell.cell_type === 'markdown') {
              // Extract markdown content
              const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
              extractedContent += source + '\n\n';
            } else if (cell.cell_type === 'code') {
              // For code cells, wrap in code blocks
              const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
              if (source.trim()) {
                const language = notebook.metadata?.language_info?.name || 'python';
                extractedContent += '```' + language + '\n' + source + '\n```\n\n';
              }
              
              // If there are outputs, extract text and images
              if (Array.isArray(cell.outputs) && cell.outputs.length > 0) {
                cell.outputs.forEach((output: any) => {
                  if (output.output_type === 'stream' && output.text) {
                    const text = Array.isArray(output.text) ? output.text.join('') : output.text;
                    extractedContent += '```\n' + text + '\n```\n\n';
                  } else if (output.output_type === 'execute_result' && output.data) {
                    // Handle text/plain output
                    if (output.data['text/plain']) {
                      const text = Array.isArray(output.data['text/plain']) 
                        ? output.data['text/plain'].join('') 
                        : output.data['text/plain'];
                      extractedContent += '```\n' + text + '\n```\n\n';
                    }
                    
                    // Handle text/html output (convert to markdown)
                    if (output.data['text/html']) {
                      extractedContent += '<div class="output-html">\n';
                      extractedContent += Array.isArray(output.data['text/html']) 
                        ? output.data['text/html'].join('') 
                        : output.data['text/html'];
                      extractedContent += '\n</div>\n\n';
                    }
                  } else if (output.output_type === 'display_data' && output.data) {
                    // Similar to execute_result
                    if (output.data['text/plain']) {
                      const text = Array.isArray(output.data['text/plain']) 
                        ? output.data['text/plain'].join('') 
                        : output.data['text/plain'];
                      extractedContent += '```\n' + text + '\n```\n\n';
                    }
                    
                    if (output.data['text/html']) {
                      extractedContent += '<div class="output-html">\n';
                      extractedContent += Array.isArray(output.data['text/html']) 
                        ? output.data['text/html'].join('') 
                        : output.data['text/html'];
                      extractedContent += '\n</div>\n\n';
                    }
                    
                    // Handle image output by converting to markdown image syntax
                    if (output.data['image/png']) {
                      const imageData = output.data['image/png'];
                      extractedContent += `![Output ${index}](data:image/png;base64,${imageData})\n\n`;
                    }
                  } else if (output.output_type === 'error') {
                    // Handle error outputs
                    if (Array.isArray(output.traceback)) {
                      extractedContent += '```\n' + output.traceback.join('\n') + '\n```\n\n';
                    } else if (output.ename && output.evalue) {
                      extractedContent += `**Error**: ${output.ename}: ${output.evalue}\n\n`;
                    }
                  }
                });
              }
            } else if (cell.cell_type === 'raw') {
              // Just add raw content as-is
              const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
              extractedContent += source + '\n\n';
            }
          } catch (cellError) {
            console.error(`Error processing cell ${index}:`, cellError);
            extractedContent += `\n\n**Error processing cell ${index}**\n\n`;
          }
        });
      }
      
      if (!extractedContent.trim()) {
        console.warn('No content was extracted from the notebook');
        return '# Jupyter Notebook\n\nUnable to extract meaningful content from this notebook.';
      }
      
      console.log(`Successfully extracted ${extractedContent.length} characters of markdown content`);
      return extractedContent;
    } catch (err) {
      console.error('Error extracting text from Jupyter notebook:', err);
      return '# Error Processing Jupyter Notebook\n\nThere was an error processing this notebook file.';
    }
  }

  if (isLoading) {
    return <div>Loading content...</div>;
  }

  if (error && !sanitizedContent) {
    return (
      <div className="mdx-content error">
        <h2 className="text-xl font-bold text-red-500 mb-4">Content Rendering Error</h2>
        <p className="mb-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="mdx-content">
      <div className="markdown-body">
        {(() => {
          try {
            return (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Heading styles
                  h1: (props) => <h1 className="mb-6 mt-10 text-3xl font-bold text-black" {...props} />,
                  h2: (props) => <h2 className="mb-4 mt-8 text-2xl font-bold text-black" {...props} />,
                  h3: (props) => <h3 className="mb-3 mt-6 text-xl font-bold text-black" {...props} />,
                  h4: (props) => <h4 className="mb-2 mt-4 text-lg font-bold text-black" {...props} />,
                  
                  // Paragraph and inline styles
                  p: ({ children }) => (
                    <CustomParagraph mathExpressions={mathExpressions}>{children}</CustomParagraph>
                  ),
                  a: (props) => <a className="text-blue-600 hover:underline" {...props} />,
                  ul: (props) => <ul className="mb-4 ml-6 list-disc" {...props} />,
                  ol: (props) => <ol className="mb-4 ml-6 list-decimal" {...props} />,
                  li: (props) => <li className="mb-1" {...props} />,
                  
                  // Code components
                  code: ({ inline, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        language={match[1]}
                        style={vs}
                        PreTag="div"
                        className="mb-4 rounded border border-gray-200 text-gray-800"
                        codeTagProps={{
                          style: {
                            fontSize: '0.9rem',
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                            color: '#333',
                          }
                        }}
                        customStyle={{
                          backgroundColor: 'white',
                          padding: '1rem',
                          color: '#333',
                        }}
                        // Override the vs theme with custom token styling
                        lineProps={{
                          style: { backgroundColor: 'white' }
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="rounded bg-white border border-gray-100 px-1 py-0.5 font-mono text-sm text-gray-800" {...props}>
                        {children}
                      </code>
                    );
                  },
                  
                  // Table components
                  table: (props) => (
                    <div className="mb-4 overflow-x-auto">
                      <table className="w-full border-collapse" {...props} />
                    </div>
                  ),
                  th: (props) => (
                    <th className="border border-gray-300 bg-gray-100 px-4 py-2 text-left font-medium" {...props} />
                  ),
                  td: (props) => (
                    <td className="border border-gray-300 px-4 py-2" {...props} />
                  ),
                  
                  // Other components
                  blockquote: (props) => (
                    <blockquote className="mb-4 border-l-4 border-gray-200 pl-4 italic" {...props} />
                  ),
                  img: (props) => (
                    <img className="mb-4 max-w-full" alt={props.alt || ''} {...props} />
                  ),
                  hr: () => <hr className="my-6 border-t border-gray-300" />,
                }}
              >
                {sanitizedContent}
              </ReactMarkdown>
            );
          } catch (renderError) {
            console.error('Error rendering markdown with math:', renderError);
            
            // Super basic fallback renderer
            return (
              <div className="markdown-error">
                <h2 className="text-xl font-bold text-red-500 mb-4">Error Rendering Content</h2>
                <p className="mb-4">There was an error rendering the markdown content. Here&apos;s a basic version:</p>
                <div className="p-4 bg-gray-100 rounded overflow-auto whitespace-pre-wrap">
                  {sanitizedContent}
                </div>
              </div>
            );
          }
        })()}
      </div>
    </div>
  );
} 