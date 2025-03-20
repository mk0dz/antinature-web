import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Define the content directory
const contentDirectory = path.join(process.cwd(), 'src/content');

export async function getDocBySlug(slug: string) {
  // Construct the file path
  const fullPath = path.join(contentDirectory, 'docs', `${slug}.md`);
  
  // Read the file
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  
  // Parse the front matter
  const { data, content } = matter(fileContents);
  
  // Serialize the content
  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    },
  });
  
  return {
    source: mdxSource,
    frontMatter: data,
  };
}

export async function getAllDocs() {
  // Get all the files in the docs directory
  const files = fs.readdirSync(path.join(contentDirectory, 'docs'));
  
  // Filter to only include .md files
  const mdFiles = files.filter(file => file.endsWith('.md'));
  
  // Get the slugs
  const slugs = mdFiles.map(file => file.replace(/\.md$/, ''));
  
  return slugs;
}