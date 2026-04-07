import { Skeleton } from "@/components/ui/skeleton";

export function LoadingCard() {
  return (
    <div className="flex flex-col gap-2 rounded-xl overflow-hidden">
      <Skeleton className="aspect-[2/3] w-full rounded-xl" />
      <div className="mt-2 space-y-2">
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[60%]" />
      </div>
    </div>
  );
}

export function LoadingGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
}

export function LoadingRow() {
  return (
    <div className="flex gap-4 overflow-hidden py-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="min-w-[150px] md:min-w-[200px] flex-shrink-0">
          <LoadingCard />
        </div>
      ))}
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-[100dvh] pt-24 pb-12">
      <div className="container mx-auto px-4 space-y-12">
        <Skeleton className="w-[300px] h-10" />
        <LoadingGrid />
      </div>
    </div>
  );
}
