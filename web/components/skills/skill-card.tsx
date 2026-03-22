import Link from 'next/link';
import type { Skill } from '@/lib/types';
import { SOURCE_LABELS } from '@/lib/constants';

export function SkillCard({ skill }: { skill: Skill }) {
  const score = skill.votes_up - skill.votes_down;

  return (
    <Link href={`/skill/${skill.slug}`}>
      <article className="group rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold group-hover:text-primary transition-colors">
              {skill.name}
            </h3>
            {skill.short_description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {skill.short_description}
              </p>
            )}
          </div>
          <div className="flex flex-col items-center rounded-md bg-muted px-2 py-1 text-sm">
            <span className={`font-bold ${score >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {score >= 0 ? '+' : ''}{score}
            </span>
            <span className="text-xs text-muted-foreground">votes</span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {skill.category && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {skill.category.name}
            </span>
          )}
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {SOURCE_LABELS[skill.source_type] || skill.source_type}
          </span>
          {skill.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs text-muted-foreground">
              #{tag}
            </span>
          ))}
        </div>

        {skill.github_url && (
          <div className="mt-3 text-xs text-muted-foreground">
            <span className="font-mono">{new URL(skill.github_url).pathname}</span>
          </div>
        )}
      </article>
    </Link>
  );
}
