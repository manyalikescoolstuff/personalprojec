import {
  VisionProvider,
  VisionAnalysisInput,
  VisionAnalysisResponse,
  VisionRawResponse,
  VISION_SYSTEM_PROMPT,
} from './types';
import { ExtractedBrainItem } from '@/types';

export class AnthropicVisionProvider implements VisionProvider {
  public name = 'Anthropic Claude Vision (claude-3-5-sonnet)';

  public isConfigured(): boolean {
    const key = process.env.ANTHROPIC_API_KEY;
    return !!key && key.trim().length > 0;
  }

  public async analyze(input: VisionAnalysisInput): Promise<VisionAnalysisResponse> {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return {
        configured: false,
        providerUsed: this.name,
        summary: "Image understanding isn't configured yet.",
        items: [],
        errorMessage: 'ANTHROPIC_API_KEY is not set in environment variables.',
      };
    }

    try {
      const content: Array<
        | { type: 'text'; text: string }
        | {
            type: 'image';
            source: { type: 'base64'; media_type: string; data: string };
          }
      > = [];

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

        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: mimeType,
            data: cleanBase64,
          },
        });
      });

      let userText = 'Analyze this image and respond with ONLY valid JSON.';
      if (input.userContextText && input.userContextText.trim()) {
        userText += `\n\nUser Context Notes:\n"${input.userContextText.trim()}"`;
      }
      content.push({ type: 'text', text: userText });

      const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          system: VISION_SYSTEM_PROMPT,
          messages: [{ role: 'user', content }],
          max_tokens: 2048,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          configured: true,
          providerUsed: this.name,
          summary: 'Claude Vision API returned an error.',
          items: [],
          errorMessage: `Anthropic API returned status ${response.status}: ${errorText}`,
        };
      }

      const data = await response.json();
      const rawText = data?.content?.[0]?.text;

      if (!rawText) {
        return {
          configured: true,
          providerUsed: this.name,
          summary: 'Empty response from Claude Vision.',
          items: [],
          errorMessage: 'No content received from model.',
        };
      }

      // Extract JSON if wrapped in markdown code blocks
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, rawText];
      const jsonString = jsonMatch[1] || rawText;

      const parsed: VisionRawResponse = JSON.parse(jsonString.trim());

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
        errorMessage: `Claude Vision processing error: ${errorMsg}`,
      };
    }
  }
}
