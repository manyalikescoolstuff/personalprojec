import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `
You are the intelligent Brain Dump Organizer and Workload Assistant for "GetDone", a Studio Ghibli-themed personal command center.
Your task is to analyze the user's raw thoughts, voice dictation, or workload notes and extract actionable structured items:
- Tasks (regular action items)
- Deadlines (tasks with specific time commitments or due dates)
- Routines (recurring habits, gym, study habits)
- Reminders (quick calls, check-ins, chores)
- Schedule events (activities with specific days or time slots)

Analyze the user's input and respond ONLY with a valid JSON object matching this exact TypeScript structure:

{
  "summary": "Short 1-2 sentence empathetic overview of what needs doing and the recommended focus.",
  "items": [
    {
      "title": "Clear, concise action title",
      "type": "task" | "deadline" | "event" | "routine" | "reminder",
      "category": "Academics" | "Projects" | "Personal" | "Health" | "Admin",
      "priority": "urgent" | "high" | "medium" | "low",
      "deadline": "e.g., Today · 5:00 PM, Tomorrow, Thursday, or null",
      "timeSlot": "e.g., 09:00 - 10:30, or null",
      "day": "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun" | null,
      "notes": "Relevant details, context, or tips"
    }
  ]
}

Ensure priorities are strictly assessed:
- "urgent": Deadlines today, immediate submissions, exam prep, critical forms.
- "high": Major project deliverables, high-impact study blocks.
- "medium": Standard homework, gym, weekly routines.
- "low": Casual errands, non-urgent shopping, leisure reading.
`;

export async function POST(req: NextRequest) {
  try {
    const { text, userTone } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
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

    const prompt = `${SYSTEM_PROMPT}\n\nUSER'S PREFERRED ASSISTANT TONE: ${userTone || 'Calm & Direct'}\n\nUSER'S RAW THOUGHT DUMP:\n"""${text.trim()}"""`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.2,
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
    const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawContent) {
      return NextResponse.json({ error: 'Empty response from Gemini' }, { status: 500 });
    }

    const parsed = JSON.parse(rawContent);
    return NextResponse.json(parsed);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown AI processing error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
