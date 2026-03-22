'use client';

import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useVote } from '@/hooks/use-vote';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

export function SkillVote({
  skillId,
  initialVotesUp = 0,
  initialVotesDown = 0,
}: {
  skillId: string;
  initialVotesUp?: number;
  initialVotesDown?: number;
}) {
  const { votesUp, votesDown, score, myVote, submitVote, loading } = useVote(
    skillId,
    initialVotesUp,
    initialVotesDown
  );

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => submitVote(1)}
              disabled={loading}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                myVote === 1
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-muted hover:bg-muted/80'
              } disabled:opacity-50 touch-manipulation min-h-[36px]`}
              aria-label="Upvote this skill"
            >
              <ThumbsUp className="h-4 w-4" />
              <span className="min-w-[1ch] text-center">{votesUp}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{myVote === 1 ? 'Remove upvote' : 'Upvote this skill'}</p>
          </TooltipContent>
        </Tooltip>

        <span
          className={`min-w-[3ch] text-center text-base font-bold ${
            score > 0 ? 'text-green-600' : score < 0 ? 'text-red-500' : 'text-muted-foreground'
          }`}
        >
          {score > 0 ? '+' : ''}
          {score}
        </span>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => submitVote(-1)}
              disabled={loading}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                myVote === -1
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-muted hover:bg-muted/80'
              } disabled:opacity-50 touch-manipulation min-h-[36px]`}
              aria-label="Downvote this skill"
            >
              <ThumbsDown className="h-4 w-4" />
              <span className="min-w-[1ch] text-center">{votesDown}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{myVote === -1 ? 'Remove downvote' : 'Downvote this skill'}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
