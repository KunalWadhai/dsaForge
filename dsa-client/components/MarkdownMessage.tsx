"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = { content: string };

export default function MarkdownMessage({ content }: Props) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: (p) => <h1 className="md-h1" {...p} />,
        h2: (p) => <h2 className="md-h2" {...p} />,
        h3: (p) => <h3 className="md-h3" {...p} />,
        h4: (p) => <h4 className="md-h4" {...p} />,

        p: (p) => <p className="md-p" {...p} />,

        ul: (p) => <ul className="md-ul" {...p} />,
        ol: (p) => <ol className="md-ol" {...p} />,
        li: (p) => <li className="md-li" {...p} />,

        // react-markdown v8+ removed the `inline` prop.
        // Detect inline code: no language class + no newline in content.
        code: ({ className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || "");
          const isBlock = Boolean(match) || String(children).includes("\n");

          return isBlock ? (
            <div className="md-code-block-wrapper">
              {match && <div className="md-code-lang">{match[1]}</div>}
              <pre className="md-pre">
                <code className={`md-code ${className ?? ""}`} {...props}>
                  {children}
                </code>
              </pre>
            </div>
          ) : (
            <code className="md-code-inline" {...props}>
              {children}
            </code>
          );
        },

        blockquote: (p) => <blockquote className="md-blockquote" {...p} />,

        a: ({ href, children, ...p }) => (
          <a
            className="md-link"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            {...p}
          >
            {children}
          </a>
        ),

        table: (p) => (
          <div className="md-table-wrapper">
            <table className="md-table" {...p} />
          </div>
        ),
        thead: (p) => <thead className="md-thead" {...p} />,
        tbody: (p) => <tbody className="md-tbody" {...p} />,
        tr:    (p) => <tr    className="md-tr"    {...p} />,
        th:    (p) => <th    className="md-th"    {...p} />,
        td:    (p) => <td    className="md-td"    {...p} />,

        hr:     (p) => <hr     className="md-hr"     {...p} />,
        strong: (p) => <strong className="md-strong" {...p} />,
        em:     (p) => <em     className="md-em"     {...p} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
