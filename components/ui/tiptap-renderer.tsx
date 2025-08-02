"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

interface TiptapRendererProps {
  content: TiptapDocument | null | undefined;
  className?: string;
}

const renderMarks = (text: string, marks?: Array<{ type: string; attrs?: Record<string, any> }>): React.ReactNode => {
  if (!marks || marks.length === 0) {
    return text;
  }

  let element: React.ReactNode = text;

  // Apply marks in reverse order to handle nesting properly
  marks.reverse().forEach((mark) => {
    switch (mark.type) {
      case 'bold':
        element = <strong className="font-bold text-white">{element}</strong>;
        break;
      case 'italic':
        element = <em className="italic">{element}</em>;
        break;
      case 'strike':
        element = <s className="line-through text-gray-400">{element}</s>;
        break;
      case 'code':
        element = (
          <code className="bg-gray-800 text-yellow-400 px-1.5 py-0.5 rounded text-sm font-mono">
            {element}
          </code>
        );
        break;
      case 'link':
        element = (
          <Link
            href={mark.attrs?.href || '#'}
            target={mark.attrs?.target || '_blank'}
            rel="noopener noreferrer"
            className="text-blue-400 underline hover:text-blue-300 transition-colors"
          >
            {element}
          </Link>
        );
        break;
      default:
        break;
    }
  });

  return element;
};

const renderNode = (node: TiptapNode, index: number): React.ReactNode => {
  switch (node.type) {
    case 'doc':
      return (
        <div key={index} className="space-y-4">
          {node.content?.map((child, childIndex) => renderNode(child, childIndex))}
        </div>
      );

    case 'paragraph':
      const paragraphContent = node.content?.map((child, childIndex) => {
        if (child.type === 'text') {
          return (
            <span key={childIndex}>
              {renderMarks(child.text || '', child.marks)}
            </span>
          );
        }
        return renderNode(child, childIndex);
      });

      return (
        <p key={index} className="text-gray-300 leading-relaxed mb-4 last:mb-0">
          {paragraphContent}
        </p>
      );

    case 'heading':
      const level = node.attrs?.level || 1;
      const headingContent = node.content?.map((child, childIndex) => {
        if (child.type === 'text') {
          return (
            <span key={childIndex}>
              {renderMarks(child.text || '', child.marks)}
            </span>
          );
        }
        return renderNode(child, childIndex);
      });

      const headingClasses = {
        1: 'text-3xl md:text-4xl font-bold text-white mb-6 mt-8 first:mt-0',
        2: 'text-2xl md:text-3xl font-bold text-white mb-5 mt-7 first:mt-0',
        3: 'text-xl md:text-2xl font-semibold text-white mb-4 mt-6 first:mt-0',
        4: 'text-lg md:text-xl font-semibold text-white mb-3 mt-5 first:mt-0',
        5: 'text-base md:text-lg font-semibold text-white mb-2 mt-4 first:mt-0',
        6: 'text-sm md:text-base font-semibold text-white mb-2 mt-4 first:mt-0',
      };

      const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
      return (
        <HeadingTag
          key={index}
          className={headingClasses[level as keyof typeof headingClasses]}
        >
          {headingContent}
        </HeadingTag>
      );

    case 'bulletList':
      return (
        <ul key={index} className="list-disc list-inside space-y-2 mb-4 ml-4 text-gray-300">
          {node.content?.map((child, childIndex) => renderNode(child, childIndex))}
        </ul>
      );

    case 'orderedList':
      return (
        <ol key={index} className="list-decimal list-inside space-y-2 mb-4 ml-4 text-gray-300">
          {node.content?.map((child, childIndex) => renderNode(child, childIndex))}
        </ol>
      );

    case 'listItem':
      const listItemContent = node.content?.map((child, childIndex) => {
        if (child.type === 'paragraph') {
          // For list items, render paragraph content without the paragraph wrapper
          return (
            <span key={childIndex}>
              {child.content?.map((grandChild, grandChildIndex) => {
                if (grandChild.type === 'text') {
                  return (
                    <span key={grandChildIndex}>
                      {renderMarks(grandChild.text || '', grandChild.marks)}
                    </span>
                  );
                }
                return renderNode(grandChild, grandChildIndex);
              })}
            </span>
          );
        }
        return renderNode(child, childIndex);
      });

      return <li key={index}>{listItemContent}</li>;

    case 'blockquote':
      return (
        <blockquote key={index} className="border-l-4 border-gray-600 pl-4 my-6 italic text-gray-400">
          {node.content?.map((child, childIndex) => renderNode(child, childIndex))}
        </blockquote>
      );

    case 'codeBlock':
      const language = node.attrs?.language;
      const codeContent = node.content?.[0]?.text || '';

      return (
        <div key={index} className="my-6">
          {language && (
            <div className="bg-gray-800 text-gray-400 text-xs px-4 py-2 rounded-t-lg border-b border-gray-700">
              {language}
            </div>
          )}
          <pre className={`overflow-x-auto p-4 bg-gray-900 text-gray-300 font-mono text-sm ${language ? 'rounded-b-lg' : 'rounded-lg'}`}>
            <code>{codeContent}</code>
          </pre>
        </div>
      );

    case 'horizontalRule':
      return (
        <hr key={index} className="border-gray-700 my-8" />
      );

    case 'image':
      const src = node.attrs?.src;
      const alt = node.attrs?.alt || '';
      const title = node.attrs?.title;

      if (!src) return null;

      return (
        <div key={index} className="my-6">
          <div className="relative w-full h-auto">
            <Image
              src={src}
              alt={alt}
              width={800}
              height={400}
              className="rounded-lg object-cover max-w-full h-auto"
              title={title}
            />
          </div>
          {(alt || title) && (
            <p className="text-center text-sm text-gray-500 mt-2 italic">
              {alt || title}
            </p>
          )}
        </div>
      );

    case 'hardBreak':
      return <br key={index} />;

    case 'text':
      return (
        <span key={index}>
          {renderMarks(node.text || '', node.marks)}
        </span>
      );

    default:
      console.warn(`Unknown node type: ${node.type}`, node);
      return null;
  }
};

export function TiptapRenderer({ content, className = '' }: TiptapRendererProps) {
  if (!content || !content.content) {
    return (
      <div className={`text-gray-500 italic ${className}`}>
        No content available.
      </div>
    );
  }

  try {
    return (
      <div className={`prose prose-invert max-w-none ${className}`}>
        {content.content.map((node, index) => renderNode(node, index))}
      </div>
    );
  } catch (error) {
    console.error('Error rendering Tiptap content:', error);
    return (
      <div className={`text-red-400 ${className}`}>
        Error rendering content. Please try refreshing the page.
      </div>
    );
  }
}

export default TiptapRenderer;