"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../store/useAuthStore';

export default function RootPage() {
  const { accessToken } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (accessToken) {
      router.push('/workspaces');
    } else {
      router.push('/login');
    }
  }, [accessToken]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
    </div>
  );
}
