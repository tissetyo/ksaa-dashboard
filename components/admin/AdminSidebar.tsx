'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
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
    TrendingUp
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AdminSidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
        { name: 'Patients', href: '/admin/patients', icon: Users },
        { name: 'Staff', href: '/admin/staff', icon: UserCog },
        { name: 'Referrals', href: '/admin/referrals', icon: TrendingUp },
        { name: 'Products', href: '/admin/products', icon: Package },
        { name: 'Schedule', href: '/admin/schedule', icon: Clock },
        { name: 'Notifications', href: '/admin/notifications', icon: Bell },
        { name: 'Payments', href: '/admin/payments', icon: CreditCard },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
    ];

    return (
        <div className={cn(
            "relative bg-navy-900 text-white transition-all duration-300 flex flex-col",
            isCollapsed ? "w-20" : "w-64"
        )}>
            <div className="p-6 flex items-center justify-between">
                {!isCollapsed && <h1 className="text-xl font-bold text-blue-400">KSAA Admin</h1>}
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white hover:bg-navy-800"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
                </Button>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navigation.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center px-4 py-3 rounded-lg transition-colors",
                            pathname === item.href
                                ? "bg-blue-600 text-white"
                                : "text-gray-200 hover:bg-navy-800 hover:text-blue-400"
                        )}
                    >
                        <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                        {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-navy-800">
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full text-gray-400 hover:text-red-400 hover:bg-navy-800",
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
