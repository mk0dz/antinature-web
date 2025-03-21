import { getAllNotebooks, getNotebookTitle } from '@/lib/notebook';
import Link from 'next/link';

export default async function TutorialsPage() {
  const slugs = await getAllNotebooks('tutorials');
  const tutorials = await Promise.all(
    slugs.map(async (slug) => ({
      slug,
      title: await getNotebookTitle('tutorials', slug),
    }))
  );
  
  return (
    <div className="tutorials-container">
      <h1 className="text-3xl font-bold mb-6">Tutorials</h1>
      <p className="mb-6">
        Welcome to the Antinature tutorials section. Here you'll find interactive Jupyter notebooks
        that guide you through using the Antinature framework.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tutorials.map((tutorial) => (
          <Link 
            key={tutorial.slug}
            href={`/tutorials/${tutorial.slug}`}
            className="block p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <h2 className="text-xl font-semibold mb-2">{tutorial.title}</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {tutorial.slug.replace(/^\d+_/, '').replace(/_/g, ' ')}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
} 