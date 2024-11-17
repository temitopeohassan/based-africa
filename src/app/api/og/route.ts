import { NextRequest, NextResponse } from 'next/server';
import { createCanvas, loadImage } from 'canvas';
import path from 'path';
import fs from 'fs';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const searchParams = req.nextUrl.searchParams;
  const project = searchParams.get('project');
  const description = searchParams.get('description');
  const index = searchParams.get('index');
  const total = searchParams.get('total');

  if (!project) {
    return new NextResponse('Project parameter is required', { status: 400 });
  }

  const imagePath = path.join(process.cwd(), 'public', 'buildathon-og.png');
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Arial.ttf');

  try {
    if (!fs.existsSync(imagePath) || !fs.existsSync(fontPath)) {
      throw new Error('Required files not found');
    }

    const canvas = createCanvas(1200, 630);
    const ctx = canvas.getContext('2d');

    const background = await loadImage(imagePath);
    ctx.drawImage(background, 0, 0, 1200, 630);

    ctx.font = '50px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(`Project ${index}/${total}`, 100, 150);
    ctx.fillText(decodeURIComponent(project).toUpperCase(), 100, 200);
    if (description) {
      ctx.fillText(decodeURIComponent(description), 100, 350);
    }

    const buffer = canvas.toBuffer('image/png');
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'max-age=10',
      },
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return new NextResponse('Error generating image', { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
