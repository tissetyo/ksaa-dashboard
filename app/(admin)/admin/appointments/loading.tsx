import { Skeleton } from "@/components/ui/skeleton";

export default function AdminAppointmentsLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48" />
            </div>

            <div className="flex gap-2 mb-4">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-9 w-24 rounded-md" />
                ))}
            </div>

            <div className="bg-white rounded-lg border">
                <div className="p-4 border-b">
                    <div className="flex gap-4">
                        {['Date', 'Patient', 'Service', 'Status', 'Actions'].map((h) => (
                            <Skeleton key={h} className="h-4 w-24" />
                        ))}
                    </div>
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4 border-b flex gap-4">
                        <Skeleton className="h-12 w-24" />
                        <Skeleton className="h-12 w-32" />
                        <Skeleton className="h-12 w-40" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-8 w-8" />
                    </div>
                ))}
            </div>
        </div>
    );
}
