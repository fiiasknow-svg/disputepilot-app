import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { scores, items } = await req.json();
    const prompt = `You are a credit repair expert. Analyze these credit report items and identify which are disputable under FCRA.

Credit Scores: Equifax ${scores.equifax}, Experian ${scores.experian}, TransUnion ${scores.transunion}

Items to analyze:
${items.map((item: any, i: number) => `${i + 1}. ${item.name} - ${item.type} - Balance: $${item.balance} - Status: ${item.status}`).join("\n")}

For each item, determine:
1. Is it disputable? (yes/no)
2. Best dispute reason (inaccurate info, not mine, outdated, unverifiable)
3. Which bureaus to dispute with
4. Priority (high/medium/low)

Respond in JSON format: { "analysis": [{ "index": 0, "disputable": true, "reason": "...", "bureaus": ["equifax"], "priority": "high", "explanation": "..." }], "summary": "..." }`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" } }),
    });

    if (!response.ok) throw new Error("OpenAI API error");
    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
