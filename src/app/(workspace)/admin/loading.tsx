import { Card, Skeleton } from "@/components/ui";

export default function AdminLoading() {
  return (
    <div aria-label="Loading projects" className="animate-in fade-in">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-9 w-40" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} className="p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-7 w-12" />
            <Skeleton className="mt-2 h-3 w-28" />
          </Card>
        ))}
      </div>
      <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Card key={index} className="p-5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-3 h-4 w-52" />
            <Skeleton className="mt-7 h-4 w-32" />
          </Card>
        ))}
      </div>
    </div>
  );
}