import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AppointmentsLoading() {
    return (
        <div className="space-y-8 animate-pulse">
            <div>
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-5 w-64 mt-2" />
            </div>

            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardContent className="p-0">
                            <div className="flex">
                                <Skeleton className="w-[150px] h-[180px]" />
                                <div className="p-6 flex-1 space-y-3">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-4 w-1/4" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
