import { useEffect } from 'react';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import 'katex/dist/katex.min.css';

// Import KaTeX components if you want to use LaTeX
import { InlineMath, BlockMath } from 'react-katex';

// Import any custom components you want to use in markdown
import CodeBlock from './CodeBlock';

// Define the props interface
interface MarkdownRendererProps {
  source: MDXRemoteSerializeResult;
}

const components = {
  pre: (props: any) => <div {...props} />,
  code: CodeBlock,
  // Add custom components for LaTeX
  InlineMath: ({ children }: { children: string }) => (
    <InlineMath math={children} />
  ),
  BlockMath: ({ children }: { children: string }) => (
    <BlockMath math={children} />
  ),
};

export default function MarkdownRenderer({ source }: MarkdownRendererProps) {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <MDXRemote {...source} components={components} />
    </div>
  );
}