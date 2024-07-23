import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  return (
    <section className="w-full container px-4">
      <div className="pt-12 pb-6 overflow-hidden break-words whitespace-normal space-y-6">
        <div className=" gap-6 flex flex-col ">
          <div className="row-span-2 flex gap-4 items-center flex-col">
            <div className="flex gap-2 w-full">
              <Skeleton className="h-12 flex-grow" />
              <Skeleton className="h-12 min-w-12 " />
            </div>
            <Skeleton className="w-full h-24" />
          </div>
        </div>
        <div className="flex flex-col w-full gap-3 *:h-32 *:w-full mt-24">
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      </div>
    </section>
  );
}
