import { getNotebookBySlug, getAllNotebooks, getNotebookTitle } from '@/lib/notebook';
import NotebookRenderer from '@/components/content/NotebookRenderer';

// Define types
interface TutorialPageProps {
  params: {
    slug: string;
  };
}

export default async function TutorialPage({ params }: TutorialPageProps) {
  const { notebook } = await getNotebookBySlug('tutorials', params.slug);
  const title = await getNotebookTitle('tutorials', params.slug);
  
  return (
    <div className="tutorial-container">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      <NotebookRenderer notebook={notebook} />
    </div>
  );
}

// Generate static paths
export async function generateStaticParams() {
  const slugs = await getAllNotebooks('tutorials');
  
  return slugs.map(slug => ({
    slug,
  }));
} 