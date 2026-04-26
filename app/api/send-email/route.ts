import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    console.error("[send-email] Resend error:", error);
    console.error("[send-email] Full error:", JSON.stringify(error));
    return NextResponse.json({ error: error.message, name: error.name }, { status: 400 });
  }

  return NextResponse.json({ id: data?.id });
}
