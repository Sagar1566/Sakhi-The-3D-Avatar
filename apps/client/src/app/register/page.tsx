'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';

export default function RegisterPage() {
    const router = useRouter();
    const { signUp, isAuthenticated, isLoading } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, isLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsSubmitting(true);

        const result = await signUp(name, email, password);

        if (result.success) {
            router.push('/');
        } else {
            setError(result.error || 'Failed to create account');
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-pink-900">
            <div className="w-full max-w-md px-8">
                {/* Header */}
                {/* Header */}
                <div className="text-center mb-8 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight" style={{ fontFamily: '"Outfit", sans-serif' }}>
                        <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Sakhi</span>
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ml-2">AI</span>
                    </h1>
                    <h2 className="text-xl font-medium text-white/80">
                        Create an account
                    </h2>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert className="mb-6 bg-red-50 border-red-200 text-red-800">
                        <p className="text-sm">{error}</p>
                    </Alert>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name Field */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-white font-medium">
                            Name
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-white font-medium">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-white font-medium">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-white font-medium">
                            Confirm Password
                        </Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                            required
                            disabled={isSubmitting}
                        />
                        {confirmPassword && password !== confirmPassword && (
                            <p className="text-xs text-red-600">Passwords do not match</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                        disabled={isSubmitting || password !== confirmPassword}
                    >
                        {isSubmitting ? 'Creating account...' : 'Create Account'}
                    </Button>
                </form>

                {/* Sign In Link */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-white/60">
                        Already have an account?{' '}
                        <Link href="/login" className="text-purple-400 hover:text-purple-300 hover:underline font-medium">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
