import {
  VisionProvider,
  VisionAnalysisInput,
  VisionAnalysisResponse,
  VisionRawResponse,
  VISION_SYSTEM_PROMPT,
} from './types';
import { ExtractedBrainItem } from '@/types';

export class OpenAiVisionProvider implements VisionProvider {
  public name = 'OpenAI Vision (gpt-4o-mini)';

  public isConfigured(): boolean {
    const key = process.env.OPENAI_API_KEY;
    return !!key && key.trim().length > 0;
  }

  public async analyze(input: VisionAnalysisInput): Promise<VisionAnalysisResponse> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return {
        configured: false,
        providerUsed: this.name,
        summary: "Image understanding isn't configured yet.",
        items: [],
        errorMessage: 'OPENAI_API_KEY is not set in environment variables.',
      };
    }

    try {
      const userContent: Array<
        { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }
      > = [];

      let userText = 'Please analyze the attached image(s) according to system instructions.';
      if (input.userContextText && input.userContextText.trim()) {
        userText += `\n\nUser Context & Notes:\n"${input.userContextText.trim()}"`;
      }
      userContent.push({ type: 'text', text: userText });

      input.images.forEach((img) => {
        let imageUrl = img.data;
        if (!imageUrl.startsWith('data:')) {
          const mime = img.mimeType || 'image/png';
          imageUrl = `data:${mime};base64,${img.data}`;
        }
        userContent.push({
          type: 'image_url',
          image_url: { url: imageUrl },
        });
      });

      const model = process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini';
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: VISION_SYSTEM_PROMPT },
            { role: 'user', content: userContent },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          configured: true,
          providerUsed: this.name,
          summary: 'OpenAI Vision API returned an error.',
          items: [],
          errorMessage: `OpenAI API returned status ${response.status}: ${errorText}`,
        };
      }

      const data = await response.json();
      const rawText = data?.choices?.[0]?.message?.content;

      if (!rawText) {
        return {
          configured: true,
          providerUsed: this.name,
          summary: 'Empty response from OpenAI Vision.',
          items: [],
          errorMessage: 'No content received from model.',
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
        summary: 'Vision analysis error.',
        items: [],
        errorMessage: `OpenAI Vision processing error: ${errorMsg}`,
      };
    }
  }
}
