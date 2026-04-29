import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
console.log("RESEND KEY EXISTS:", !!process.env.RESEND_API_KEY, "LENGTH:", process.env.RESEND_API_KEY?.length)

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function POST(req: NextRequest) {
  const { to, subject, body } = await req.json();
  console.log("[send-email] Received:", { to, subject, bodyLength: body?.length });

  if (!to || !subject || !body) {
    return NextResponse.json({ error: "Missing required fields: to, subject, body" }, { status: 400 });
  }

  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: Array.isArray(to) ? to : [to],
    subject,
    html: body.includes("<") ? body : `<p style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#1e293b">${body.replace(/\n/g, "<br/>")}</p>`,
  });

  if (error) {
    console.error("[send-email] Resend error:", JSON.stringify(error, null, 2));
    return NextResponse.json({ error: error.message || JSON.stringify(error) }, { status: 400 });
  }

  return NextResponse.json({ id: data?.id });
}
