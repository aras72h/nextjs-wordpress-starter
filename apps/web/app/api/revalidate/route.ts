// Revalidation API — stub for Phase 5
// Called by the WordPress starter-webhook plugin on post publish/update/delete
// Full implementation (revalidatePath) will be added in Phase 5

export async function POST(request: Request) {
  const secret = new URL(request.url).searchParams.get('secret');

  if (!secret || secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Phase 5: call revalidatePath() / revalidateTag() here
  return Response.json({
    revalidated: false,
    message: 'Revalidation stub — Phase 5 not yet implemented',
  });
}
