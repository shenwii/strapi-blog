import GithubSlugger from 'github-slugger';
import { getStrapiPublicUrl } from './env';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function extractToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();
  const lines = markdown.split('\n');
  const items: TocItem[] = [];
  let inCodeFence = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith('```') || line.startsWith('~~~')) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) continue;

    const match = /^(#{2,3})\s+(.+?)(?:\s+#+)?$/.exec(line);
    if (!match) continue;

    const level = match[1].length;
    const text = match[2]
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[`*_~]/g, '')
      .trim();

    if (!text) continue;
    items.push({
      id: slugger.slug(text),
      text,
      level,
    });
  }

  return items;
}

export function estimateReadingTime(markdown: string): number {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

  const cjkChars = (plain.match(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g) || []).length;
  const nonCjkWords = plain
    .replace(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const minutes = Math.ceil(cjkChars / 400 + nonCjkWords / 200);
  return Math.max(1, minutes);
}

export function rewriteMarkdownMediaUrls(markdown: string): string {
  const publicUrl = getStrapiPublicUrl();
  if (!publicUrl) return markdown;
  return markdown.replace(/\]\(\/uploads\//g, `](${publicUrl}/uploads/`);
}
