import ReactMarkdown from "react-markdown";

export default function MarkdownMessage({ content, className = "" }) {
  return (
    <div className={`markdown-message ${className}`}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          h1: ({ children }) => <h1 className="text-base font-bold mb-1">{children}</h1>,
          h2: ({ children }) => <h2 className="text-sm font-bold mb-1">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
          code: ({ children, inline }) =>
            inline
              ? <code className="bg-black/10 px-1 py-0.5 rounded text-[13px] font-mono">{children}</code>
              : <pre className="bg-black/10 px-3 py-2 rounded-lg text-[13px] font-mono overflow-x-auto my-2"><code>{children}</code></pre>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-current/20 pl-3 italic opacity-80 my-2">{children}</blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
