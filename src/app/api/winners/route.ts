import { NextRequest, NextResponse } from 'next/server';
import { getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NEXT_PUBLIC_URL } from '../../config';
import winners from '../../winners.json';

interface Winner {
  image: string;
  name: string;
  link: string;
  description: string;
  author: string;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { untrustedData } = body;
    const buttonIndex = untrustedData?.buttonIndex || 0;

    // Check if this is the initial load (no button pressed)
    const isInitialLoad = !buttonIndex;

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

    // Parse state with better error handling and logging
    let currentIndex = 0; // Default to first record
    try {
      if (!isInitialLoad && untrustedData?.state) {
        const stateData = JSON.parse(untrustedData.state);
        currentIndex = typeof stateData.index === 'number' ? stateData.index : 0;
      }
      console.log('Initial index from state:', currentIndex, 'Initial load:', isInitialLoad);
    } catch (error) {
      console.error('Error parsing state:', error);
      currentIndex = 0;
    }

    // Handle navigation with circular iteration
    if (buttonIndex === 2) { // Next
      currentIndex = (currentIndex + 1) % winners.length;
      console.log('Next clicked. New index:', currentIndex);
    } else if (buttonIndex === 1) { // Previous
      currentIndex = (currentIndex - 1 + winners.length) % winners.length;
      console.log('Previous clicked. New index:', currentIndex);
    }

    // Ensure index is within bounds
    currentIndex = Math.max(0, Math.min(currentIndex, winners.length - 1));

    console.log('Current index:', currentIndex, 'Total projects:', winners.length);

    const currentProject = winners[currentIndex] as Winner;
    if (!currentProject) {
      console.error('Project not found for index:', currentIndex);
      return new NextResponse('Project not found', { status: 500 });
    }

    // Construct the full image URL
    const imageUrl = `${NEXT_PUBLIC_URL}/${currentProject.image}`;
    console.log('Loading image:', imageUrl);

    // Log the current project for debugging
    console.log('Current project:', {
      index: currentIndex,
      name: currentProject.name,
      image: imageUrl
    });

    const response = new NextResponse(
      getFrameHtmlResponse({
        buttons: [
          {
            label: `Previous (${currentIndex + 1}/${winners.length})`,
            action: 'post',
          },
          {
            label: `Next (${currentIndex + 1}/${winners.length})`,
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
        image: imageUrl,
        post_url: `${NEXT_PUBLIC_URL}/api/winners`,
        state: { index: currentIndex },
      })
    );

    // Set cache control headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Unexpected error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}