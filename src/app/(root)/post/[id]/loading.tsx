import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PostLoading() {
  return (
    <div className="container max-w-4xl py-8 px-4 sm:px-8 space-y-6">
      <Skeleton className="h-8 w-32" />

      {/* Main Post Card Skeleton */}
      <Card className="border-border">
        <CardHeader className="p-5 sm:p-6 pb-4 space-y-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-7 w-3/4" />
        </CardHeader>
        <CardContent className="p-5 sm:p-6 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardContent>
      </Card>

      {/* Comments Skeleton */}
      <Card className="border-border">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-20 w-full rounded-md" />
          <div className="space-y-3 pt-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-3 w-3/4 ml-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
