import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'livo - AI-Powered Personal Knowledge Management',
  description: 'AI-powered personal knowledge management application inspired by Evernote and Notion.',
  openGraph: {
    title: 'livo - AI-Powered Personal Knowledge Management',
    description: 'AI-powered personal knowledge management application inspired by Evernote and Notion.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'livo - AI-Powered Personal Knowledge Management',
    description: 'AI-powered personal knowledge management application inspired by Evernote and Notion.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
