import { cn } from '@/lib/utils';

export type AdSize = 'leaderboard' | 'medium-rectangle' | 'mobile' | 'sidebar' | 'in-article';

interface AdSlotProps {
  className?: string;
  slot?: string;
  size?: AdSize;
}

const SIZE_STYLES: Record<AdSize, { width: string; height: string }> = {
  leaderboard: { width: '728px', height: '90px' },
  'medium-rectangle': { width: '300px', height: '250px' },
  mobile: { width: '320px', height: '100px' },
  sidebar: { width: '300px', height: '250px' },
  'in-article': { width: '100%', height: '120px' },
};

export function AdSlot({ className = '', slot = 'default', size = 'sidebar' }: AdSlotProps) {
  // TODO: Replace with real GDN ad code (Google AdSense, Carbon Ads, etc.) once approved
  // The data-ad-slot attributes are ready for GDN targeting

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg border border-dashed bg-muted/50 text-center text-sm text-muted-foreground overflow-hidden',
        className
      )}
      data-ad-slot={slot}
      data-ad-size={size}
      style={{
        maxWidth: '100%',
        width: SIZE_STYLES[size].width,
        height: SIZE_STYLES[size].height,
      }}
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs uppercase tracking-wider opacity-60">Advertisement</span>
        <span className="text-[10px] opacity-40">
          {SIZE_STYLES[size].width} x {SIZE_STYLES[size].height}
        </span>
      </div>
    </div>
  );
}
