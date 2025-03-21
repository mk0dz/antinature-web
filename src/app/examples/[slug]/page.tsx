import { getNotebookBySlug, getAllNotebooks, getNotebookTitle } from '@/lib/notebook';
import NotebookRenderer from '@/components/content/NotebookRenderer';

// Define types
interface ExamplePageProps {
  params: {
    slug: string;
  };
}

export default async function ExamplePage({ params }: ExamplePageProps) {
  const { notebook } = await getNotebookBySlug('examples', params.slug);
  const title = await getNotebookTitle('examples', params.slug);
  
  return (
    <div className="example-container">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      <NotebookRenderer notebook={notebook} />
    </div>
  );
}

// Generate static paths
export async function generateStaticParams() {
  const slugs = await getAllNotebooks('examples');
  
  return slugs.map(slug => ({
    slug,
  }));
} 