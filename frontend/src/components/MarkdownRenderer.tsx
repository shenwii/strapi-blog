'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import { Check, Copy } from 'lucide-react';
import { MermaidBlock } from './MermaidBlock';

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractText(node.props.children);
  }
  return '';
}

function CodeBlock({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const languageMatch = /language-([\w-]+)/.exec(className || '');
  const language = languageMatch?.[1] || '';

  const handleCopy = async () => {
    const text = extractText(children);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard errors in non-HTTPS contexts
    }
  };

  return (
    <div className="group relative my-6 overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-4 py-2 text-xs text-slate-400">
        <span className="font-mono uppercase tracking-wider">{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          aria-label="Copy code"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-slate-100">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-headings:font-semibold prose-a:text-[var(--site-accent,#0ea5e9)] prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeSlug,
          rehypeKatex,
          [rehypeHighlight, { ignoreMissing: true, plainText: ['mermaid'] }],
        ]}
        components={{
          pre({ children }) {
            const child = React.Children.only(children) as React.ReactElement<{
              className?: string;
              children?: React.ReactNode;
            }>;
            const className = child?.props?.className || '';
            if (/\blanguage-mermaid\b/.test(className)) {
              return <MermaidBlock chart={extractText(child?.props?.children)} />;
            }
            return <CodeBlock className={className}>{child?.props?.children}</CodeBlock>;
          },
          table({ children }) {
            return (
              <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="m-0 w-full">{children}</table>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
