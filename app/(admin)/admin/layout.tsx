import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminDataProvider } from '@/components/providers/AdminDataProvider';

import { GoogleConnectionWarning } from '@/components/admin/GoogleConnectionWarning';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminDataProvider>
            <div className="flex min-h-screen bg-gray-100">
                <AdminSidebar />
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 justify-between">
                        <h2 className="text-xl font-semibold text-gray-800">KSAA Administration</h2>
                        <div className="flex items-center space-x-4">
                            {/* Admin profile / notices can go here */}
                        </div>
                    </header>
                    <GoogleConnectionWarning />
                    <main className="flex-1 overflow-y-auto p-8">
                        {children}
                    </main>
                </div>
            </div>
        </AdminDataProvider>
    );
}

