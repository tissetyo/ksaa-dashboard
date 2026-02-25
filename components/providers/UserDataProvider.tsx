'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { prefetchUserData, PrefetchedData } from '@/lib/actions/prefetch';

interface UserDataContextType {
    data: PrefetchedData | null;
    isLoading: boolean;
    refresh: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType>({
    data: null,
    isLoading: true,
    refresh: async () => { },
});

export function useUserData() {
    return useContext(UserDataContext);
}

export function UserDataProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<PrefetchedData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await prefetchUserData();
            setData(result);
        } catch (error) {
            console.error('Failed to prefetch user data:', error);
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

    return (
        <UserDataContext.Provider value={{ data, isLoading, refresh }}>
            {children}
        </UserDataContext.Provider>
    );
}
