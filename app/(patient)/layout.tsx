import { PatientHeader } from '@/components/patient/PatientHeader';
import { UserDataProvider } from '@/components/providers/UserDataProvider';

export default function PatientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <UserDataProvider>
            <div className="min-h-screen bg-gray-50">
                <PatientHeader />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </main>
            </div>
        </UserDataProvider>
    );
}

