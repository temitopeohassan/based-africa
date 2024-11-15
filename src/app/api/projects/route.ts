import { NextRequest, NextResponse } from 'next/server';
import { getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NEXT_PUBLIC_URL } from '../../config';
import projects from '../../projects.json';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { untrustedData } = body;
    const buttonIndex = untrustedData?.buttonIndex || 0;

    // If Home button is clicked (button index 4)
    if (buttonIndex === 4) {
      return new NextResponse(
        getFrameHtmlResponse({
          buttons: [
            {
              label: 'View Projects',
              action: 'post',
              postUrl: `${NEXT_PUBLIC_URL}/api/projects`,
            },
            {
              label: 'View Winners',
              action: 'post',
              postUrl: `${NEXT_PUBLIC_URL}/api/winners`,
            },
          ],
          image: `${NEXT_PUBLIC_URL}/buildathon.png`,
          post_url: `${NEXT_PUBLIC_URL}/api/projects`,
        })
      );
    }

    let state;
    try {
      state = untrustedData?.state ? JSON.parse(untrustedData.state) : { index: -1 };
    } catch (error) {
      state = { index: -1 };
    }

    let currentIndex = state.index;
    
    // Modified navigation logic
    if (buttonIndex === 2) { // Next
      currentIndex = Math.min(projects.length - 1, currentIndex + 1);
    } else if (buttonIndex === 1) { // Previous
      currentIndex = Math.max(0, currentIndex - 1);
    } else if (currentIndex === -1) { // Initial state
      currentIndex = 0;
    }

    const currentProject = projects[currentIndex];
    if (!currentProject) {
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
        image: `${NEXT_PUBLIC_URL}/${currentProject.image}`,
        post_url: `${NEXT_PUBLIC_URL}/api/projects`,
        state: { index: currentIndex },
      })
    );

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Unexpected error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}