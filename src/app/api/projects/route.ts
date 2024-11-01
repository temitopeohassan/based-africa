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
      state = untrustedData?.state ? JSON.parse(untrustedData.state) : { index: 0 };
    } catch (error) {
      console.error('Error parsing state:', error);
      state = { index: 0 };
    }

    let currentIndex = state.index;
    console.log('Initial state:', { buttonIndex, currentIndex, totalProjects: projects.length });
    
    // Update navigation logic
    if (buttonIndex === 1) { // Next button
      currentIndex = (currentIndex + 1) % projects.length;
    } else if (buttonIndex === 0) { // Previous button
      currentIndex = currentIndex === 0 ? projects.length - 1 : currentIndex - 1;
    }
    
    console.log('After navigation:', { currentIndex });

    const currentProject = projects[currentIndex];
    if (!currentProject) {
      console.error('Project not found for index:', currentIndex);
      return new NextResponse('Project not found', { status: 500 });
    }

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
        image: `${NEXT_PUBLIC_URL}/api/og?project=${encodeURIComponent(currentProject.name)}&description=${encodeURIComponent(currentProject.description)}&index=${currentIndex + 1}&total=${projects.length}`,
        post_url: `${NEXT_PUBLIC_URL}/api/projects`,
        state: { index: currentIndex },
      })
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export const dynamic = 'force-dynamic';