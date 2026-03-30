'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/api/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { toast } from 'react-hot-toast';
import { UserIcon, MailIcon, KeyIcon } from 'lucide-react';

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
      const response = await api.put(`/users/${user.id}`, {
        name,
        email,
        password: password || undefined, // Only send password if changed
      });
      setAuth(response.data, localStorage.getItem('accessToken') || '');
      toast.success('Profile updated!');
      setPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border bg-card shadow-lg ring-1 ring-border/5">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
           <UserIcon className="text-primary" />
           Your Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground ml-1">Full Name</label>
            <div className="relative">
                <UserIcon className="absolute left-3 top-3 text-muted-foreground/50" size={18} />
                <Input
                className="pl-10"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                required
                />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground ml-1">Email Address</label>
            <div className="relative">
                <MailIcon className="absolute left-3 top-3 text-muted-foreground/50" size={18} />
                <Input
                className="pl-10"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground ml-1">New Password (optional)</label>
            <div className="relative">
                <KeyIcon className="absolute left-3 top-3 text-muted-foreground/50" size={18} />
                <Input
                className="pl-10"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                />
            </div>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full h-11">
            {isLoading ? 'Updating...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
