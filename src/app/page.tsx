import { Metadata } from 'next';
import { NEXT_PUBLIC_URL } from './config';

// Define the metadata for the page
export const metadata: Metadata = {
  title: 'Base Around The World Buildathon Based Latam',
  description: 'Explore winners and projects from the Base Around The World Buildathon Based Latam',
  openGraph: {
    title: 'Base Around The World Buildathon Based Latam',
    description: 'Explore winners and projects from the Base Around The World Buildathon Based Latam',
    images: [`${NEXT_PUBLIC_URL}/buildathon.png`],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': `${NEXT_PUBLIC_URL}/buildathon.png`,
    'fc:frame:button:1': 'View Projects',
    'fc:frame:button:1:action': 'post',
    'fc:frame:post_url': `${NEXT_PUBLIC_URL}/api/projects`,
  },
};

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Base Around The World Buildathon Based Latam</h1>
      <p className="text-lg">Explore the amazing projects and winners from our buildathon!</p>
    </div>
  );
}