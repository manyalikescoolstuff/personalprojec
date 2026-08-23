import { NextRequest, NextResponse } from 'next/server';
import { getVisionProvider, VisionAnalysisInput } from '@/services/vision';

export async function POST(req: NextRequest) {
  try {
    const body: VisionAnalysisInput = await req.json();

    if (!body.images || body.images.length === 0) {
      return NextResponse.json(
        {
          configured: true,
          providerUsed: 'Validation',
          summary: 'No images provided for vision analysis.',
          items: [],
          errorMessage: 'Missing images in request body.',
        },
        { status: 400 }
      );
    }

    const provider = getVisionProvider();
    const result = await provider.analyze(body);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        configured: false,
        providerUsed: 'Server Route',
        summary: 'Vision analysis encountered an unexpected server error.',
        items: [],
        errorMessage: errorMsg,
      },
      { status: 500 }
    );
  }
}
