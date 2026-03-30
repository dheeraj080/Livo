'use client';

import { useRouter } from 'next/navigation';
import api from '@/api/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { ThemeToggle } from '@/components/ThemeToggle';

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
    const id = toast.loading('Creating your account...');
    try {
      await api.post('/auth/register', { name: data.name, email: data.email, password: data.password });
      toast.success('Account created. Welcome.', { id });
      router.push('/auth/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed', { id });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left editorial panel ── */}
      <div className="hidden lg:flex w-[42%] flex-col justify-between p-12 bg-foreground text-background select-none">
        <span
          className="text-xs tracking-[0.18em] uppercase opacity-40 font-medium"
          style={{ fontFamily: 'var(--font-inter, sans-serif)' }}
        >
          Livo
        </span>

        <div>
          <h1
            className="text-[3.5rem] xl:text-[4.5rem] leading-[1.06] mb-7 opacity-95"
            style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontStyle: 'italic', fontWeight: 400 }}
          >
            Begin<br />with one<br />clear thought.
          </h1>
          <p className="text-sm leading-relaxed opacity-35 max-w-[24ch]">
            Clarity is a practice. Livo gives you the space to cultivate it.
          </p>
        </div>

        <p className="text-[11px] tracking-[0.1em] uppercase opacity-20">© 2026 Livo</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 relative flex items-center justify-center bg-background p-8">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
            <span className="text-background text-base"
              style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontStyle: 'italic' }}>L</span>
          </div>
          <span className="font-semibold text-sm">Livo</span>
        </div>

        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">Create account</h2>
            <p className="text-sm text-muted-foreground mt-1">Start your focused practice.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <Input placeholder="Full name" autoComplete="name" {...register('name')} error={!!errors.name} />
              {errors.name && <p className="text-xs text-destructive mt-1.5">{errors.name.message}</p>}
            </div>
            <div>
              <Input placeholder="Email address" type="email" autoComplete="email" {...register('email')} error={!!errors.email} />
              {errors.email && <p className="text-xs text-destructive mt-1.5">{errors.email.message}</p>}
            </div>
            <div>
              <Input placeholder="Password" type="password" autoComplete="new-password" {...register('password')} error={!!errors.password} />
              {errors.password && <p className="text-xs text-destructive mt-1.5">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full h-11 mt-1" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="text-sm text-center mt-8 text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-foreground font-medium underline underline-offset-4 decoration-border hover:decoration-foreground transition-all">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
