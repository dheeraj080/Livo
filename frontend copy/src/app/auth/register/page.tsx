'use client';

import { useRouter } from 'next/navigation';
import api from '@/api/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });
  const router = useRouter();

  const onSubmit = async (data: RegisterFormValues) => {
    const loadingToast = toast.loading('Creating explorer account...');
    try {
      await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password
      });
      toast.success('Welcome to Livo!', { id: loadingToast });
      router.push('/auth/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed', { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="absolute top-8 left-8 flex items-center gap-2">
         <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">L</div>
         <span className="font-bold text-xl tracking-tighter text-foreground">Livo</span>
      </div>
      
      <div className="absolute top-8 right-8">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-border bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-3xl font-bold text-center text-foreground tracking-tight leading-tight">
            Join Livo
          </CardTitle>
          <CardDescription className="text-muted-foreground text-center text-sm">Start your journey toward timeless focus</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Full Name"
                {...register('name')}
                error={!!errors.name}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Input
                placeholder="name@example.com"
                type="email"
                {...register('email')}
                error={!!errors.email}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Input
                placeholder="••••••••"
                type="password"
                {...register('password')}
                error={!!errors.password}
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
              {isSubmitting ? 'Architecting Profile...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center">
            <span className="text-muted-foreground">Already a member? </span>
            <Link href="/auth/login" className="text-primary hover:opacity-80 font-medium transition-opacity">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
