'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/api/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-hot-toast';
import { User, Mail, Key, Shield } from 'lucide-react';

export function ProfileSection() {
  const { user, setAuth } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await api.put(`/users/${user.id}`, {
        name,
        email,
        password: password || undefined,
      });
      setAuth(res.data, localStorage.getItem('accessToken') || '');
      toast.success('Profile updated.');
      setPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-10">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-5">
          <span className="text-xl font-semibold text-muted-foreground">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your account details.</p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-5 max-w-md">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-[0.08em]">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={15} />
            <Input
              className="pl-9"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-[0.08em]">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={15} />
            <Input
              className="pl-9"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-[0.08em]">
            New Password
            <span className="normal-case tracking-normal ml-1 opacity-50">(optional)</span>
          </label>
          <div className="relative">
            <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={15} />
            <Input
              className="pl-9"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={isLoading} className="h-11 px-6">
            {isLoading ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>

      <div className="mt-10 pt-8 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground/50">
          <Shield size={13} />
          <span>Your data is encrypted and never shared.</span>
        </div>
      </div>
    </div>
  );
}
