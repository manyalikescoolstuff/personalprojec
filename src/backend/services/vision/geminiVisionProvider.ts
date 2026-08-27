import {
  VisionProvider,
  VisionAnalysisInput,
  VisionAnalysisResponse,
  VisionRawResponse,
  VISION_SYSTEM_PROMPT,
} from './types';
import { ExtractedBrainItem } from '@/types';

export class GeminiVisionProvider implements VisionProvider {
  public name = 'Google Gemini Vision (gemini-2.0-flash)';

  public isConfigured(): boolean {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
    return !!key && key.trim().length > 0;
  }

  public async analyze(input: VisionAnalysisInput): Promise<VisionAnalysisResponse> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey) {
      return {
        configured: false,
        providerUsed: this.name,
        summary: "Image understanding isn't configured yet.",
        items: [],
        errorMessage: 'GEMINI_API_KEY is not set in environment variables.',
      };
    }

    try {
      const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> = [];

      // 1. System Prompt & User Context
      let promptText = VISION_SYSTEM_PROMPT;
      if (input.userContextText && input.userContextText.trim()) {
        promptText += `\n\nUSER'S ACCOMPANYING INTENT & NOTES:\n"${input.userContextText.trim()}"`;
      }
      parts.push({ text: promptText });

      // 2. Attached Images
      input.images.forEach((img) => {
        let cleanBase64 = img.data;
        let mimeType = img.mimeType || 'image/png';

        if (img.data.startsWith('data:')) {
          const match = img.data.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
          if (match) {
            mimeType = match[1];
            cleanBase64 = match[2];
          } else {
            cleanBase64 = img.data.replace(/^data:[^;]+;base64,/, '');
          }
        }

        parts.push({
          inline_data: {
            mime_type: mimeType,
            data: cleanBase64,
          },
        });
      });

      // 3. Call Gemini REST API
      const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts,
            },
          ],
          generationConfig: {
            response_mime_type: 'application/json',
            temperature: 0.1,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          configured: true,
          providerUsed: this.name,
          summary: 'Vision analysis encountered an API error.',
          items: [],
          errorMessage: `Gemini API returned status ${response.status}: ${errorText}`,
        };
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        return {
          configured: true,
          providerUsed: this.name,
          summary: 'No response content returned from vision model.',
          items: [],
          errorMessage: 'Empty response from Gemini Vision.',
        };
      }

      const parsed: VisionRawResponse = JSON.parse(rawText);

      const items: ExtractedBrainItem[] = (parsed.items || []).map((rawItem, idx) => ({
        id: `ext-vision-${Date.now()}-${idx}`,
        title: rawItem.title || 'Untitled Action Item',
        type: rawItem.type || 'task',
        category: rawItem.category || 'Personal',
        priority: rawItem.priority || 'medium',
        deadline: rawItem.deadline || undefined,
        timeSlot: rawItem.timeSlot || undefined,
        day: rawItem.day || undefined,
        notes: rawItem.notes || undefined,
        location: rawItem.location || undefined,
        people: rawItem.people || undefined,
        dependencies: rawItem.dependencies || undefined,
        confidence: rawItem.confidence ?? parsed.confidenceOverall ?? 0.9,
        needsClarification: rawItem.needsClarification ?? parsed.unclearOrAmbiguous ?? false,
        clarificationNote: rawItem.clarificationNote || parsed.clarificationReason || undefined,
        sourceType: 'image',
        sourceLabel: input.images[0]?.name || 'Screenshot',
        selected: true,
      }));

      return {
        configured: true,
        providerUsed: this.name,
        summary: parsed.summary || `Extracted ${items.length} items from image.`,
        items,
        confidence: parsed.confidenceOverall ?? 0.95,
        needsClarification: parsed.unclearOrAmbiguous ?? false,
        clarificationNote: parsed.clarificationReason || undefined,
        rawResponse: rawText,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        configured: true,
        providerUsed: this.name,
        summary: 'Vision analysis failed to parse response.',
        items: [],
        errorMessage: `Vision processing error: ${errorMsg}`,
      };
    }
  }
}
