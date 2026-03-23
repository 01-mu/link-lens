import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LinkLens',
  description: 'A small URL metadata viewer built with Next.js and Hono.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
