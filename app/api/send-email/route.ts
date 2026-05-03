import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Email service is not configured. Missing RESEND_API_KEY." },
      { status: 500 }
    );
  }

  const { to, subject, body } = await req.json();

  if (!to || !subject || !body) {
    return NextResponse.json(
      { error: "Missing required fields: to, subject, body" },
      { status: 400 }
    );
  }

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: Array.isArray(to) ? to : [to],
    subject,
    html: body.includes("<")
      ? body
      : `<p style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#1e293b">${body.replace(/\n/g, "<br/>")}</p>`,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message || JSON.stringify(error) },
      { status: 400 }
    );
  }

  return NextResponse.json({ id: data?.id });
}
