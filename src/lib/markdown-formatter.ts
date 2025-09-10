import React from 'react';

/**
 * Formats markdown-style text with improved styling for better readability
 */
export function formatMarkdownExplanation(text: string): React.ReactNode {
  if (!text) return null;

  // Split by double line breaks to create sections
  const sections = text.split('\n\n').filter(section => section.trim());
  
  return (
    <div className="space-y-4">
      {sections.map((section, sectionIndex) => {
        const lines = section.split('\n').filter(line => line.trim());
        
        return (
          <div key={sectionIndex} className="space-y-2">
            {lines.map((line, lineIndex) => {
              const trimmedLine = line.trim();
              
              // Handle headers (## or #)
              if (trimmedLine.startsWith('##')) {
                return (
                  <h3 key={lineIndex} className="text-lg font-bold text-foreground mt-4 mb-2 flex items-center gap-2">
                    <div className="w-1 h-6 bg-primary rounded-full"></div>
                    {trimmedLine.replace(/^##\s*/, '')}
                  </h3>
                );
              }
              
              if (trimmedLine.startsWith('#')) {
                return (
                  <h2 key={lineIndex} className="text-xl font-bold text-foreground mt-6 mb-3 border-b border-border pb-2">
                    {trimmedLine.replace(/^#\s*/, '')}
                  </h2>
                );
              }
              
              // Handle bullet points with enhanced styling
              if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
                const content = trimmedLine.replace(/^[-•]\s*/, '');
                return (
                  <div key={lineIndex} className="flex items-start gap-3 py-1">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm leading-relaxed">{formatInlineMarkdown(content)}</span>
                  </div>
                );
              }
              
              // Handle numbered lists
              const numberedMatch = trimmedLine.match(/^(\d+)\.\s*(.*)$/);
              if (numberedMatch) {
                return (
                  <div key={lineIndex} className="flex items-start gap-3 py-1">
                    <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {numberedMatch[1]}
                    </div>
                    <span className="text-sm leading-relaxed">{formatInlineMarkdown(numberedMatch[2])}</span>
                  </div>
                );
              }
              
              // Handle regular paragraphs with improved spacing
              if (trimmedLine) {
                return (
                  <p key={lineIndex} className="text-sm leading-relaxed text-muted-foreground">
                    {formatInlineMarkdown(trimmedLine)}
                  </p>
                );
              }
              
              return null;
            })}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Formats inline markdown elements like **bold** and *italic*
 */
function formatInlineMarkdown(text: string): React.ReactNode {
  // Handle **bold** text
  const boldRegex = /\*\*(.*?)\*\*/g;
  let parts: (string | React.ReactElement)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    // Add the bold text
    parts.push(
      <strong key={match.index} className="font-bold text-foreground">
        {match[1]}
      </strong>
    );
    
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  // If no bold formatting was found, return the original text
  if (parts.length === 0) {
    parts = [text];
  }

  // Now handle *italic* in the parts
  return parts.map((part, index) => {
    if (typeof part === 'string') {
      const italicRegex = /\*(.*?)\*/g;
      const italicParts: (string | React.ReactElement)[] = [];
      let lastItalicIndex = 0;
      let italicMatch;

      while ((italicMatch = italicRegex.exec(part)) !== null) {
        if (italicMatch.index > lastItalicIndex) {
          italicParts.push(part.slice(lastItalicIndex, italicMatch.index));
        }
        
        italicParts.push(
          <em key={`${index}-${italicMatch.index}`} className="italic text-muted-foreground">
            {italicMatch[1]}
          </em>
        );
        
        lastItalicIndex = italicMatch.index + italicMatch[0].length;
      }

      if (lastItalicIndex < part.length) {
        italicParts.push(part.slice(lastItalicIndex));
      }

      return italicParts.length > 0 ? italicParts : part;
    }
    
    return part;
  });
}
