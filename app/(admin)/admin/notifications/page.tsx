
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminNotificationsPage() {
    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                <p className="text-muted-foreground">System alerts and messages.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Alerts</CardTitle>
                    <CardDescription>View system notifications and updates.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground py-8 text-center">No new notifications.</p>
                </CardContent>
            </Card>
        </div>
    );
}
