"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ComponentProps } from "react";

type MarkdownMessageProps = {
  content: string;
};

export default function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Headings
        h1: ({ node, ...props }) => <h1 className="md-h1" {...props} />,
        h2: ({ node, ...props }) => <h2 className="md-h2" {...props} />,
        h3: ({ node, ...props }) => <h3 className="md-h3" {...props} />,
        h4: ({ node, ...props }) => <h4 className="md-h4" {...props} />,
        
        // Paragraphs
        p: ({ node, ...props }) => <p className="md-p" {...props} />,
        
        // Lists
        ul: ({ node, ...props }) => <ul className="md-ul" {...props} />,
        ol: ({ node, ...props }) => <ol className="md-ol" {...props} />,
        li: ({ node, ...props }) => <li className="md-li" {...props} />,
        
        // Code
        code: ({ node, inline, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || "");
          return inline ? (
            <code className="md-code-inline" {...props}>
              {children}
            </code>
          ) : (
            <div className="md-code-block-wrapper">
              {match && <div className="md-code-lang">{match[1]}</div>}
              <pre className="md-pre">
                <code className={`md-code ${className || ""}`} {...props}>
                  {children}
                </code>
              </pre>
            </div>
          );
        },
        
        // Blockquote
        blockquote: ({ node, ...props }) => (
          <blockquote className="md-blockquote" {...props} />
        ),
        
        // Links
        a: ({ node, ...props }) => (
          <a className="md-link" target="_blank" rel="noopener noreferrer" {...props} />
        ),
        
        // Tables
        table: ({ node, ...props }) => (
          <div className="md-table-wrapper">
            <table className="md-table" {...props} />
          </div>
        ),
        thead: ({ node, ...props }) => <thead className="md-thead" {...props} />,
        tbody: ({ node, ...props }) => <tbody className="md-tbody" {...props} />,
        tr: ({ node, ...props }) => <tr className="md-tr" {...props} />,
        th: ({ node, ...props }) => <th className="md-th" {...props} />,
        td: ({ node, ...props}) => <td className="md-td" {...props} />,
        
        // Horizontal rule
        hr: ({ node, ...props }) => <hr className="md-hr" {...props} />,
        
        // Strong/Bold
        strong: ({ node, ...props }) => <strong className="md-strong" {...props} />,
        
        // Emphasis/Italic
        em: ({ node, ...props }) => <em className="md-em" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
