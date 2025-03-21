import { getAllNotebooks, getNotebookTitle } from '@/lib/notebook';
import Link from 'next/link';

export default async function ExamplesPage() {
  const slugs = await getAllNotebooks('examples');
  const examples = await Promise.all(
    slugs.map(async (slug) => ({
      slug,
      title: await getNotebookTitle('examples', slug),
    }))
  );
  
  return (
    <div className="examples-container">
      <h1 className="text-3xl font-bold mb-6">Examples</h1>
      <p className="mb-6">
        Explore these practical examples that demonstrate how to use Antinature for various antimatter systems.
        Each example provides detailed code and explanations to help you understand how to apply the framework.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {examples.map((example) => (
          <Link 
            key={example.slug}
            href={`/examples/${example.slug}`}
            className="block p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <h2 className="text-xl font-semibold mb-2">{example.title}</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {example.slug.replace(/^\d+_/, '').replace(/_/g, ' ')}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
} 