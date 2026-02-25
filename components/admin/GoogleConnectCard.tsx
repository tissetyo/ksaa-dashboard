'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getGoogleConnectionStatus, disconnectGoogleAccount } from '@/lib/actions/google-connect';
import { Calendar, CheckCircle2, Loader2, LogIn, Unlink } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

export function GoogleConnectCard() {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        loadStatus();
    }, []);

    const loadStatus = async () => {
        try {
            const status = await getGoogleConnectionStatus();
            setIsConnected(status.connected);
        } catch (error) {
            console.error('Failed to load Google connection status', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnect = async () => {
        setIsConnecting(true);
        // This initiates the Google OAuth flow and redirects back to this page
        await signIn('google', { callbackUrl: '/admin/settings?google_connected=true' });
    };

    const handleDisconnect = async () => {
        setIsDisconnecting(true);
        try {
            const result = await disconnectGoogleAccount();
            if (result.success) {
                toast.success('Google account disconnected');
                setIsConnected(false);
            } else {
                toast.error(result.error || 'Failed to disconnect');
            }
        } catch (error) {
            toast.error('An error occurred while disconnecting');
        } finally {
            setIsDisconnecting(false);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" /> Google Calendar Integration
                    </CardTitle>
                    <CardDescription>
                        Connect your Google account to auto-generate Google Meet links for appointments.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-6">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" /> Google Calendar Integration
                </CardTitle>
                <CardDescription>
                    Connect your Google account to automatically create Calendar events with Google Meet links when confirming appointments.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isConnected ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-green-800">Account Connected</p>
                                <p className="text-sm text-green-600">You can now create Google Meet links for appointments.</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="bg-white border-green-200 text-red-600 hover:bg-red-50 hover:text-red-700 w-full sm:w-auto shrink-0"
                            onClick={handleDisconnect}
                            disabled={isDisconnecting}
                        >
                            {isDisconnecting ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Disconnecting...</>
                            ) : (
                                <><Unlink className="h-4 w-4 mr-2" /> Disconnect</>
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-4 gap-4">
                        <div>
                            <p className="font-medium text-gray-800">Not Connected</p>
                            <p className="text-sm text-gray-500">Connect to generate real meeting links on your own calendar.</p>
                        </div>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto shrink-0"
                            onClick={handleConnect}
                            disabled={isConnecting}
                        >
                            {isConnecting ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Connecting...</>
                            ) : (
                                <><LogIn className="h-4 w-4 mr-2" /> Connect Google Account</>
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
