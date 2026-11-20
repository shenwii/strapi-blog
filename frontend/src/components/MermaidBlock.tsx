'use client';

import React, { useEffect, useId, useState } from 'react';
import { AlertTriangle, Check, Copy } from 'lucide-react';

export function MermaidBlock({ chart }: { chart: string }) {
  const reactId = useId();
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Track <html class="dark"> changes triggered by ThemeToggle
  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => setIsDark(root.classList.contains('dark'));
    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const renderId = `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}-${isDark ? 'd' : 'l'}`;

    async function render() {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'default',
          securityLevel: 'strict',
        });

        const { svg: renderedSvg } = await mermaid.render(renderId, chart.trim());
        if (!cancelled) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setSvg('');
          setError((err as Error)?.message || 'Invalid Mermaid syntax');
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [chart, isDark, reactId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(chart);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard errors in non-HTTPS contexts
    }
  };

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/90 px-4 py-2 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <span className="font-mono uppercase tracking-wider">Mermaid</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition hover:bg-slate-200/70 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Copy Mermaid source"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {error ? (
        <div className="p-4">
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Mermaid syntax error: {error}</span>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-200">
            <code>{chart}</code>
          </pre>
        </div>
      ) : svg ? (
        <div
          className="flex justify-center overflow-x-auto p-4 [&_svg]:max-w-full [&_svg]:h-auto"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="flex h-32 items-center justify-center text-xs text-slate-400">
          Rendering diagram...
        </div>
      )}
    </div>
  );
}
