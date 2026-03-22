import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Claude Skills Directory',
    template: '%s | Claude Skills Directory',
  },
  description:
    'Discover, share, and vote on the best Claude Opus skills, prompts, and agents. A community-curated directory for AI practitioners.',
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-background antialiased">{children}</body>
    </html>
  );
}
