export async function POST(request: Request) {
  const submitted = await request.json().catch(() => ({}));
  return Response.json({
    ok: true,
    mode: "local-demo",
    message: "Affiliate referral submission received by the local demo endpoint.",
    submission: submitted,
    receivedAt: new Date().toISOString(),
  });
}
