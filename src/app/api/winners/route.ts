import { NextRequest, NextResponse } from 'next/server';
import { getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NEXT_PUBLIC_URL } from '../../config';
import winners from '../../winners.json';

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body;
  try {
    body = await req.json();
  } catch (error) {
    return new NextResponse('Invalid request', { status: 400 });
  }

  const { untrustedData } = body;
  const buttonIndex = untrustedData?.buttonIndex || 0;
  const state = untrustedData?.state ? JSON.parse(untrustedData.state) : { index: 0 };

  let currentIndex = state.index || 0;

  // Handle navigation
  if (buttonIndex === 1) { // Previous
    currentIndex = Math.max(0, currentIndex - 1);
  } else if (buttonIndex === 2) { // Next
    currentIndex = Math.min(winners.length - 1, currentIndex + 1);
  }

  const currentProject = winners[currentIndex];

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          label: 'Previous',
          action: 'post',
        },
        {
          label: 'Next',
          action: 'post',
        },
      ],
      image: `${NEXT_PUBLIC_URL}/api/og?project=${encodeURIComponent(currentProject.name)}&index=${currentIndex + 1}&total=${winners.length}`,
      post_url: `${NEXT_PUBLIC_URL}/api/winners`,
      state: { index: currentIndex },
    })
  );
}

export const dynamic = 'force-dynamic';