
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminPaymentsPage() {
    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
                <p className="text-muted-foreground">Track revenue and transactions.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>View recent payments and refunds.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground py-8 text-center">No transactions recorded yet.</p>
                </CardContent>
            </Card>
        </div>
    );
}
