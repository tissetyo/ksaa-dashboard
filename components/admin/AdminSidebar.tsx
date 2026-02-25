'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
    LayoutDashboard,
    Users,
    Calendar,
    Package,
    Clock,
    CreditCard,
    Settings,
    Bell,
    LogOut,
    ChevronLeft,
    ChevronRight,
    UserCog,
    TrendingUp,
    Star
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type NavItem = {
    name: string;
    href: string;
    icon: any;
    roles: ('SUPERADMIN' | 'STAFF')[];
};

export function AdminSidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { data: session } = useSession();
    const userRole = session?.user?.role as 'SUPERADMIN' | 'STAFF' | undefined;

    // Define navigation with role-based access
    const navigation: NavItem[] = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, roles: ['SUPERADMIN', 'STAFF'] },
        { name: 'Appointments', href: '/admin/appointments', icon: Calendar, roles: ['SUPERADMIN', 'STAFF'] },
        { name: 'Patients', href: '/admin/patients', icon: Users, roles: ['SUPERADMIN', 'STAFF'] },
        { name: 'Schedule', href: '/admin/schedule', icon: Clock, roles: ['SUPERADMIN', 'STAFF'] },
        { name: 'Reviews', href: '/admin/reviews', icon: Star, roles: ['SUPERADMIN'] }, // Added Reviews link
        { name: 'Staff', href: '/admin/staff', icon: UserCog, roles: ['SUPERADMIN'] },
        { name: 'Referrals', href: '/admin/referrals', icon: TrendingUp, roles: ['SUPERADMIN'] },
        { name: 'Products', href: '/admin/products', icon: Package, roles: ['SUPERADMIN'] },
        { name: 'Notifications', href: '/admin/notifications', icon: Bell, roles: ['SUPERADMIN', 'STAFF'] },
        { name: 'Payments', href: '/admin/payments', icon: CreditCard, roles: ['SUPERADMIN'] },
        { name: 'Settings', href: '/admin/settings', icon: Settings, roles: ['SUPERADMIN'] },
    ];

    // Filter navigation based on user role
    const filteredNavigation = navigation.filter(
        item => userRole && item.roles.includes(userRole)
    );

    return (
        <div className={cn(
            "relative bg-white border-r border-gray-200 text-gray-900 transition-all duration-300 flex flex-col",
            isCollapsed ? "w-20" : "w-64"
        )}>
            <div className="p-6 flex items-center justify-between border-b border-gray-200">
                {!isCollapsed && (
                    <div>
                        <Link href="/admin/dashboard">
                            <Image src="/ksaa-logo.png" alt="KSAA STEMCARE" width={130} height={40} className="object-contain" />
                        </Link>
                        {userRole === 'STAFF' && (
                            <span className="text-xs text-gray-500">Staff Portal</span>
                        )}
                    </div>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
                </Button>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {filteredNavigation.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center px-4 py-3 rounded-lg transition-all duration-150",
                            pathname === item.href
                                ? "bg-[#008E7E] text-white"
                                : "text-gray-700 hover:bg-gray-100 hover:text-[#008E7E]"
                        )}
                    >
                        <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                        {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-200">
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full text-gray-600 hover:text-red-600 hover:bg-gray-100",
                        isCollapsed ? "justify-center" : "justify-start"
                    )}
                    onClick={() => signOut({ callbackUrl: '/admin-login' })}
                >
                    <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                    {!isCollapsed && <span>Sign Out</span>}
                </Button>
            </div>
        </div>
    );
}
