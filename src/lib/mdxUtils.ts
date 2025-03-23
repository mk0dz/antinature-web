import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import yaml from 'yaml';

// Define content directory
const contentDirectory = path.join(process.cwd(), 'src/Content');

// Add proper TypeScript types
type FrontMatter = {
  title?: string;
  description?: string;
  order?: number;
  section?: string;
  tags?: string[];
  [key: string]: unknown;
};

// Interface for markdown content with frontmatter
export interface MarkdownContent {
  slug: string;
  frontmatter: {
    title?: string;
    description?: string;
    order?: number;
    [key: string]: any;
  };
  content: string;
}

// Get all markdown files from content directory and subdirectories
export function getAllMarkdownFiles() {
  const files: string[] = [];
  
  function readDir(dir: string) {
    if (!fs.existsSync(dir)) {
      console.warn(`Directory does not exist: ${dir}`);
      return;
    }
    
    try {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        
        try {
          const stat = fs.statSync(itemPath);
          
          if (stat.isDirectory()) {
            readDir(itemPath);
          } else if (item.endsWith('.md') || item.endsWith('.mdx')) {
            files.push(itemPath);
          }
        } catch (error) {
          console.error(`Error reading item ${itemPath}:`, error);
        }
      });
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
    }
  }
  
  readDir(contentDirectory);
  console.log(`Found ${files.length} markdown files`);
  return files;
}

// Safely parse frontmatter and content to avoid MDX errors
function safelyParseMdx(fileContent: string): { data: any, content: string } {
  try {
    // First try with gray-matter
    return matter(fileContent);
  } catch (error) {
    console.error("Error parsing frontmatter:", error);
    
    // Fallback: manually extract frontmatter
    let data = {};
    let content = fileContent;
    
    // Check if file starts with frontmatter delimiters
    if (fileContent.startsWith('---')) {
      const endOfFrontmatter = fileContent.indexOf('---', 3);
      if (endOfFrontmatter !== -1) {
        const frontmatterRaw = fileContent.substring(3, endOfFrontmatter).trim();
        content = fileContent.substring(endOfFrontmatter + 3).trim();
        
        // Parse frontmatter manually
        frontmatterRaw.split('\n').forEach(line => {
          const colonIndex = line.indexOf(':');
          if (colonIndex !== -1) {
            const key = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim();
            // Remove quotes if present
            if (value.startsWith('"') && value.endsWith('"')) {
              data[key] = value.substring(1, value.length - 1);
            } else {
              data[key] = value;
            }
          }
        });
      }
    }
    
    return { data, content };
  }
}

// Get markdown content by slug
export async function getMarkdownBySlug(slug: string): Promise<MarkdownContent | null> {
  console.log(`Looking for markdown with slug: ${slug}`);
  
  // Create path to markdown file
  let filePath = path.join(contentDirectory, `${slug}.md`);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    // Try with .mdx extension
    filePath = path.join(contentDirectory, `${slug}.mdx`);
    
    // If still doesn't exist, try to find in subdirectories
    if (!fs.existsSync(filePath)) {
      const allFiles = getAllMarkdownFiles();
      console.log(`Checking ${allFiles.length} files for a match with ${slug}`);
      
      const matchingFile = allFiles.find(file => 
        file.endsWith(`${slug}.md`) || 
        file.endsWith(`${slug}.mdx`) || 
        file.endsWith(`${path.basename(slug)}.md`) ||
        file.endsWith(`${path.basename(slug)}.mdx`)
      );
      
      if (!matchingFile) {
        console.log(`No matching file found for slug: ${slug}`);
        return null;
      }
      
      filePath = matchingFile;
    }
  }
  
  console.log(`Found markdown file at: ${filePath}`);
  
  try {
    // Read file content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse with safer approach
    const { data, content } = safelyParseMdx(fileContent);
    
    // Use a sanitized version of the content
    const sanitizedContent = sanitizeMarkdownContent(content);
    
    return {
      slug,
      frontmatter: {
        title: data.title || getTitleFromContent(sanitizedContent) || path.basename(slug),
        description: data.description || '',
        order: data.order || 999,
        ...data
      },
      content: sanitizedContent
    };
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return null;
  }
}

// Get all markdown content
export async function getAllMarkdownContent(): Promise<MarkdownContent[]> {
  const files = getAllMarkdownFiles();
  
  const markdownContent = await Promise.all(
    files.map(async (file) => {
      try {
        const relativePath = path.relative(contentDirectory, file);
        const slug = relativePath.replace(/\.(md|mdx)$/, '');
        const fileContent = fs.readFileSync(file, 'utf8');
        
        // Parse with safer approach
        const { data, content } = safelyParseMdx(fileContent);
        
        // Use a sanitized version of the content
        const sanitizedContent = sanitizeMarkdownContent(content);
        
        return {
          slug,
          frontmatter: {
            title: data.title || getTitleFromContent(sanitizedContent) || path.basename(slug),
            description: data.description || '',
            order: data.order || 999,
            ...data
          },
          content: sanitizedContent
        };
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
        return null;
      }
    })
  );
  
  // Filter out null entries (files that had errors)
  return markdownContent.filter(content => content !== null) as MarkdownContent[];
}

// Extract title from markdown content (first h1)
function getTitleFromContent(content: string): string | null {
  const match = content.match(/^#\s+(.*)$/m);
  return match ? match[1] : null;
}

// Sanitize markdown content to avoid common MDX processing issues
function sanitizeMarkdownContent(content: string): string {
  let sanitized = content;
  
  // Fix tables with missing cell content (causing "inTable" errors)
  sanitized = sanitized.replace(/\|\s*\|/g, '| |');
  
  // Ensure tables have proper formatting (empty line before and after)
  sanitized = sanitized.replace(/([^\n])\n\|/g, '$1\n\n|');
  sanitized = sanitized.replace(/\|\n([^\n\|])/g, '|\n\n$1');
  
  // Make sure all table rows have the same number of cells
  const tableRegex = /(?:^\|\s*.+\s*\|\s*$\n)+/gm;
  sanitized = sanitized.replace(tableRegex, (table) => {
    const rows = table.trim().split('\n');
    if (rows.length < 2) return table; // Not a complete table
    
    // Count the number of cells in each row
    const cellCounts = rows.map(row => {
      // Count pipe characters (excluding leading/trailing pipes)
      return (row.match(/\|/g) || []).length - 1;
    });
    
    // Find the maximum number of cells in any row
    const maxCells = Math.max(...cellCounts);
    
    // Add missing cells to rows with fewer cells
    const fixedRows = rows.map((row, index) => {
      const currentCells = cellCounts[index];
      if (currentCells < maxCells) {
        // Add missing cells at the end (before the trailing pipe)
        const lastPipePos = row.lastIndexOf('|');
        const fixedRow = row.substring(0, lastPipePos) + ' |'.repeat(maxCells - currentCells) + row.substring(lastPipePos);
        return fixedRow;
      }
      return row;
    });
    
    // If the second row is a separator row (contains only |, -, and :), ensure proper formatting
    if (rows.length > 1) {
      const secondRow = rows[1];
      if (/^\|[\s\-:|]+\|$/.test(secondRow)) {
        // Ensure separator row has correct formatting with at least one - in each cell
        const cellCount = (secondRow.match(/\|/g) || []).length - 1;
        const fixedSeparator = '|' + Array(cellCount).fill(' --- ').join('|') + '|';
        fixedRows[1] = fixedSeparator;
      } else if (rows.length > 2 && !(/^\|[\s\-:|]+\|$/.test(rows[0]))) {
        // If second row isn't a separator but should be, insert a separator row
        const cellCount = cellCounts[0];
        const separatorRow = '|' + Array(cellCount).fill(' --- ').join('|') + '|';
        fixedRows.splice(1, 0, separatorRow);
      }
    }
    
    return fixedRows.join('\n') + '\n';
  });
  
  // Add separator row if missing in tables
  const tableWithoutSeparatorRegex = /^\|(.*)\|\n\|((?!\s*[\-:][\-\s:]*\|).*)\|/gm;
  sanitized = sanitized.replace(tableWithoutSeparatorRegex, (match, headerRow) => {
    const pipeCount = (headerRow.match(/\|/g) || []).length + 1;
    const separatorRow = '|' + Array(pipeCount).fill(' --- ').join('|') + '|';
    return `|${headerRow}|\n${separatorRow}\n|`;
  });
  
  // Fix code blocks that might be incorrectly interpreted as tables
  const codeBlocksWithTablesRegex = /(```[\s\S]*?)(^\|[\s\S]*?\|)[\s\S]*?(```)/gm;
  sanitized = sanitized.replace(codeBlocksWithTablesRegex, (match, codeStart, tableContent, codeEnd) => {
    // Escape pipe characters inside code blocks
    const fixedTableContent = tableContent.replace(/\|/g, '\\|');
    return codeStart + fixedTableContent + codeEnd;
  });
  
  // Fix import statements that might cause issues
  sanitized = sanitized.replace(/import\s+.*\s+from\s+['"].*['"]/g, '<!-- Import statement removed -->');
  
  // Remove export statements that might cause issues
  sanitized = sanitized.replace(/export\s+.*{.*}/g, '<!-- Export statement removed -->');
  
  return sanitized;
}

export function extractFrontMatter(content: string): { 
  frontMatter: FrontMatter; 
  content: string 
} {
  // Default values
  let frontMatter: FrontMatter = {};
  let processedContent = content;
  
  // Check for front matter delimiters
  if (content.startsWith('---')) {
    const endOfFrontMatter = content.indexOf('---', 3);
    if (endOfFrontMatter !== -1) {
      const frontMatterText = content.slice(3, endOfFrontMatter).trim();
      // Process front matter as YAML
      try {
        frontMatter = yaml.load(frontMatterText) as FrontMatter || {};
        // Remove front matter from content
        processedContent = content.slice(endOfFrontMatter + 3).trim();
      } catch (error) {
        console.error('Error parsing frontmatter:', error);
      }
    }
  }
  
  return {
    frontMatter,
    content: processedContent
  };
}

// Fix let to const
export function extractMarkdownTitle(content: string): string {
  try {
    // First check if there's front matter with a title
    const { frontMatter } = extractFrontMatter(content);
    if (frontMatter.title) {
      return frontMatter.title as string;
    }
    
    // Otherwise look for the first heading
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim();
    }
    
    // If no title is found
    return 'Untitled Document';
  } catch (error) {
    console.error('Error extracting markdown title:', error);
    return 'Untitled Document';
  }
}

export function parseMarkdownFrontMatter(markdown: string, filePath: string): {
  metadata: Record<string, unknown>;
  content: string;
} {
  try {
    const { frontMatter, content } = extractFrontMatter(markdown);
    const title = frontMatter.title || extractMarkdownTitle(content);
    const description = frontMatter.description || '';
    
    const parsed = path.parse(filePath);
    const name = parsed.name;
    const directory = parsed.dir.split(path.sep).pop() || '';
    
    // Create a consistent metadata structure
    const metadata = {
      title,
      description,
      slug: name,
      section: frontMatter.section || directory,
      tags: frontMatter.tags || [],
      order: frontMatter.order || 999,
      path: filePath,
      ...frontMatter
    };
    
    return {
      metadata,
      content
    };
  } catch (error) {
    console.error('Error parsing markdown front matter:', error);
    const parsed = path.parse(filePath);
    const name = parsed.name;
    
    return {
      metadata: {
        title: name,
        description: '',
        slug: name,
        path: filePath
      },
      content: markdown
    };
  }
} 