import { getDocBySlug } from '@/lib/mdx';
import MarkdownRenderer from '@/components/content/MarkdownRenderer';

// Define types
interface DocPageProps {
  params: {
    slug: string[];
  };
}

export default async function DocPage({ params }: DocPageProps) {
  // Join the slug array to form the full slug
  const slug = params.slug.join('/');
  
  // Get the document
  const { source, frontMatter } = await getDocBySlug(slug);
  
  return (
    <div className="doc-container">
      <h1 className="text-3xl font-bold mb-6">{frontMatter.title}</h1>
      <MarkdownRenderer source={source} />
    </div>
  );
}

// Generate static paths
export async function generateStaticParams() {
  // This would be a more complex implementation in a real app
  // For now, just return some example slugs
  return [
    { slug: ['getting-started'] },
    { slug: ['theory', 'quantum-framework'] },
    // Add more as needed
  ];
}