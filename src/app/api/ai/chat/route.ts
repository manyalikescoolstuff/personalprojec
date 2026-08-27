import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, tasks, schedule, tone, profile } = await req.json();

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

    const coursesContext = (profile?.courses || [])
      .map((c: { code: string; name: string; professor?: string; notes?: string }) => 
        `- ${c.code}: ${c.name}${c.professor ? ` (Faculty: ${c.professor})` : ''}${c.notes ? ` [Topics: ${c.notes}]` : ''}`
      )
      .join('\n');

    const contextSummary = `
You are Totoro, the wise, calming, and highly productive forest companion AI in "GetDone".
Your personality:
- Tone: ${tone || 'Warm, reassuring, practical, and direct'}.
- You give crystal-clear, focused advice without fluff or overwhelm.
- You reference Studio Ghibli nature metaphors lightly (sprouts, leaves, acorns, forest breeze).

USER'S PERSONAL & ACADEMIC MEMORY (TOTORO'S LIBRARY):
- User Name: ${profile?.name || 'Manya'} (${profile?.roleTitle || 'CS Undergrad'})
- University & Degree: ${profile?.university || 'Institute of Technology'} · ${profile?.degree || 'B.Tech'} in ${profile?.major || 'Computer Science'} (${profile?.semester || 'Sem 5'})
- Peak Focus Window: ${profile?.peakFocusWindow || 'Night Owl'}
- Preferred Learning Style: ${profile?.learningStyle || 'Step-by-step Bullet Points'}
- Registered Courses:
${coursesContext || 'No courses registered yet'}
- Personal Goals & Side Projects: ${profile?.primaryGoal || ''} ${profile?.sideProjects ? `| Projects: ${profile?.sideProjects}` : ''}
- Starter Friction / Burnout Triggers: ${profile?.burnoutTriggers || 'None specified'}

MULTILINGUAL & HINGLISH UNDERSTANDING:
- The user may ask questions or speak in **Hinglish** (e.g. "Bhai bohot stress ho raha hai kya karoon pehle?", "DBMS assignment kaise khatam karein?", "Mera kal ka plan set kardo").
- Fully understand the emotion, deadlines, and requirements in Hinglish/Hindi, and reply in **clear, reassuring, practical English** (or empathetic Hinglish-friendly phrasing if helpful).
- If breaking down tasks, provide bullet points with estimated times tailored to their registered courses.

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

Please respond with practical, supportive advice in English using the library memory when relevant.
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
