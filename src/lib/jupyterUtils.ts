import fs from 'fs';
import path from 'path';

// Define content directory for Jupyter notebooks
const contentDirectory = path.join(process.cwd(), 'src/Content');

// Define proper types to replace 'any'
export type JupyterOutput = {
  output_type: string;
  text?: string | string[];
  data?: Record<string, string | string[]>;
  traceback?: string[];
  ename?: string;
  evalue?: string;
};

export type JupyterCell = {
  cell_type: string;
  source: string | string[];
  outputs?: JupyterOutput[];
  metadata?: Record<string, unknown>;
  execution_count?: number | null;
};

// Consolidated JupyterContent type
export type JupyterContent = {
  slug: string;
  title: string;
  cells: JupyterCell[];
  metadata?: Record<string, unknown>;
};

// Get all Jupyter notebook files from content directory and subdirectories
export function getAllJupyterFiles() {
  const files: string[] = [];
  
  function readDir(dir: string) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        readDir(itemPath);
      } else if (item.endsWith('.ipynb')) {
        files.push(itemPath);
      }
    });
  }
  
  readDir(contentDirectory);
  return files;
}

// Get Jupyter notebook content by slug
export async function getJupyterBySlug(slug: string): Promise<JupyterContent | null> {
  try {
    // Make debugging more visible
    console.log(`==== JUPYTER LOOKUP ====`);
    console.log(`Looking for Jupyter notebook with slug: '${slug}'`);
    
    // Handle special case for examples and tutorials more directly
    const parts = slug.split('/');
    
    // Try a more direct approach with explicit paths
    let possiblePaths: string[] = [];
    let filePath: string | null = null;
    
    // Start with the basic path
    possiblePaths.push(path.join(contentDirectory, `${slug}.ipynb`));
    
    // For tutorials and examples, add additional possible paths
    if (parts.length > 1 && (parts[0] === 'tutorials' || parts[0] === 'examples')) {
      const category = parts[0];
      const filename = parts[1];
      
      // Direct path with filename exactly as provided
      possiblePaths.push(path.join(contentDirectory, category, `${filename}.ipynb`));
      
      // Get all files in the category directory to find a match
      const categoryDir = path.join(contentDirectory, category);
      try {
        if (fs.existsSync(categoryDir)) {
          const categoryFiles = fs.readdirSync(categoryDir)
            .filter(file => file.endsWith('.ipynb'));
          
          console.log(`Files in ${category} directory:`, categoryFiles);
          
          // Check for files with numeric prefixes that might match
          if (filename.match(/^\d+_/)) {
            // If filename already has numeric prefix, look for exact match first
            const prefixMatch = categoryFiles.find(file => file === `${filename}.ipynb`);
            if (prefixMatch) {
              possiblePaths.push(path.join(categoryDir, prefixMatch));
            }
          } else {
            // Look for any file with this name after a numeric prefix
            const matchingFiles = categoryFiles.filter(file => {
              // Remove numeric prefix if it exists
              const nameWithoutPrefix = file.replace(/^\d+_/, '').replace(/\.ipynb$/, '');
              return nameWithoutPrefix === filename;
            });
            
            if (matchingFiles.length > 0) {
              matchingFiles.forEach(file => {
                possiblePaths.push(path.join(categoryDir, file));
              });
            }
            
            // Also look for partial matches for friendlier URLs
            const partialMatches = categoryFiles.filter(file => {
              const lowerFile = file.toLowerCase();
              const lowerFilename = filename.toLowerCase();
              return lowerFile.includes(lowerFilename) || 
                    lowerFilename.includes(lowerFile.replace(/\.ipynb$/, ''));
            });
            
            if (partialMatches.length > 0) {
              partialMatches.forEach(file => {
                // Only add if not already in the list
                const fullPath = path.join(categoryDir, file);
                if (!possiblePaths.includes(fullPath)) {
                  possiblePaths.push(fullPath);
                }
              });
            }
          }
        }
      } catch (err) {
        console.error(`Error reading category directory: ${err}`);
      }
    }
    
    // Try all possible paths
    console.log(`Trying possible paths:`, possiblePaths);
    
    for (const potentialPath of possiblePaths) {
      if (fs.existsSync(potentialPath)) {
        filePath = potentialPath;
        console.log(`Found Jupyter notebook at: ${filePath}`);
        break;
      }
    }
    
    // If still not found, do a final broader search
    if (!filePath) {
      console.log(`File not found in direct paths, trying broader search...`);
      const allFiles = getAllJupyterFiles();
      
      // Look for a path with the same file basename
      filePath = allFiles.find(file => {
        const baseName = path.basename(file, '.ipynb');
        const slugName = path.basename(slug);
        return baseName === slugName || file.endsWith(`${slug}.ipynb`);
      }) || null;
      
      if (filePath) {
        console.log(`Found Jupyter notebook through broader search: ${filePath}`);
      }
    }
    
    if (!filePath) {
      console.error(`No Jupyter notebook found for slug: ${slug}`);
      return null;
    }
    
    // Read and parse the file
    console.log(`Reading Jupyter notebook from: ${filePath}`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    const notebook = JSON.parse(fileContent);
    
    // Use the original slug for the response to maintain consistent routing
    return {
      slug,
      title: getTitleFromNotebook(notebook) || path.basename(slug),
      cells: notebook.cells
    };
  } catch (error) {
    console.error(`Error loading Jupyter notebook for slug ${slug}:`, error);
    return null;
  }
}

// Get all Jupyter notebook content
export async function getAllJupyterContent(): Promise<JupyterContent[]> {
  const files = getAllJupyterFiles();
  
  const jupyterContent = await Promise.all(
    files.map(async (file) => {
      const relativePath = path.relative(contentDirectory, file);
      const slug = relativePath.replace(/\.ipynb$/, '');
      const fileContent = fs.readFileSync(file, 'utf8');
      const notebook = JSON.parse(fileContent);
      
      return {
        slug,
        title: getTitleFromNotebook(notebook) || path.basename(slug),
        cells: notebook.cells
      };
    })
  );
  
  return jupyterContent;
}

// Extract title from Jupyter notebook (first h1 in markdown cell)
function getTitleFromNotebook(notebook: any): string | null {
  if (!notebook.cells || !Array.isArray(notebook.cells)) return null;
  
  for (const cell of notebook.cells) {
    if (cell.cell_type === 'markdown') {
      const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
      const match = source.match(/^#\s+(.*)$/m);
      if (match) return match[1];
    }
  }
  
  return null;
}

// Handle python files as notebooks too (for examples/tutorials)
export async function getPythonScriptBySlug(slug: string): Promise<JupyterContent | null> {
  // Create path to Python file
  let filePath = path.join(contentDirectory, `${slug}.py`);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    // Try to find in subdirectories
    const allFiles = getAllPythonFiles();
    const matchingFile = allFiles.find(file => 
      file.endsWith(`${slug}.py`) || 
      file.endsWith(`${path.basename(slug)}.py`)
    );
    
    if (!matchingFile) return null;
    filePath = matchingFile;
  }
  
  // Read file content
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Parse Python content to notebook-like format
  const cells = parsePythonToNotebookCells(fileContent);
  
  return {
    slug,
    title: getTitleFromPythonFile(fileContent) || path.basename(slug),
    cells
  };
}

// Get all Python files from content directory and subdirectories
export function getAllPythonFiles() {
  const files: string[] = [];
  
  function readDir(dir: string) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        readDir(itemPath);
      } else if (item.endsWith('.py')) {
        files.push(itemPath);
      }
    });
  }
  
  readDir(contentDirectory);
  return files;
}

// Extract title from Python file (first multiline comment with # title)
function getTitleFromPythonFile(content: string): string | null {
  // Look for title in docstring or comments
  const titleMatch = content.match(/^('''|"""|\#)\s*(.+?)\s*('''|"""|$)/m);
  if (titleMatch) return titleMatch[2];
  
  return null;
}

// Parse Python file content to notebook-like cells
function parsePythonToNotebookCells(content: string): JupyterCell[] {
  const cells: JupyterCell[] = [];
  
  // Split by docstring blocks and code blocks
  const lines = content.split('\n');
  
  let currentCell: JupyterCell | null = null;
  let inDocstring = false;
  let docstringDelimiter: string | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect docstring start/end
    if (line.trim().startsWith('"""') || line.trim().startsWith("'''")) {
      const delimiter = line.trim().startsWith('"""') ? '"""' : "'''";
      
      if (!inDocstring) {
        // Start of docstring
        inDocstring = true;
        docstringDelimiter = delimiter;
        
        // Create new markdown cell
        currentCell = {
          cell_type: 'markdown',
          source: [line.replace(delimiter, '# ')]
        };
        cells.push(currentCell);
      } else if (docstringDelimiter === delimiter) {
        // End of docstring
        inDocstring = false;
        docstringDelimiter = null;
        currentCell = null;
      }
    } 
    // Handle comment blocks as markdown
    else if (line.trim().startsWith('#') && !inDocstring && (!currentCell || currentCell.cell_type !== 'markdown')) {
      currentCell = {
        cell_type: 'markdown',
        source: [line]
      };
      cells.push(currentCell);
    }
    // Add to current markdown cell
    else if (inDocstring && currentCell && currentCell.cell_type === 'markdown') {
      // Ensure source is always an array
      if (typeof currentCell.source === 'string') {
        currentCell.source = [currentCell.source];
      }
      (currentCell.source as string[]).push(line);
    }
    // Add to current comment block
    else if (line.trim().startsWith('#') && currentCell && currentCell.cell_type === 'markdown') {
      // Ensure source is always an array
      if (typeof currentCell.source === 'string') {
        currentCell.source = [currentCell.source];
      }
      (currentCell.source as string[]).push(line);
    }
    // Start code cell
    else if (line.trim() !== '' && (!currentCell || currentCell.cell_type !== 'code')) {
      currentCell = {
        cell_type: 'code',
        source: [line],
        outputs: []
      };
      cells.push(currentCell);
    }
    // Add to code cell
    else if (currentCell && currentCell.cell_type === 'code') {
      // Ensure source is always an array
      if (typeof currentCell.source === 'string') {
        currentCell.source = [currentCell.source];
      }
      (currentCell.source as string[]).push('\n' + line);
    }
    // Empty line - reset current cell unless in docstring
    else if (line.trim() === '' && !inDocstring) {
      currentCell = null;
    }
  }
  
  return cells;
}

// Fix 'possiblePaths' from 'let' to 'const'
export async function parseJupyterNotebook(notebookString: string, filePath: string): Promise<JupyterContent | null> {
  try {
    const notebook = JSON.parse(notebookString);
    // Extract title from filename if not present in notebook
    const parsed = path.parse(filePath);
    const title = notebook.metadata?.title || parsed.name;
    
    if (!Array.isArray(notebook.cells)) {
      console.error('Invalid Jupyter notebook format: cells is not an array');
      return null;
    }
    
    return {
      slug: parsed.name, // Use the filename as the slug
      title,
      cells: notebook.cells,
      metadata: notebook.metadata
    };
  } catch (error) {
    console.error('Error parsing Jupyter notebook:', error);
    return null;
  }
}

export function extractJupyterTitle(content: string): string {
  try {
    const notebook = JSON.parse(content);
    
    // Try to extract title from metadata first
    if (notebook.metadata && notebook.metadata.title) {
      return notebook.metadata.title;
    }
    
    // Next, try to find the first markdown cell with a heading
    if (Array.isArray(notebook.cells)) {
      for (const cell of notebook.cells) {
        if (cell.cell_type === 'markdown') {
          const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
          const headingMatch = source.match(/^#\s+(.+)$/m);
          if (headingMatch && headingMatch[1]) {
            return headingMatch[1].trim();
          }
        }
      }
    }
    
    return 'Untitled Notebook';
  } catch (error) {
    console.error('Error extracting Jupiter notebook title:', error);
    return 'Untitled Notebook';
  }
}

export function extractJupyterPathDetails(filePath: string): { dir: string; base: string; ext: string; name: string } {
  try {
    const parsed = path.parse(filePath);
    const possiblePaths = [
      path.join(process.cwd(), 'content', filePath),
      path.join(process.cwd(), 'content', 'tutorials', filePath),
      path.join(process.cwd(), 'content', 'examples', filePath),
    ];
    
    return {
      dir: parsed.dir,
      base: parsed.base,
      ext: parsed.ext,
      name: parsed.name
    };
  } catch (error) {
    console.error('Error parsing file path:', error);
    return {
      dir: '',
      base: '',
      ext: '',
      name: ''
    };
  }
} 