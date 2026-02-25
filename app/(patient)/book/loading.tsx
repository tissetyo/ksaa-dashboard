import { Skeleton } from "@/components/ui/skeleton";

export default function BookLoading() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
            <div className="text-center">
                <Skeleton className="h-12 w-64 mx-auto" />
                <Skeleton className="h-5 w-96 mx-auto mt-4" />
            </div>

            <div className="flex justify-center gap-8 py-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-lg border p-6">
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
}
