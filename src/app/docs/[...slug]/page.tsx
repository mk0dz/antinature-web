import { getDocBySlug, getAllDocs } from '@/lib/mdx';
import MarkdownRenderer from '@/components/content/MarkdownRenderer';

// Define types
interface DocPageProps {
  params: {
    slug: string[];
  };
}

export default async function DocPage({ params }: DocPageProps) {
  try {
    // Join the slug array to form the full slug
    const slug = params.slug.join('/');
    
    // Get the document
    const { source, frontMatter, error } = await getDocBySlug(slug);
    
    return (
      <div className="doc-container">
        <h1 className="text-3xl font-bold mb-6">{frontMatter.title || 'Untitled Document'}</h1>
        <MarkdownRenderer source={source} error={error} />
      </div>
    );
  } catch (error) {
    console.error('Error in DocPage:', error);
    return (
      <div className="doc-container">
        <h1 className="text-3xl font-bold mb-6">Error</h1>
        <div className="p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-md">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-400">Error loading document</h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            There was an error loading this document. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}

// Generate static paths
export async function generateStaticParams() {
  try {
    const slugs = await getAllDocs();
    
    return slugs.map(slug => ({
      slug: [slug],
    }));
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [];
  }
}