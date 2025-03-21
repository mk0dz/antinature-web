import fs from 'fs';
import path from 'path';

// Define the content directory
const contentDirectory = path.join(process.cwd(), 'src/content');

export async function getNotebookBySlug(type: 'tutorials' | 'examples', slug: string) {
  // Construct the file path
  const fullPath = path.join(contentDirectory, type, `${slug}.ipynb`);
  
  // Read the file
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  
  // Parse the JSON
  const notebook = JSON.parse(fileContents);
  
  return {
    notebook,
    metadata: notebook.metadata || {},
  };
}

export async function getAllNotebooks(type: 'tutorials' | 'examples') {
  // Get all the files in the specified directory
  const files = fs.readdirSync(path.join(contentDirectory, type));
  
  // Filter to only include .ipynb files
  const notebookFiles = files.filter(file => file.endsWith('.ipynb'));
  
  // Get the slugs
  const slugs = notebookFiles.map(file => file.replace(/\.ipynb$/, ''));
  
  // Sort by filename (which starts with a number)
  return slugs.sort((a, b) => {
    const numA = parseInt(a.split('_')[0]);
    const numB = parseInt(b.split('_')[0]);
    return numA - numB;
  });
}

export async function getNotebookTitle(type: 'tutorials' | 'examples', slug: string) {
  try {
    const { notebook } = await getNotebookBySlug(type, slug);
    
    // Try to find a title in the first markdown cell
    for (const cell of notebook.cells) {
      if (cell.cell_type === 'markdown') {
        const source = cell.source.join('');
        const titleMatch = source.match(/^#\s+(.+)$/m);
        if (titleMatch) {
          return titleMatch[1];
        }
      }
    }
    
    // Fall back to slug if no title found
    return slug.replace(/^\d+_/, '').replace(/_/g, ' ');
  } catch (error) {
    return slug.replace(/^\d+_/, '').replace(/_/g, ' ');
  }
} 