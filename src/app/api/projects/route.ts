import { NextRequest, NextResponse } from 'next/server';
import { getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NEXT_PUBLIC_URL } from '../../config';
import projects from '../../projects.json';

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body;
  try {
    body = await req.json();
  } catch (error) {
    return new NextResponse('Invalid request', { status: 400 });
  }

  const { untrustedData } = body;
  const buttonIndex = untrustedData?.buttonIndex || 0;
  const state = untrustedData?.state ? JSON.parse(untrustedData.state) : { index: -1 };

  let currentIndex = state.index;
  
  // If it's the initial state or Next is clicked, move to next project
  if (currentIndex === -1 || buttonIndex === 2) {
    currentIndex = Math.min(projects.length - 1, currentIndex + 1);
  } else if (buttonIndex === 1) { // Previous
    currentIndex = Math.max(0, currentIndex - 1);
  }

  const currentProject = projects[currentIndex];

  // Create the image URL with proper encoding
  const imageUrl = new URL(`${NEXT_PUBLIC_URL}/api/og`);
  imageUrl.searchParams.append('project', currentProject.name);
  imageUrl.searchParams.append('description', currentProject.description);
  imageUrl.searchParams.append('index', (currentIndex + 1).toString());
  imageUrl.searchParams.append('total', projects.length.toString());

  // Log the generated URL for debugging
  console.log('Generated image URL:', imageUrl.toString());

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
        {
          label: 'View Project',
          action: 'link',
          target: currentProject.link,
        },
      ],
      image: imageUrl.toString(),
      post_url: `${NEXT_PUBLIC_URL}/api/projects`,
      state: { index: currentIndex },
    })
  );
}

export const dynamic = 'force-dynamic';