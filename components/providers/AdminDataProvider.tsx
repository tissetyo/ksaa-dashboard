'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { prefetchAdminData, AdminPrefetchedData } from '@/lib/actions/admin-prefetch';

interface AdminDataContextType {
    data: AdminPrefetchedData | null;
    isLoading: boolean;
    refresh: () => Promise<void>;
    // Helper functions to update local cache after actions
    updateAppointment: (id: string, updates: any) => void;
    removeAppointment: (id: string) => void;
}

const AdminDataContext = createContext<AdminDataContextType>({
    data: null,
    isLoading: true,
    refresh: async () => { },
    updateAppointment: () => { },
    removeAppointment: () => { },
});

export function useAdminData() {
    return useContext(AdminDataContext);
}

export function AdminDataProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<AdminPrefetchedData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await prefetchAdminData();
            setData(result);
        } catch (error) {
            console.error('Failed to prefetch admin data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const refresh = useCallback(async () => {
        await loadData();
    }, [loadData]);

    // Update a single appointment in cache (optimistic update)
    const updateAppointment = useCallback((id: string, updates: any) => {
        setData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                appointments: prev.appointments.map(apt =>
                    apt.id === id ? { ...apt, ...updates } : apt
                )
            };
        });
    }, []);

    // Remove appointment from cache
    const removeAppointment = useCallback((id: string) => {
        setData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                appointments: prev.appointments.filter(apt => apt.id !== id)
            };
        });
    }, []);

    return (
        <AdminDataContext.Provider value={{
            data,
            isLoading,
            refresh,
            updateAppointment,
            removeAppointment
        }}>
            {children}
        </AdminDataContext.Provider>
    );
}
