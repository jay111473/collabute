import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import type { Root, Content, PhrasingContent, ListItem, Paragraph, Heading, Link, Image, InlineCode, Strong, Emphasis, Delete, Text, Code, Blockquote, List } from 'mdast';

interface TiptapNode {
  type: string;
  attrs?: Record<string, any>;
  content?: TiptapNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, any> }>;
}

interface TiptapDocument {
  type: 'doc';
  content: TiptapNode[];
}

function convertTextNode(node: Text): TiptapNode {
  return {
    type: 'text',
    text: node.value,
  };
}

function convertInlineNode(node: PhrasingContent): TiptapNode[] {
  switch (node.type) {
    case 'text':
      return [{
        type: 'text',
        text: node.value,
      }];
    
    case 'strong':
      return node.children.flatMap(child => 
        convertInlineNode(child).map(n => ({
          ...n,
          marks: [...(n.marks || []), { type: 'bold' }],
        }))
      );
    
    case 'emphasis':
      return node.children.flatMap(child => 
        convertInlineNode(child).map(n => ({
          ...n,
          marks: [...(n.marks || []), { type: 'italic' }],
        }))
      );
    
    case 'delete':
      return node.children.flatMap(child => 
        convertInlineNode(child).map(n => ({
          ...n,
          marks: [...(n.marks || []), { type: 'strike' }],
        }))
      );
    
    case 'inlineCode':
      return [{
        type: 'text',
        text: node.value,
        marks: [{ type: 'code' }],
      }];
    
    case 'link':
      return node.children.flatMap(child => 
        convertInlineNode(child).map(n => ({
          ...n,
          marks: [...(n.marks || []), { 
            type: 'link', 
            attrs: { href: node.url, title: node.title || null } 
          }],
        }))
      );
    
    case 'image':
      return [{
        type: 'text',
        text: node.alt || '',
      }];
    
    case 'break':
      return [{
        type: 'hardBreak',
      }];
    
    default:
      // Handle unknown inline nodes as text
      return [{
        type: 'text',
        text: '',
      }];
  }
}

function convertBlockNode(node: Content): TiptapNode | null {
  switch (node.type) {
    case 'paragraph': {
      const content = node.children.flatMap(convertInlineNode);
      return {
        type: 'paragraph',
        content: content.length > 0 ? content : [{ type: 'text', text: '' }],
      };
    }
    
    case 'heading':
      return {
        type: 'heading',
        attrs: { level: node.depth },
        content: node.children.flatMap(convertInlineNode),
      };
    
    case 'code':
      return {
        type: 'codeBlock',
        attrs: { language: node.lang || null },
        content: [{
          type: 'text',
          text: node.value,
        }],
      };
    
    case 'blockquote':
      return {
        type: 'blockquote',
        content: node.children.map(convertBlockNode).filter(Boolean) as TiptapNode[],
      };
    
    case 'list': {
      const listType = node.ordered ? 'orderedList' : 'bulletList';
      return {
        type: listType,
        content: node.children.map((item: ListItem) => ({
          type: 'listItem',
          content: item.children.map(convertBlockNode).filter(Boolean) as TiptapNode[],
        })),
      };
    }
    
    case 'listItem':
      return {
        type: 'listItem',
        content: node.children.map(convertBlockNode).filter(Boolean) as TiptapNode[],
      };
    
    case 'thematicBreak':
      return {
        type: 'horizontalRule',
      };
    
    case 'image':
      return {
        type: 'image',
        attrs: {
          src: node.url,
          alt: node.alt || null,
          title: node.title || null,
        },
      };
    
    case 'html':
      // Skip HTML nodes for now
      return null;
    
    case 'table':
      // Tables are complex, skip for now
      return null;
    
    default:
      console.warn('Unknown block node type:', (node as any).type);
      return null;
  }
}

export async function convertMdxToTiptap(mdxContent: string): Promise<TiptapDocument> {
  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm);
    
    const tree = processor.parse(mdxContent) as Root;
    
    const content = tree.children
      .map(convertBlockNode)
      .filter(Boolean) as TiptapNode[];
    
    return {
      type: 'doc',
      content: content.length > 0 ? content : [{
        type: 'paragraph',
        content: [{ type: 'text', text: '' }],
      }],
    };
  } catch (error) {
    console.error('Error converting MDX to Tiptap:', error);
    return {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: mdxContent }],
      }],
    };
  }
}

export function detectMdxContent(text: string): boolean {
  // Only detect as MDX if it has significant markdown patterns
  // Require at least 2 different patterns or 1 strong pattern
  const patterns = [
    { pattern: /^#{1,6}\s+.+$/m, weight: 2, name: 'heading' },        // Headings (strong indicator)
    { pattern: /^\*\s+.+$/m, weight: 1, name: 'bullet_list' },       // Bullet lists
    { pattern: /^\d+\.\s+.+$/m, weight: 1, name: 'numbered_list' },  // Numbered lists
    { pattern: /^\>\s+.+$/m, weight: 2, name: 'blockquote' },        // Blockquotes (strong indicator)
    { pattern: /```[\s\S]*?```/, weight: 3, name: 'code_block' },    // Code blocks (very strong indicator)
    { pattern: /\*\*[^*\n]{2,}\*\*/, weight: 1, name: 'bold' },     // Bold (at least 2 chars)
    { pattern: /(?<!\*)\*[^*\n]{2,}\*(?!\*)/, weight: 1, name: 'italic' }, // Italic (not bold)
    { pattern: /\[.{2,}\]\([^)\s]+\)/, weight: 2, name: 'link' },    // Links (strong indicator)
    { pattern: /!\[.*\]\([^)\s]+\)/, weight: 2, name: 'image' },     // Images (strong indicator)
    { pattern: /`[^`\n]{2,}`/, weight: 1, name: 'inline_code' },     // Inline code (at least 2 chars)
    { pattern: /^-{3,}$/m, weight: 2, name: 'hr' },                 // Horizontal rules
    { pattern: /^\|\s*.+\s*\|/m, weight: 2, name: 'table' },        // Tables
  ];
  
  let totalWeight = 0;
  let matchedPatterns = 0;
  const matches: string[] = [];
  
  for (const { pattern, weight, name } of patterns) {
    if (pattern.test(text)) {
      totalWeight += weight;
      matchedPatterns++;
      matches.push(name);
    }
  }
  
  // Consider it MDX if:
  // 1. Has 3+ weight points (strong indicators)
  // 2. Has 2+ different patterns with 2+ total weight
  // 3. Text is long enough and has multiple patterns
  const isLikelyMdx = totalWeight >= 3 || 
                      (matchedPatterns >= 2 && totalWeight >= 2) ||
                      (text.length > 100 && matchedPatterns >= 2);
  
  // Debug logging
  if (typeof window !== 'undefined' && (window as any).debugMdx) {
    console.log('MDX Detection:', {
      text: text.substring(0, 100) + '...',
      totalWeight,
      matchedPatterns,
      matches,
      isLikelyMdx,
    });
  }
  
  return isLikelyMdx;
}