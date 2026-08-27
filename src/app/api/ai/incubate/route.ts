import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `
You are the Creative Idea Incubator & Enhancer AI inside "GetDone", a Studio Ghibli-inspired command center.
Your role is to take raw, messy, or spontaneous creative thoughts, startup concepts, hackathon projects, academic research ideas, or side-hustles and turn them into deeply structured, actionable blueprints.

=============================================================================
CRITICAL MULTILINGUAL & HINGLISH UNDERSTANDING RULES:
=============================================================================
1. The user will often type or speak in **Hinglish** (Hindi mixed with English), Hindi, or colloquial Indian English.
   Examples of Hinglish you MUST understand:
   - "Ek AI agent banana hai jo DBMS queries optimize kare aur explain kare"
   - "Mera idea hai ki college students ke liye peer-to-peer book exchange app banayein"
   - "Mujhe ek personal portfolio website banani hai with Ghibli animations and interactive 3D elements"
   - "Ek automated expense tracker jo SMS aur UPI receipts parse kare"

2. **OUTPUT LANGUAGE**: Regardless of whether the user wrote in Hinglish, Hindi, or English, ALL output fields (title, summaries, features, tasks, tips) MUST be written in **clear, elegant, professional ENGLISH**.

3. **OUTPUT JSON STRUCTURE**:
Respond ONLY with a valid JSON object matching this exact TypeScript structure:

{
  "title": "Inspiring & Catchy Project Title in English",
  "category": "Tech & Code" | "College & Academic" | "Creative & Design" | "Startup & Business" | "Writing & Content" | "Personal Experiment",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"],
  "blueprint": {
    "conceptSummary": "Clear 2-3 sentence overview of the idea and its core purpose.",
    "targetAudienceOrValue": "Who this is for and the key benefit or value proposition it provides.",
    "techStackOrTools": [
      "Technology / Framework / Tool 1 (e.g. Next.js 15, TypeScript)",
      "Technology / Tool 2 (e.g. Supabase, PostgreSQL)",
      "Technology / Tool 3 (e.g. TailwindCSS, Framer Motion)",
      "Technology / Tool 4 (e.g. Google Gemini 2.0 Flash API)"
    ],
    "keyFeatures": [
      "Feature 1: Specific creative highlight and mechanism",
      "Feature 2: Differentiator or delight factor",
      "Feature 3: Core functional capability",
      "Feature 4: Advanced or bonus capability"
    ],
    "milestones": [
      {
        "phase": "Phase 1: Architecture & Foundation",
        "title": "Core Setup & Data Modeling",
        "duration": "1 - 2 Days",
        "tasks": [
          "Action item 1 (clear, concrete step)",
          "Action item 2",
          "Action item 3"
        ]
      },
      {
        "phase": "Phase 2: Core Feature Implementation",
        "title": "MVP Logic & API Integration",
        "duration": "3 - 5 Days",
        "tasks": [
          "Action item 1",
          "Action item 2",
          "Action item 3"
        ]
      },
      {
        "phase": "Phase 3: Polish & Deployment",
        "title": "UI Refinement, Testing & Launch",
        "duration": "2 Days",
        "tasks": [
          "Action item 1",
          "Action item 2"
        ]
      }
    ],
    "potentialBottlenecks": [
      "Bottleneck 1: Challenge and recommended solution/workaround",
      "Bottleneck 2: Challenge and recommended mitigation"
    ],
    "totoroProTip": "A warm, wise, highly practical Studio Ghibli-themed tip on how to execute this smoothly without overwhelm."
  }
}

Ensure all milestones contain concrete, bite-sized tasks that can easily be executed or planted into a task tracker.
`;

export async function POST(req: NextRequest) {
  try {
    const { ideaText, category, enhancementMode, userProfile } = await req.json();

    if (!ideaText || !ideaText.trim()) {
      return NextResponse.json({ error: 'No idea text provided' }, { status: 400 });
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

    const profileContext = userProfile
      ? `
USER ACADEMIC & PERSONAL CONTEXT:
- Name: ${userProfile.name || 'Manya'}
- Major/Degree: ${userProfile.major || 'Computer Science'} (${userProfile.semester || 'Semester 5'})
- Learning Style: ${userProfile.learningStyle || 'Hands-on Projects'}
- Primary Goal: ${userProfile.primaryGoal || 'Master DSA and build impactful side projects'}
`
      : '';

    const modePromptMap: Record<string, string> = {
      blueprint: 'Focus on full system architecture, modular design, tech stack selection, and phased milestones.',
      action_plan: 'Focus on rapid step-by-step milestone execution, breakdown of immediate tasks, and estimated timelines.',
      brainstorm: 'Focus on unique differentiators, creative twists, user delight features, and expansion opportunities.',
      pitch_outline: 'Focus on problem-solution framing, value proposition, target user impact, and executive deliverables.',
    };

    const specificModeInstruction = modePromptMap[enhancementMode || 'blueprint'] || modePromptMap.blueprint;

    const userPrompt = `
${SYSTEM_PROMPT}

${profileContext}

SPECIFIC INCUBATION FOCUS:
${specificModeInstruction}

CATEGORY PREFERENCE:
${category || 'Tech & Code'}

USER'S RAW CREATIVE IDEA / DUMP:
"""
${ideaText}
"""

Generate the complete JSON blueprint now.
`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error (Incubator):', errorText);
      return NextResponse.json({ error: 'Failed to incubate idea' }, { status: 500 });
    }

    const data = await response.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawContent) {
      return NextResponse.json({ error: 'No output generated from AI' }, { status: 500 });
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(rawContent);
    } catch {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON response');
      }
    }

    return NextResponse.json({
      success: true,
      result: parsedResult,
    });
  } catch (error) {
    console.error('Idea Incubator Exception:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
