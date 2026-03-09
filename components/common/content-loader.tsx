import { cn } from '@/lib/utils';

export function ContentLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center grow w-full gap-2', className)}
    >
      <img
        src="/media/logo/SuperYouBioIcon.gif"
        alt="Loading"
        className="h-12 w-auto"
      />
      <span className="text-muted-foreground font-medium text-sm">
        Loading...
      </span>
    </div>
  );
}
