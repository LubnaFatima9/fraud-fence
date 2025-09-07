/**
 * Simple markdown formatter for AI explanations
 * Converts markdown syntax to JSX elements for better display
 */

import { ReactNode } from 'react';

export function formatMarkdownExplanation(text: string): ReactNode[] {
  if (!text) return [];

  // Split by double newlines to get paragraphs
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  
  return paragraphs.map((paragraph, index) => {
    // Check if this is a heading (starts with #)
    if (paragraph.startsWith('#')) {
      const headingLevel = paragraph.match(/^#+/)?.[0].length || 1;
      const headingText = paragraph.replace(/^#+\s*/, '');
      
      const HeadingComponent = headingLevel === 1 ? 'h2' : 
                               headingLevel === 2 ? 'h3' : 'h4';
      
      return (
        <HeadingComponent 
          key={index} 
          className={`font-semibold mb-2 mt-4 first:mt-0 ${
            headingLevel === 1 ? 'text-lg' : 
            headingLevel === 2 ? 'text-base' : 'text-sm'
          }`}
        >
          {formatInlineMarkdown(headingText)}
        </HeadingComponent>
      );
    }
    
    // Check if this is a list item (starts with - or *)
    if (paragraph.startsWith('-') || paragraph.startsWith('*')) {
      const listItems = paragraph.split('\n').filter(item => item.trim());
      return (
        <ul key={index} className="list-disc list-inside space-y-1 mb-3">
          {listItems.map((item, itemIndex) => (
            <li key={itemIndex} className="text-sm">
              {formatInlineMarkdown(item.replace(/^[-*]\s*/, ''))}
            </li>
          ))}
        </ul>
      );
    }
    
    // Regular paragraph
    return (
      <p key={index} className="text-sm mb-3 leading-relaxed">
        {formatInlineMarkdown(paragraph)}
      </p>
    );
  });
}

function formatInlineMarkdown(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let currentIndex = 0;
  
  // Find all bold text (**text**)
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;
  
  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the bold part
    if (match.index > currentIndex) {
      parts.push(text.slice(currentIndex, match.index));
    }
    
    // Add the bold part
    parts.push(
      <strong key={`bold-${match.index}`} className="font-semibold text-foreground">
        {match[1]}
      </strong>
    );
    
    currentIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (currentIndex < text.length) {
    parts.push(text.slice(currentIndex));
  }
  
  return parts.length > 0 ? parts : [text];
}
