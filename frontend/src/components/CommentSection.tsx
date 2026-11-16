'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { MessageSquare, Reply, Send, X } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n';

interface CommentAuthor {
  id?: string | number;
  name?: string;
  email?: string;
  avatar?: string;
}

interface CommentNode {
  id: number;
  documentId?: string;
  content: string;
  createdAt: string;
  blocked?: boolean;
  approvalStatus?: string;
  author?: CommentAuthor;
  children?: CommentNode[];
}

function CommentItem({
  comment,
  locale,
  dict,
  depth,
  onReply,
}: {
  comment: CommentNode;
  locale: string;
  dict: Dictionary;
  depth: number;
  onReply: (comment: CommentNode) => void;
}) {
  const authorName = comment.author?.name || 'Guest';
  const initial = authorName.slice(0, 1).toUpperCase();
  const formattedDate = (() => {
    try {
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(comment.createdAt));
    } catch {
      return comment.createdAt;
    }
  })();

  if (comment.blocked) return null;

  return (
    <div className={depth > 0 ? 'ml-6 border-l-2 border-slate-200 pl-4 dark:border-slate-800' : ''}>
      <div className="rounded-xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
              {initial}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{authorName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{formattedDate}</p>
            </div>
          </div>
          {depth < 3 && (
            <button
              type="button"
              onClick={() => onReply(comment)}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <Reply className="h-3.5 w-3.5" />
              <span>{dict.commentReply}</span>
            </button>
          )}
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {comment.content}
        </p>
      </div>

      {comment.children && comment.children.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.children.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              locale={locale}
              dict={dict}
              depth={depth + 1}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({
  articleDocumentId,
  locale,
  dict,
}: {
  articleDocumentId: string;
  locale: string;
  dict: Dictionary;
}) {
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<CommentNode | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadComments = useCallback(async () => {
    try {
      const res = await fetch(`/bff/comments/${encodeURIComponent(articleDocumentId)}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setComments(Array.isArray(data) ? data : data?.data || []);
      }
    } catch {
      // Keep UI clean if backend comments endpoint is unavailable
    } finally {
      setLoading(false);
    }
  }, [articleDocumentId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/bff/comments/${encodeURIComponent(articleDocumentId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: authorName.trim(),
          authorEmail: authorEmail.trim() || undefined,
          content: content.trim(),
          threadOf: replyTo ? replyTo.id : null,
        }),
      });

      if (!res.ok) {
        setFeedback({ type: 'error', message: dict.commentError });
        return;
      }

      const created = await res.json();
      setContent('');
      setReplyTo(null);

      if (created?.approvalStatus === 'PENDING') {
        setFeedback({ type: 'success', message: dict.commentPendingApproval });
      } else {
        setFeedback({ type: 'success', message: dict.commentSuccess });
      }
      await loadComments();
    } catch {
      setFeedback({ type: 'error', message: dict.commentError });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="comments" className="mt-12 border-t border-slate-200 pt-10 dark:border-slate-800">
      <div className="mb-6 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-[var(--site-accent,#0ea5e9)]" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {dict.commentsTitle}
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/50"
      >
        {replyTo && (
          <div className="mb-3 flex items-center justify-between rounded-lg bg-slate-200/70 px-3 py-2 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <span>
              {dict.commentReplyingTo}: <strong>{replyTo.author?.name || 'Guest'}</strong>
            </span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              <span>{dict.commentCancelReply}</span>
            </button>
          </div>
        )}

        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            required
            maxLength={80}
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder={dict.commentName}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[var(--site-accent,#0ea5e9)] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <input
            type="email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            placeholder={dict.commentEmail}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[var(--site-accent,#0ea5e9)] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        <textarea
          required
          rows={3}
          maxLength={3000}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={dict.commentBody}
          className="mb-3 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[var(--site-accent,#0ea5e9)] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {feedback && (
              <p
                className={`text-xs font-medium ${
                  feedback.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {feedback.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
          >
            <Send className="h-4 w-4" />
            <span>{submitting ? dict.commentSubmitting : dict.commentSubmit}</span>
          </button>
        </div>
      </form>

      {loading ? (
        <div className="space-y-3">
          <div className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/60" />
          <div className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/60" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">{dict.commentsEmpty}</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              locale={locale}
              dict={dict}
              depth={0}
              onReply={(target) => setReplyTo(target)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
