import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SITE_NAME } from '@/lib/constants';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">{SITE_NAME}</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/browse" className="text-muted-foreground hover:text-foreground transition-colors">
            Browse
          </Link>
          <Link
            href="/submit"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
          >
            Submit Skill
          </Link>
        </nav>
      </div>
    </header>
  );
}
