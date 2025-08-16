import { Skeleton } from "../ui/skeleton";

export const ConditionsScoreSkeleton = () => {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="w-full rounded-lg h-4" />
      <Skeleton className="w-full rounded-lg h-8" />
    </div>
  );
};
