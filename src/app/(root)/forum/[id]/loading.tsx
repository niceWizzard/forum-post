import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ForumLoading() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Forum Header Skeleton */}
      <div className="border-b border-border bg-card/60 py-8 px-4 sm:px-8">
        <div className="container max-w-5xl px-0 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      {/* Forum Posts Skeleton */}
      <div className="container max-w-5xl py-8 px-4 sm:px-8 space-y-6 flex-1">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>

        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-3 pt-1">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
