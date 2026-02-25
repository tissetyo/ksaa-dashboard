import { db } from '@/lib/db';
import { ScheduleBuilder } from '@/components/admin/ScheduleBuilder';
import { DateOverrideForm } from '@/components/admin/DateOverrideForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const dynamic = 'force-dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteDateOverride } from '@/lib/actions/admin-schedule';
import { formatDate } from '@/lib/utils';

export default async function AdminSchedulePage() {
    const [slots, overrides] = await Promise.all([
        db.availabilitySlot.findMany(),
        db.dateOverride.findMany({
            where: { specificDate: { gte: new Date() } },
            orderBy: { specificDate: 'asc' },
        }),
    ]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Clinic Schedule</h1>
                <p className="text-muted-foreground">Manage recurring availability and special date overrides.</p>
            </div>

            <Tabs defaultValue="weekly" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="weekly">Weekly Recurring</TabsTrigger>
                    <TabsTrigger value="overrides">Date Overrides</TabsTrigger>
                </TabsList>

                <TabsContent value="weekly">
                    <Card>
                        <CardHeader>
                            <CardTitle>Standard Weekly Schedule</CardTitle>
                            <CardDescription>
                                Configure the base time slots that are available every week.
                                Individual service quotas still apply.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScheduleBuilder initialSlots={slots} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="overrides">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle>Add Override</CardTitle>
                                <CardDescription>Close the clinic or set special hours for specific dates.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DateOverrideForm />
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Upcoming Overrides</CardTitle>
                                <CardDescription>Holidays and special closures scheduled.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {overrides.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                                    No upcoming overrides found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            overrides.map((override) => (
                                                <TableRow key={override.id}>
                                                    <TableCell className="font-medium">
                                                        {formatDate(override.specificDate)}
                                                    </TableCell>
                                                    <TableCell>{override.reason}</TableCell>
                                                    <TableCell>
                                                        {override.isClosed ? (
                                                            <span className="text-red-600 font-medium">Closed</span>
                                                        ) : (
                                                            <span className="text-green-600 font-medium">Custom Hours</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {/* In a real app, this should be a client-side delete button with a server action */}
                                                        <Button variant="ghost" size="icon" className="text-red-500">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
