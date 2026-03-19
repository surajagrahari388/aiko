import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

const EMPTY_STYLE: React.CSSProperties = {};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  style = EMPTY_STYLE
}) => {
  const formatMarkdown = (text: string) => {
    return text
      // Headers
      .replace(/^### (.*$)/gm, '<h3 style="font-size: 1.1em; font-weight: bold; margin: 12px 0 6px 0; color: inherit; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 style="font-size: 1.2em; font-weight: bold; margin: 14px 0 8px 0; color: inherit; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 4px;">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 style="font-size: 1.3em; font-weight: bold; margin: 16px 0 10px 0; color: inherit; border-bottom: 3px solid rgba(255,255,255,0.3); padding-bottom: 6px;">$1</h1>')
      
      // Bold and Italic (process bold first, then italic to avoid conflicts)
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>')
      .replace(/\*((?!\*)(.*?))\*/g, '<em style="font-style: italic; opacity: 0.9;">$1</em>')
      
      // Inline code
      .replace(/`(.*?)`/g, '<code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-family: monospace; border: 1px solid rgba(255,255,255,0.1);">$1</code>')
      
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; margin: 8px 0; overflow-x: auto; border-left: 3px solid rgba(255,255,255,0.3);"><code style="font-family: monospace; font-size: 0.9em; white-space: pre-wrap;">$1</code></pre>')
      
      // Lists - Unordered
      .replace(/^\* (.*$)/gm, '<div style="margin: 4px 0; padding-left: 20px; position: relative;"><span style="position: absolute; left: 8px; color: rgba(255,255,255,0.7);">•</span>$1</div>')
      .replace(/^\+ (.*$)/gm, '<div style="margin: 4px 0; padding-left: 20px; position: relative;"><span style="position: absolute; left: 8px; color: rgba(255,255,255,0.7);">•</span>$1</div>')
      .replace(/^- (.*$)/gm, '<div style="margin: 4px 0; padding-left: 20px; position: relative;"><span style="position: absolute; left: 8px; color: rgba(255,255,255,0.7);">•</span>$1</div>')
      
      // Lists - Ordered
      .replace(/^(\d+)\. (.*$)/gm, '<div style="margin: 4px 0; padding-left: 24px; position: relative;"><span style="position: absolute; left: 0; color: rgba(255,255,255,0.7); font-weight: 500;">$1.</span>$2</div>')
      
      // Blockquotes
      .replace(/^> (.*$)/gm, '<blockquote style="margin: 8px 0; padding: 8px 16px; border-left: 3px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.05); font-style: italic;">$1</blockquote>')
      
      // Horizontal rules
      .replace(/^---$/gm, '<hr style="margin: 16px 0; border: none; border-top: 2px solid rgba(255,255,255,0.2);">')
      .replace(/^___$/gm, '<hr style="margin: 16px 0; border: none; border-top: 2px solid rgba(255,255,255,0.2);">')
      
      // Links (basic support)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #60a5fa; text-decoration: underline;" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Line breaks
      .replace(/\n\n/g, '<br><br>') // Double line breaks
      .replace(/\n/g, '<br>'); // Single line breaks
  };

  return (
    <div 
      className={className}
      style={{
        lineHeight: '1.6',
        fontSize: '14px',
        wordWrap: 'break-word',
        ...style
      }}
      dangerouslySetInnerHTML={{ 
        __html: formatMarkdown(content) 
      }}
    />
  );
};
