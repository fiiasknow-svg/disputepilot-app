import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { letter, tone, focus, letterType } = await req.json();

    const systemPrompt = `You are a professional credit repair specialist and legal writer. Your job is to rewrite dispute letters to be more effective, legally precise, and professional. You understand FCRA, FDCPA, and FCBA regulations.`;

    const userPrompt = `Rewrite the following ${letterType} dispute letter with these requirements:
- Tone: ${tone}
- Focus: ${focus}
- Reference the appropriate law (FCRA Section 611, FDCPA, etc.) where relevant
- Be clear, firm, and professional
- Include a deadline for response (30 days per FCRA)
- Do NOT include placeholder brackets — write complete, ready-to-send language
- Preserve the factual claims from the original
- Make it stronger and more likely to get a response

Original letter:
${letter}

Return ONLY the rewritten letter text, no commentary.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI error: ${err}`);
    }

    const data = await response.json();
    const rewritten = data.choices[0].message.content.trim();
    return NextResponse.json({ rewritten });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to rewrite letter" }, { status: 500 });
  }
}
