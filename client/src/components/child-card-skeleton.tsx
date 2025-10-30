import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ChildCardSkeleton() {
  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center space-x-4 mb-4">
          {/* Avatar skeleton */}
          <div className="relative">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full" />
          </div>
          
          {/* Name and stats skeleton */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
          
          {/* Value skeleton */}
          <div className="text-right space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        
        {/* Buttons skeleton */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-full rounded-[5px]" />
          <Skeleton className="h-7 w-full rounded-[5px]" />
        </div>
      </CardContent>
    </Card>
  );
}
