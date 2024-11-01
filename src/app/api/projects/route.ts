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
  
  // Fix button index logic - buttons are 0-based indexed
  if (currentIndex === -1 || buttonIndex === 1) { // Next button (index 1)
    currentIndex = Math.min(projects.length - 1, currentIndex + 1);
  } else if (buttonIndex === 0) { // Previous button (index 0)
    currentIndex = Math.max(0, currentIndex - 1);
  }

  // Add error handling for project access
  if (currentIndex < 0 || currentIndex >= projects.length) {
    console.error('Invalid project index:', currentIndex);
    currentIndex = 0; // Reset to first project if invalid
  }

  const currentProject = projects[currentIndex];

  // Add null check for currentProject
  if (!currentProject) {
    console.error('Project not found for index:', currentIndex);
    return new NextResponse('Project not found', { status: 500 });
  }

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