'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/api/axios';
import { toast } from 'react-hot-toast';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
        // Fetch current user details since we only got the token in the URL
        const fetchUser = async () => {
             try {
                // Set the token first so subsequent requests use it
                localStorage.setItem('accessToken', token); 
                
                // Fetch the user profile from the backend
                // The current user endpoint is often /auth/me or similar, 
                // but UserController has /api/v1/users/email/{email}. 
                // For simplicity, we'll assume the backend provides a /me or /profile endpoint 
                // or we can decode the token if it has user info.
                
                // Let's decode the JWT simple payload for now or just hit /users route
                const response = await api.get('/users/me'); 
                setAuth(response.data, token);
                
                toast.success('Successfully logged in with OAuth2');
                router.push('/dashboard');
             } catch (error) {
                toast.error('Failed to complete OAuth2 login');
                router.push('/auth/login');
             }
        };
        fetchUser();
    } else {
        toast.error('No token found in callback');
        router.push('/auth/login');
    }
  }, [searchParams, setAuth, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-slate-500 font-medium animate-pulse">Finalizing authentication...</p>
        </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackHandler />
    </Suspense>
  );
}
