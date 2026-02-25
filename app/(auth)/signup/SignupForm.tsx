'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

function SignupForm() {
    const [salutation, setSalutation] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Auto-fill referral code from URL parameter (from QR code)
    useEffect(() => {
        const refParam = searchParams.get('ref');
        if (refParam) {
            setReferralCode(refParam.toUpperCase());
            toast.success('Referral code applied!');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ salutation, email, password, fullName, phone, referralCode }),
            });

            if (response.ok) {
                toast.success('Account created! Logging you in...');

                // Auto-login after registration
                const result = await signIn('credentials', {
                    email,
                    password,
                    redirect: false,
                });

                if (result?.error) {
                    toast.error('Login failed after signup. Please log in manually.');
                    router.push('/login');
                } else {
                    toast.success('Welcome! Please complete your profile.');
                    router.push('/profile/complete');
                }
            } else {
                const data = await response.json();
                toast.error(data.message || 'Signup failed. Please try again.');
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center font-bold text-[#008E7E]">Create Account</CardTitle>
                    <CardDescription className="text-center">
                        Register to claim your free 5 million stemcells and book appointments based on your health needs
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2 col-span-1">
                                <Label htmlFor="salutation">Title</Label>
                                <Select value={salutation} onValueChange={setSalutation}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MR">Mr.</SelectItem>
                                        <SelectItem value="MRS">Mrs.</SelectItem>
                                        <SelectItem value="MS">Ms.</SelectItem>
                                        <SelectItem value="DR">Dr.</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+60123456789"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                            <Input
                                id="referralCode"
                                placeholder="STAFF-XXXXX"
                                value={referralCode}
                                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                disabled={isLoading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Have a referral code? Enter it here for special benefits
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 pt-6">
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating account...' : 'Sign Up'}
                        </Button>
                        <div className="text-center text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link href="/login" className="text-[#008E7E] hover:underline">
                                Sign in here
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

export default SignupForm;
