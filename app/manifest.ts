import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RideFlow',
    short_name: 'RideFlow',
    description: 'A Casablanca mobility marketplace demo.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f4f5ef',
    theme_color: '#172b25',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
