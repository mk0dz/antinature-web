import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

// Define the content directory
const contentDirectory = path.join(process.cwd(), 'src/content');

export async function getDocBySlug(slug: string) {
  try {
    // Construct the file path
    const fullPath = path.join(contentDirectory, 'docs', `${slug}.md`);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${fullPath}`);
    }
    
    // Read the file
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    
    // Parse the front matter
    const { data, content } = matter(fileContents);
    
    // Add default title if missing
    if (!data.title) {
      data.title = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
    }
    
    try {
      // Serialize the content with error handling
      const mdxSource = await serialize(content, {
        mdxOptions: {
          remarkPlugins: [remarkMath],
          rehypePlugins: [
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: 'wrap' }],
            // @ts-ignore - Ignoring type issue with rehypeKatex
            rehypeKatex
          ],
          development: process.env.NODE_ENV !== 'production',
        },
        parseFrontmatter: false, // We already parsed it with gray-matter
      });
      
      return {
        source: mdxSource,
        frontMatter: data,
      };
    } catch (serializeError) {
      console.error('Error serializing MDX:', serializeError);
      
      // Fallback to basic content without MDX features
      const basicMdxSource = await serialize('**Error rendering content.** Please check the markdown file for syntax errors.', {
        parseFrontmatter: false,
      });
      
      return {
        source: basicMdxSource,
        frontMatter: data,
        error: serializeError,
      };
    }
  } catch (error) {
    console.error('Error in getDocBySlug:', error);
    
    // Return a basic error message as MDX
    const errorMdxSource = await serialize('**Document not found or could not be processed.**', {
      parseFrontmatter: false,
    });
    
    return {
      source: errorMdxSource,
      frontMatter: { title: 'Error' },
      error,
    };
  }
}

export async function getAllDocs() {
  try {
    // Get all the files in the docs directory
    const files = fs.readdirSync(path.join(contentDirectory, 'docs'));
    
    // Filter to only include .md files
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    // Get the slugs
    const slugs = mdFiles.map(file => file.replace(/\.md$/, ''));
    
    return slugs;
  } catch (error) {
    console.error('Error in getAllDocs:', error);
    return [];
  }
}