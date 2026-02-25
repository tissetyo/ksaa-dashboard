'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                toast.error('Invalid admin credentials.');
            } else {
                toast.success('Welcome back, Admin!');
                router.push('/admin/dashboard');
            }
        } catch (error) {
            toast.error('An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center font-bold text-blue-500">Staff Portal</CardTitle>
                    <CardDescription className="text-center text-gray-600">
                        Secure access for KSAA staff and administrators
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-700">Admin Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@ksaa.com"
                                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-700">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="pt-6">
                        <Button className="w-full bg-[#008E7E] hover:bg-[#0a4f47] text-white" type="submit" disabled={isLoading}>
                            {isLoading ? 'Verifying...' : 'Login to Dashboard'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
