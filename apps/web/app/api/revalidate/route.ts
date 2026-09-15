import { revalidatePath } from 'next/cache';

interface WebhookPayload {
  event: 'post.published' | 'post.updated' | 'post.deleted';
  post_id: number;
  slug: string;
  type: string;
  timestamp: string;
}

export async function POST(request: Request) {
  // Verify shared secret from header (sent by starter-webhook plugin)
  const secret = request.headers.get('X-Webhook-Secret');

  if (!secret || secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: WebhookPayload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { event, slug } = payload;

  if (!event || !slug) {
    return Response.json({ error: 'Missing event or slug' }, { status: 400 });
  }

  try {
    // Always revalidate the blog list and homepage
    revalidatePath('/blog');
    revalidatePath('/');

    if (event === 'post.published' || event === 'post.updated') {
      // Revalidate the specific post page
      revalidatePath(`/blog/${slug}`);
    }

    // For post.deleted we only revalidate the list pages above —
    // the post page will return 404 on next request via notFound()

    console.log(`[revalidate] ${event} -> /blog/${slug}`);

    return Response.json({
      revalidated: true,
      event,
      slug,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[revalidate] Error:', err);
    return Response.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}