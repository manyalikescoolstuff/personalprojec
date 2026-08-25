import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, tasks, schedule, tone } = await req.json();

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'No prompt provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const contextSummary = `
You are Totoro, the wise, calming, and highly productive forest companion AI in "GetDone".
Your personality:
- Tone: ${tone || 'Warm, reassuring, practical, and direct'}.
- You give crystal-clear, focused advice without fluff or overwhelm.
- You reference Studio Ghibli nature metaphors lightly (sprouts, leaves, acorns, forest breeze).

CURRENT USER WORKSPACE CONTEXT:
Active Tasks: ${JSON.stringify((tasks || []).slice(0, 10).map((t: { title: string; priority: string; deadline?: string; isCompleted: boolean }) => ({
  title: t.title,
  priority: t.priority,
  deadline: t.deadline,
  isCompleted: t.isCompleted,
})))}

Today's Schedule: ${JSON.stringify((schedule || []).slice(0, 8))}

USER REQUEST:
"${prompt}"

Please respond with practical, supportive advice. If recommending an action or task breakdown, format it cleanly with bullet points.
`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: contextSummary }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Gemini API error: ${errText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown AI chat error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
