import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ServicesLoading() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="max-w-2xl">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-5 w-96 mt-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
