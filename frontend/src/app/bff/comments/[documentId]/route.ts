import { NextRequest, NextResponse } from 'next/server';
import { getStrapiApiToken, getStrapiInternalUrl, isCommentsEnabled } from '@/lib/env';

function buildRelation(documentId: string): string {
  return `api::article.article:${encodeURIComponent(documentId)}`;
}

function buildHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = getStrapiApiToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ documentId: string }> }
) {
  if (!isCommentsEnabled()) {
    return NextResponse.json([]);
  }

  const { documentId } = await context.params;
  const relation = buildRelation(documentId);
  const url = `${getStrapiInternalUrl()}/api/comments/${relation}`;

  try {
    const res = await fetch(url, {
      headers: buildHeaders(),
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return NextResponse.json(
        { error: 'Failed to load comments', detail: text },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Unable to reach Strapi comments API', detail: (error as Error).message },
      { status: 502 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ documentId: string }> }
) {
  if (!isCommentsEnabled()) {
    return NextResponse.json({ error: 'Comments are disabled' }, { status: 403 });
  }

  const { documentId } = await context.params;

  let body: {
    content?: string;
    authorName?: string;
    authorEmail?: string;
    threadOf?: number | string | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const content = (body.content || '').trim();
  const authorName = (body.authorName || '').trim();
  const authorEmail = (body.authorEmail || '').trim();

  if (!content || content.length > 3000) {
    return NextResponse.json({ error: 'Comment content must be between 1 and 3000 characters' }, { status: 400 });
  }
  if (!authorName || authorName.length > 80) {
    return NextResponse.json({ error: 'Author name must be between 1 and 80 characters' }, { status: 400 });
  }

  const guestId = `guest-${Buffer.from(`${authorName}:${authorEmail || 'anon'}`)
    .toString('base64url')
    .slice(0, 24)}`;

  const payload = {
    content,
    threadOf: body.threadOf ?? null,
    author: {
      id: guestId,
      name: authorName,
      ...(authorEmail ? { email: authorEmail } : {}),
    },
  };

  const relation = buildRelation(documentId);
  const url = `${getStrapiInternalUrl()}/api/comments/${relation}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to submit comment', detail: data },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unable to submit comment', detail: (error as Error).message },
      { status: 502 }
    );
  }
}
