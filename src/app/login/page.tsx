"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import { login } from '@/lib/auth';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success && result.user) {
        switch (result.user.role) {
          case 'admin':
            router.push('/dashboard/admin');
            break;
          case 'worker':
            router.push('/dashboard/worker');
            break;
          default:
            router.push('/dashboard/user');
        }
      } else {
        setError(result.error || 'Login failed');
        setLoading(false);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-md">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-8 glass">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                <p className="text-muted-foreground">Login to your KaamOn account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full gradient-orange-blue text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : 'Login'}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Link href="/signup" className="text-primary font-semibold hover:underline">
                    Sign Up
                  </Link>
                </p>
              </div>

              {/* Seeded demo accounts */}
              <div className="mt-6 p-4 bg-muted/50 rounded-md">
                <p className="text-sm font-semibold mb-2">Demo Accounts (after seeding DB):</p>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <p>👨‍💼 Admin: <strong>admin@kaamon.com</strong> / admin123</p>
                  <p>👤 User: <strong>user@kaamon.com</strong> / user1234</p>
                  <p className="mt-2 italic text-orange-500">Run the seed script first! See README.</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}