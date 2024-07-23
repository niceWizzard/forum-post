import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingPage() {
  return (
    <section className="size-full ">
      <div className="container p-6 flex flex-col gap-3">
        <Skeleton className="w-48 h-12 mb-12" />
        <Skeleton className="w-full h-24" />
        <Skeleton className="w-full h-24" />
        <Skeleton className="w-full h-24" />
        <Skeleton className="w-full h-24" />
        <Skeleton className="w-full h-24" />
      </div>
    </section>
  );
}
