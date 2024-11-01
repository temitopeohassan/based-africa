import { NextRequest, NextResponse } from 'next/server';
import { getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NEXT_PUBLIC_URL } from '../../config';
import projects from '../../projects.json';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new NextResponse('Invalid request body', { status: 400 });
    }

    const { untrustedData } = body;
    console.log('Received untrustedData:', untrustedData);

    const buttonIndex = untrustedData?.buttonIndex || 0;
    let state;
    try {
      state = untrustedData?.state ? JSON.parse(untrustedData.state) : { index: -1 };
    } catch (error) {
      console.error('Error parsing state:', error);
      state = { index: -1 };
    }

    let currentIndex = state.index;
    
    // Log current state
    console.log('Current state:', { buttonIndex, currentIndex, projectsLength: projects.length });

    if (currentIndex === -1 || buttonIndex === 1) {
      currentIndex = Math.min(projects.length - 1, currentIndex + 1);
    } else if (buttonIndex === 0) {
      currentIndex = Math.max(0, currentIndex - 1);
    }

    // Ensure currentIndex is within bounds
    currentIndex = Math.max(0, Math.min(projects.length - 1, currentIndex));

    const currentProject = projects[currentIndex];
    if (!currentProject) {
      console.error('Project not found for index:', currentIndex);
      return new NextResponse('Project not found', { status: 500 });
    }

    const imageUrl = new URL(`${NEXT_PUBLIC_URL}/api/og`);
    imageUrl.searchParams.append('project', currentProject.name);
    imageUrl.searchParams.append('description', currentProject.description);
    imageUrl.searchParams.append('index', (currentIndex + 1).toString());
    imageUrl.searchParams.append('total', projects.length.toString());

    console.log('Generated image URL:', imageUrl.toString());

    const frameResponse = getFrameHtmlResponse({
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
    });

    return new NextResponse(frameResponse);
  } catch (error) {
    console.error('Unexpected error in projects route:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export const dynamic = 'force-dynamic';