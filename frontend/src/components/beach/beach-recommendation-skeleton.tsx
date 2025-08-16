import { Skeleton } from "../ui/skeleton";

export const BeachRecommendationSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="w-full h-10 rounded-lg" />
      <Skeleton className="w-full h-10 rounded-lg" />
      <Skeleton className="w-full h-10 rounded-lg" />
      <Skeleton className="w-full h-10 rounded-lg" />
    </div>
  );
};
