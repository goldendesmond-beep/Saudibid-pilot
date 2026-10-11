interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-[#1e2530] ${className}`}
      aria-hidden="true"
    />
  );
}
