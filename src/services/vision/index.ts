import { VisionProvider, VisionAnalysisInput, VisionAnalysisResponse } from './types';
import { GeminiVisionProvider } from './geminiVisionProvider';
import { OpenAiVisionProvider } from './openAiVisionProvider';
import { AnthropicVisionProvider } from './anthropicVisionProvider';

export class UnconfiguredVisionProvider implements VisionProvider {
  public name = 'No Vision Provider Configured';

  public isConfigured(): boolean {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async analyze(_input: VisionAnalysisInput): Promise<VisionAnalysisResponse> {
    return {
      configured: false,
      providerUsed: this.name,
      summary: "Image understanding isn't configured yet.",
      items: [],
      errorMessage:
        'No vision AI API key found. Add GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY to your .env.local file.',
    };
  }
}

/**
 * Provider Factory: Auto-selects the active Vision AI Provider based on configured environment variables
 */
export function getVisionProvider(): VisionProvider {
  const explicitPreference = (process.env.VISION_PROVIDER || '').toLowerCase().trim();

  const gemini = new GeminiVisionProvider();
  const openai = new OpenAiVisionProvider();
  const anthropic = new AnthropicVisionProvider();

  // 1. Honor explicit preference if configured
  if (explicitPreference === 'gemini' && gemini.isConfigured()) return gemini;
  if (explicitPreference === 'openai' && openai.isConfigured()) return openai;
  if (explicitPreference === 'anthropic' && anthropic.isConfigured()) return anthropic;

  // 2. Default precedence: Gemini -> OpenAI -> Anthropic
  if (gemini.isConfigured()) return gemini;
  if (openai.isConfigured()) return openai;
  if (anthropic.isConfigured()) return anthropic;

  // 3. Fallback to unconfigured provider
  return new UnconfiguredVisionProvider();
}

export * from './types';
export * from './geminiVisionProvider';
export * from './openAiVisionProvider';
export * from './anthropicVisionProvider';
