'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
    Calendar,
    User,
    Menu,
    X,
    LogOut,
    LayoutDashboard,
    Package,
    Gift
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { getSiteSetting } from '@/lib/actions/site-settings';

export function PatientHeader() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();
    const [logoUrl, setLogoUrl] = useState('/ksaa-logo.png');

    useEffect(() => {
        getSiteSetting('logo_url').then(url => {
            if (url) setLogoUrl(url);
        });
    }, []);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Services', href: '/services', icon: Package },
        { name: 'Appointments', href: '/appointments', icon: Calendar },
        { name: 'Rewards', href: '/rewards', icon: Gift },
        { name: 'Profile', href: '/profile', icon: User },
    ];

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link href="/dashboard">
                            <img src={logoUrl} alt="KSAA STEMCARE" className="object-contain h-12 max-w-[160px]" />
                        </Link>
                    </div>

                    <nav className="hidden md:flex space-x-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`text-sm font-medium transition-colors hover:text-[#008E7E] ${pathname === item.href ? 'text-[#008E7E]' : 'text-gray-700'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center space-x-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <User className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                    <p className="font-medium">{session?.user?.name || 'Patient'}</p>
                                    <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile">Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/appointments">My Appointments</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600"
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white p-4 space-y-2">
                    {navigation.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${pathname === item.href ? 'bg-[#008E7E]/10 text-[#008E7E]' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <item.icon className="mr-3 h-5 w-5" />
                            {item.name}
                        </Link>
                    ))}
                    <Button
                        variant="destructive"
                        className="w-full justify-start mt-4"
                        onClick={() => signOut({ callbackUrl: '/' })}
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Sign Out
                    </Button>
                </div>
            )}
        </header>
    );
}
