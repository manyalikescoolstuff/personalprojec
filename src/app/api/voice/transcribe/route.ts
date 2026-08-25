import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { audioData, mimeType } = await req.json();

    if (!audioData) {
      return NextResponse.json({ error: 'No audio data provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    // Clean base64 audio
    let cleanBase64 = audioData;
    let cleanMime = mimeType || 'audio/webm';

    if (audioData.startsWith('data:')) {
      const match = audioData.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        cleanMime = match[1];
        cleanBase64 = match[2];
      } else {
        cleanBase64 = audioData.replace(/^data:[^;]+;base64,/, '');
      }
    }

    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'You are an accurate, fast voice-to-text transcriber for a task management app. Accurately transcribe the spoken words in this audio recording word-for-word into English text. Return ONLY the transcribed text without extra markdown, tags, or conversational fluff.',
              },
              {
                inline_data: {
                  mime_type: cleanMime,
                  data: cleanBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { error: `Gemini transcription error: ${err}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const transcript = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    return NextResponse.json({ transcript });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown transcription error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
