import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `
You are the intelligent Brain Dump Organizer and Workload Assistant for "GetDone", a Studio Ghibli-themed personal command center.
Your task is to analyze the user's raw thoughts, voice dictation, or workload notes and extract actionable structured items:
- Tasks (regular action items)
- Deadlines (tasks with specific time commitments or due dates)
- Routines (recurring habits, gym, study habits)
- Reminders (quick calls, check-ins, chores)
- Schedule events (activities with specific days or time slots)

=============================================================================
CRITICAL MULTILINGUAL & HINGLISH UNDERSTANDING RULES:
=============================================================================
1. The user will often type or speak in **Hinglish** (Hindi mixed with English written in Latin/English alphabet), Hindi, or colloquial Indian English.
   Examples of Hinglish you MUST understand:
   - "Kal DBMS assignment submit karna hai 11 baje tak" -> Title: "Submit DBMS Assignment", Deadline: "Tomorrow · 11:00 PM", Priority: "high"
   - "Shaam ko 6 baje gym jana hai chest workout ke liye" -> Title: "Gym Session: Chest Workout", TimeSlot: "18:00 - 19:30", Type: "routine"
   - "Mummy ko call lagana hai raat ko" -> Title: "Call Mom", Type: "reminder", Deadline: "Tonight · 9:00 PM"
   - "Shampoo aur grocery lana hai D-Mart se" -> Title: "Buy shampoo and groceries from D-Mart", Type: "task", Category: "Personal"
   - "Project declaration form portal pe upload karna hai aaj 5 baje se pehle bohot zaroori hai" -> Title: "Upload Project Declaration Form on Portal", Priority: "urgent", Deadline: "Today · 5:00 PM"
   - "Parso Operating Systems ka exam hai revision karna hai" -> Title: "Revise for Operating Systems Exam", Priority: "urgent", Category: "Academics"

2. **OUTPUT LANGUAGE**: Regardless of whether the user wrote or spoke in Hinglish, Hindi, or English, ALL output fields (title, summary, notes, deadline) MUST be written in **clear, elegant, professional ENGLISH**.

3. **TEMPORAL HINGLISH MAPPINGS**:
   - "Aaj" -> Today
   - "Kal" -> Tomorrow (or check context)
   - "Parso" -> In 2 days
   - "Subah" -> Morning (e.g. 09:00 AM)
   - "Dopahar" -> Afternoon (e.g. 02:00 PM)
   - "Shaam" -> Evening (e.g. 06:00 PM)
   - "Raat" -> Night (e.g. 09:00 PM)
   - "X baje" -> At X:00
   - "Zaroori" / "Pakka" / "Khatam karna hai" / "Last date" -> High or Urgent priority

Analyze the user's input and respond ONLY with a valid JSON object matching this exact TypeScript structure:

{
  "summary": "Short 1-2 sentence empathetic overview in English of what needs doing and the recommended focus.",
  "items": [
    {
      "title": "Clear, concise action title in English",
      "type": "task" | "deadline" | "event" | "routine" | "reminder",
      "category": "Academics" | "Projects" | "Personal" | "Health" | "Admin",
      "priority": "urgent" | "high" | "medium" | "low",
      "deadline": "e.g., Today · 5:00 PM, Tomorrow, Thursday, or null",
      "timeSlot": "e.g., 09:00 - 10:30, or null",
      "day": "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun" | null,
      "notes": "Relevant details, translated context, or helpful tips in English"
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

    const prompt = `${SYSTEM_PROMPT}\n\nUSER'S PREFERRED ASSISTANT TONE: ${userTone || 'Calm & Direct'}\n\nUSER'S RAW THOUGHT DUMP (May be Hinglish or English):\n"""${text.trim()}"""`;

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
