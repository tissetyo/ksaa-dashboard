
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminSettingsPage() {
    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Configure system preferences.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Manage application configuration.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground py-8 text-center">Settings configuration coming soon.</p>
                </CardContent>
            </Card>
        </div>
    );
}
