'use client';

import { useAuth } from '../RootLayout.client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold text-gray-700">Dashboard</h1>
        <p className="mt-4">Welcome, {user.email}!</p>
        <p>Your role: {user.role}</p>
      </div>
    </div>
  );
}