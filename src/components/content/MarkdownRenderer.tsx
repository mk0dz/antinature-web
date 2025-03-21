'use client';

import { useState } from 'react';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import 'katex/dist/katex.min.css';

// Import KaTeX components for LaTeX rendering
import { InlineMath, BlockMath } from 'react-katex';

// Import any custom components for markdown
import CodeBlock from './CodeBlock';

// Define the props interface
interface MarkdownRendererProps {
  source: MDXRemoteSerializeResult;
  error?: Error;
}

const components = {
  pre: (props: any) => <div {...props} />,
  code: CodeBlock,
  // Add custom components for LaTeX
  InlineMath: ({ children }: { children: string }) => {
    try {
      return <InlineMath math={children} />;
    } catch (error) {
      console.error('Error rendering InlineMath:', error);
      return <code>{children}</code>;
    }
  },
  BlockMath: ({ children }: { children: string }) => {
    try {
      return <BlockMath math={children} />;
    } catch (error) {
      console.error('Error rendering BlockMath:', error);
      return <pre>{children}</pre>;
    }
  },
};

export default function MarkdownRenderer({ source, error }: MarkdownRendererProps) {
  const [hasError, setHasError] = useState(false);

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-md">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-400">Error rendering content</h3>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">
          There was an error processing this markdown content.
        </p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="p-4 border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-md">
        <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-400">Rendering Error</h3>
        <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
          There was a problem rendering this content. It may contain syntax errors.
        </p>
      </div>
    );
  }

  try {
    return (
      <div className="prose dark:prose-invert max-w-none">
        <MDXRemote {...source} components={components} />
      </div>
    );
  } catch (err) {
    console.error('Error in MarkdownRenderer:', err);
    setHasError(true);
    return null;
  }
}