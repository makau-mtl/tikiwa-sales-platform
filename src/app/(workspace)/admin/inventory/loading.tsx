import { Card, Skeleton } from "@/components/ui";

export default function InventoryLoading() {
  return (
    <div aria-label="Loading inventory" className="animate-in fade-in">
      <div className="space-y-2 border-b border-[#e5ebe7] pb-6">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} className="p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-7 w-12" />
          </Card>
        ))}
      </div>
      <div className="mt-8 space-y-3">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} className="flex items-center justify-between p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-52" />
            </div>
            <Skeleton className="h-8 w-32" />
          </Card>
        ))}
      </div>
    </div>
  );
}