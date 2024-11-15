import { NextRequest, NextResponse } from 'next/server';
import { getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NEXT_PUBLIC_URL } from '../../config';
import projects from '../../winners.json';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    console.log('📥 Received request data:', {
      untrustedData,
      buttonIndex: untrustedData?.buttonIndex,
      state: untrustedData?.state
    });

    const buttonIndex = untrustedData?.buttonIndex || 0;
    let state;
    try {
      state = untrustedData?.state ? JSON.parse(untrustedData.state) : { index: -1 };
      console.log('📋 Parsed state:', state);
    } catch (error) {
      console.error('❌ Error parsing state:', error);
      state = { index: -1 };
    }

    // Handle Home button (new button index 4)
    if (buttonIndex === 4) {
      return new NextResponse(
        getFrameHtmlResponse({
          buttons: [
            {
              label: 'Projects',
              action: 'post',
            },
            {
              label: 'Winners',
              action: 'post',
            },
          ],
          image: `${NEXT_PUBLIC_URL}/buildathon.png`,
          post_url: `${NEXT_PUBLIC_URL}/api/projects`,
        })
      );
    }

    let currentIndex = state.index;
    
    // Using the original navigation logic that works correctly
    if (currentIndex === -1 || buttonIndex === 2) {
      currentIndex = Math.min(projects.length - 1, currentIndex + 1);
    } else if (buttonIndex === 1) {
      currentIndex = Math.max(0, currentIndex - 1);
    }

    const currentProject = projects[currentIndex];
    if (!currentProject) {
      console.error('❌ Project not found:', { currentIndex, totalProjects: projects.length });
      return new NextResponse('Project not found', { status: 500 });
    }

    const response = new NextResponse(
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
          {
            label: 'Home',
            action: 'post',
          },
        ],
        image: `${NEXT_PUBLIC_URL}${currentProject.image}`,
        post_url: `${NEXT_PUBLIC_URL}/api/winners`,
        state: { index: currentIndex },
      })
    );

    // Add cache control headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');

    return response;
  } catch (error) {
    console.error('Unexpected error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}