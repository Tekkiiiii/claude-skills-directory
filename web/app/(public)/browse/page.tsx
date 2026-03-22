import type { Metadata } from 'next';
import { BrowsePageClient } from './browse-client';

export const metadata: Metadata = {
  title: 'Browse Skills',
  description: 'Browse and filter all Claude Opus skills, prompts, and agents by category, source, and popularity.',
};

export default function BrowsePage() {
  return <BrowsePageClient />;
}
