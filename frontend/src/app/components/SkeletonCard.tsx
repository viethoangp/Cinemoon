/**
 * SkeletonCard - Loading state placeholder for movie cards
 * Matches MovieCard dimensions and layout
 */
export const SkeletonCard = () => {
  return (
    <div className="group bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden">
      {/* Poster skeleton */}
      <div className="relative h-64 overflow-hidden bg-[#2A2A2A] animate-pulse" />

      {/* Info skeleton */}
      <div className="p-4">
        {/* Title skeleton */}
        <div className="h-4 bg-[#2A2A2A] rounded mb-2 animate-pulse" />

        {/* Genre skeleton */}
        <div className="h-3 bg-[#2A2A2A] rounded mb-3 w-3/4 animate-pulse" />

        {/* Footer skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-3 bg-[#2A2A2A] rounded w-1/3 animate-pulse" />
          <div className="h-8 bg-[#2A2A2A] rounded w-16 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
