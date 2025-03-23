import { getAllMarkdownContent, getMarkdownBySlug, MarkdownContent } from './mdxUtils';
import { 
  getAllJupyterContent, 
  getJupyterBySlug, 
  getAllPythonFiles, 
  getPythonScriptBySlug,
  JupyterContent 
} from './jupyterUtils';
import path from 'path';
import fs from 'fs';

// Combined content type
export type DocContent = MarkdownContent | JupyterContent;

// Navigation map type definition
export interface NavigationMap {
  [key: string]: {
    title: string;
    order: number;
    children: NavItem[];
  };
}

// Navigation item structure
export interface NavItem {
  title: string;
  slug: string;
  href: string;
  order?: number;
  children?: NavItem[];
}

// Get all content (markdown and jupyter)
export async function getAllContent(): Promise<DocContent[]> {
  const markdownContent = await getAllMarkdownContent();
  const jupyterContent = await getAllJupyterContent();

  return [...markdownContent, ...jupyterContent];
}

// Get content by slug and format
export async function getContentBySlug(slug: string): Promise<DocContent | null> {
  console.log(`Getting content for slug: ${slug}`);
  
  // Special handling for tutorials and examples
  const slugParts = slug.split('/');
  if (slugParts.length > 1 && (slugParts[0] === 'tutorials' || slugParts[0] === 'examples')) {
    console.log(`Special handling for ${slugParts[0]} content: ${slug}`);
    
    // Try jupyter notebook first for tutorials and examples
    const jupyterContent = await getJupyterBySlug(slug);
    if (jupyterContent) {
      console.log(`Found Jupyter content for ${slug}`);
      return jupyterContent;
    }
    
    // Try python script as fallback
    const pythonContent = await getPythonScriptBySlug(slug);
    if (pythonContent) {
      console.log(`Found Python content for ${slug}`);
      return pythonContent;
    }
    
    console.log(`No content found for ${slug}`);
    return null;
  }
  
  // Standard path for other content
  
  // Try markdown first
  const markdownContent = await getMarkdownBySlug(slug);
  if (markdownContent) return markdownContent;

  // Try jupyter notebook
  const jupyterContent = await getJupyterBySlug(slug);
  if (jupyterContent) return jupyterContent;

  // Try python script
  const pythonContent = await getPythonScriptBySlug(slug);
  if (pythonContent) return pythonContent;

  return null;
}

// Check if a content object is markdown
export function isMarkdownContent(content: DocContent): content is MarkdownContent {
  return 'frontmatter' in content;
}

// Check if a content object is jupyter
export function isJupyterContent(content: DocContent): content is JupyterContent {
  return 'cells' in content;
}

// Function to generate navigation from file system
export function generateNavigation() {
  const navigation: NavigationMap = {};
  const contentDirectory = path.join(process.cwd(), 'src/Content');

  // Create simple direct mapping of file to nav item
  const directNavItems: NavItem[] = [];
  
  // Process top-level markdown files in the content directory
  try {
    if (fs.existsSync(contentDirectory)) {
      // Get all files in the content root directory
      const rootFiles = fs.readdirSync(contentDirectory)
        .filter(file => 
          !fs.statSync(path.join(contentDirectory, file)).isDirectory() && 
          (file.endsWith('.md') || file.endsWith('.mdx'))
        );
      
      console.log(`Found ${rootFiles.length} markdown files in content root directory:`, rootFiles);
      
      // Process each markdown file to create a direct nav item
      rootFiles.forEach(file => {
        const fileBasename = path.basename(file, path.extname(file));
        let title = fileBasename;
        let order = 100; // Default order
        
        // Set specific titles and orders based on filename
        switch(fileBasename.toLowerCase()) {
          case 'getstarted':
            title = 'Getting Started';
            order = 1; // First item
            break;
          case 'overview':
            title = 'Overview';
            order = 10;
            break;
          case 'theory':
            title = 'Theory';
            order = 20;
            break;  
          case 'howtos':
            title = 'How-To Guides';
            order = 30;
            break;
          case 'contibuterguide':
          case 'contributorguide':
          case 'contributerguide':
            title = 'Contributor Guide';
            order = 60;
            break;
          case 'releasenotes':
            title = 'Release Notes';
            order = 70;
            break;
        }
        
        // Create navigation item
        const slug = fileBasename;
        const href = `/docs/${slug}`;
        
        // Add to direct navigation items array
        directNavItems.push({
          title,
          slug,
          href,
          order
        });
      });
    }
  } catch (error) {
    console.error("Error processing top-level markdown files:", error);
  }
  
  // Process tutorial files as a section
  const tutorialsNav: NavItem = {
    title: 'Tutorials',
    slug: 'tutorials',
    href: '/docs/tutorials',
    order: 40,
    children: []
  };
  
  if (fs.existsSync(path.join(contentDirectory, 'tutorials'))) {
    const tutorialFiles = fs.readdirSync(path.join(contentDirectory, 'tutorials'));
    const jupyterFiles = tutorialFiles.filter(file => file.endsWith('.ipynb'));
    
    console.log(`Found ${jupyterFiles.length} tutorial files:`, jupyterFiles);
    
    jupyterFiles.forEach(file => {
      const fileBasename = path.basename(file, '.ipynb');
      let order = 0;
      let title = fileBasename;
      
      // Extract order from numeric prefix
      const match = fileBasename.match(/^(\d+)_(.*)$/);
      if (match) {
        order = parseInt(match[1], 10);
        title = match[2].replace(/_/g, ' ');
      }
      
      // Create clean slug for URL
      let slug = fileBasename;
      
      // For tutorials, use the dedicated route
      const href = `/docs/tutorials/${slug}`;
      
      const navItem = {
        title,
        slug,
        href,
        order: order || 999
      };
      
      // Ensure children is initialized before pushing
      if (!tutorialsNav.children) {
        tutorialsNav.children = [];
      }
      tutorialsNav.children.push(navItem);
    });
    
    // Sort tutorial items by order
    if (tutorialsNav.children && tutorialsNav.children.length > 0) {
      tutorialsNav.children.sort((a: NavItem, b: NavItem) => (a.order || 999) - (b.order || 999));
      
      // Add tutorials section to direct nav items if it has children
      directNavItems.push(tutorialsNav);
    }
  }
  
  // Process example files as a section
  const examplesNav: NavItem = {
    title: 'Examples',
    slug: 'examples',
    href: '/docs/examples',
    order: 50,
    children: []
  };
  
  if (fs.existsSync(path.join(contentDirectory, 'examples'))) {
    const exampleFiles = fs.readdirSync(path.join(contentDirectory, 'examples'));
    const jupyterFiles = exampleFiles.filter(file => file.endsWith('.ipynb'));
    
    console.log(`Found ${jupyterFiles.length} example files:`, jupyterFiles);
    
    jupyterFiles.forEach(file => {
      const fileBasename = path.basename(file, '.ipynb');
      let order = 0;
      let title = fileBasename;
      
      // Extract order from numeric prefix
      const match = fileBasename.match(/^(\d+)_(.*)$/);
      if (match) {
        order = parseInt(match[1], 10);
        title = match[2].replace(/_/g, ' ');
      }
      
      // Create clean slug for URL
      let slug = fileBasename;
      
      // For examples, use the dedicated route
      const href = `/docs/examples/${slug}`;
      
      const navItem = {
        title,
        slug,
        href,
        order: order || 999
      };
      
      // Ensure children is initialized before pushing
      if (!examplesNav.children) {
        examplesNav.children = [];
      }
      examplesNav.children.push(navItem);
    });
    
    // Sort example items by order
    if (examplesNav.children && examplesNav.children.length > 0) {
      examplesNav.children.sort((a: NavItem, b: NavItem) => (a.order || 999) - (b.order || 999));
      
      // Add examples section to direct nav items if it has children
      directNavItems.push(examplesNav);
    }
  }
  
  // Sort all direct navigation items by their order
  directNavItems.sort((a: NavItem, b: NavItem) => (a.order || 999) - (b.order || 999));
  
  // Return the array of nav items directly
  return directNavItems;
}

// Comment out or remove unused function
// export function getAllPythonFiles() {
//   // Implementation
// }

// Fix the navigation assignment issue
export async function getNavigationItems(): Promise<NavItem[]> {
  try {
    // Use the generateNavigation function that already exists in this file
    return generateNavigation();
  } catch (error) {
    console.error('Error getting navigation items:', error);
    return [];
  }
}

// Fix the 'let' to 'const' issues
export function getMDBySlug(slug: string): string | null {
  try {
    const filePath = path.join(process.cwd(), 'content', `${slug}.md`);
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    // If file doesn't exist at the first location, try alternate locations
    try {
      const tutorialPath = path.join(process.cwd(), 'content', 'tutorials', `${slug}.md`);
      return fs.readFileSync(tutorialPath, 'utf8');
    } catch (tutorialError) {
      try {
        const examplePath = path.join(process.cwd(), 'content', 'examples', `${slug}.md`);
        return fs.readFileSync(examplePath, 'utf8');
      } catch (exampleError) {
        console.error(`Could not find MD file for slug: ${slug}`);
        return null;
      }
    }
  }
}

// Fix the 'let' to 'const' issues
export function getJupyterNotebookBySlug(slug: string): string | null {
  try {
    const filePath = path.join(process.cwd(), 'content', `${slug}.ipynb`);
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    // If file doesn't exist at the first location, try alternate locations
    try {
      const tutorialPath = path.join(process.cwd(), 'content', 'tutorials', `${slug}.ipynb`);
      return fs.readFileSync(tutorialPath, 'utf8');
    } catch (tutorialError) {
      try {
        const examplePath = path.join(process.cwd(), 'content', 'examples', `${slug}.ipynb`);
        return fs.readFileSync(examplePath, 'utf8');
      } catch (exampleError) {
        console.error(`Could not find Jupyter notebook for slug: ${slug}`);
        return null;
      }
    }
  }
} 