
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminPatientsPage() {
    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
                <p className="text-muted-foreground">Manage patient records and histories.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Patient Directory</CardTitle>
                    <CardDescription>View and manage all registered patients.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground py-8 text-center">No patients found or feature coming soon.</p>
                </CardContent>
            </Card>
        </div>
    );
}
