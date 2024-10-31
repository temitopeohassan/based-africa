import { NextRequest, NextResponse } from 'next/server';
import { getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NEXT_PUBLIC_URL } from '../../config';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const searchParams = req.nextUrl.searchParams;
  const operation = searchParams.get('operation');

  let body;
  try {
    body = await req.json();
  } catch (error) {
    return new NextResponse('Invalid request', { status: 400 });
  }

  const { untrustedData } = body;
  const { inputText } = untrustedData;

  const [num1, num2] = inputText.split(',').map(Number);

  if (isNaN(num1) || isNaN(num2)) {
    return new NextResponse(
      getFrameHtmlResponse({
        buttons: [
          {
            label: 'Try Again',
            action: 'post',
          },
        ],
        image: `${NEXT_PUBLIC_URL}/error.png`,
        post_url: `${NEXT_PUBLIC_URL}/api/frame`, // This can remain as is for error handling
      })
    );
  }

  let result;
  switch (operation) {
    case 'add': result = num1 + num2; break;
    case 'subtract': result = num1 - num2; break;
    case 'multiply': result = num1 * num2; break;
    case 'divide': result = num2 !== 0 ? num1 / num2 : 'Error: Division by zero'; break;
    default: result = 'Invalid operation';
  }

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          label: 'Calculate Again',
          action: 'post',
          // Redirect to the main page
          postUrl: `${NEXT_PUBLIC_URL}/`,
        },
      ],
      image: `${NEXT_PUBLIC_URL}/api/og?result=${encodeURIComponent(result)}`,
    })
  );
}

export const dynamic = 'force-dynamic';
