import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'livo — Self-Hosted AI Knowledge Platform',
  description:
    'A self-hosted AI knowledge platform for people who want their knowledge, AI, and infrastructure under their control.',
  openGraph: {
    title: 'livo — Self-Hosted AI Knowledge Platform',
    description:
      'A self-hosted AI knowledge platform for people who want their knowledge, AI, and infrastructure under their control.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'livo — Self-Hosted AI Knowledge Platform',
    description:
      'A self-hosted AI knowledge platform for people who want their knowledge, AI, and infrastructure under their control.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

