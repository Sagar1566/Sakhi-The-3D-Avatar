'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signOut: () => void;
    updateProfile: (name: string, email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser({
                    ...parsedUser,
                    createdAt: new Date(parsedUser.createdAt)
                });
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    // Save user to localStorage whenever it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            // Get stored users
            const usersJson = localStorage.getItem('users');
            const users: Array<{ email: string; password: string; name: string; id: string; createdAt: string }> =
                usersJson ? JSON.parse(usersJson) : [];

            // Find user
            const foundUser = users.find(u => u.email === email);

            if (!foundUser) {
                return { success: false, error: 'User not found. Please sign up first.' };
            }

            if (foundUser.password !== password) {
                return { success: false, error: 'Incorrect password. Please try again.' };
            }

            // Set user
            const userObj: User = {
                id: foundUser.id,
                email: foundUser.email,
                name: foundUser.name,
                createdAt: new Date(foundUser.createdAt)
            };

            setUser(userObj);
            return { success: true };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: 'An error occurred during sign in.' };
        }
    };

    const signUp = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            // Validate inputs
            if (!name || name.trim().length < 2) {
                return { success: false, error: 'Name must be at least 2 characters long.' };
            }

            if (!email || !email.includes('@')) {
                return { success: false, error: 'Please enter a valid email address.' };
            }

            if (!password || password.length < 6) {
                return { success: false, error: 'Password must be at least 6 characters long.' };
            }

            // Get stored users
            const usersJson = localStorage.getItem('users');
            const users: Array<{ email: string; password: string; name: string; id: string; createdAt: string }> =
                usersJson ? JSON.parse(usersJson) : [];

            // Check if user already exists
            if (users.some(u => u.email === email)) {
                return { success: false, error: 'An account with this email already exists.' };
            }

            // Create new user
            const newUser = {
                id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                email,
                password, // In production, this should be hashed!
                name: name.trim(),
                createdAt: new Date().toISOString()
            };

            // Save to storage
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            // Set current user
            const userObj: User = {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                createdAt: new Date(newUser.createdAt)
            };

            setUser(userObj);
            return { success: true };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: 'An error occurred during sign up.' };
        }
    };

    const signOut = () => {
        setUser(null);
    };

    const updateProfile = async (name: string, email: string): Promise<{ success: boolean; error?: string }> => {
        try {
            if (!user) return { success: false, error: 'Not authenticated' };

            // Validate inputs
            if (!name || name.trim().length < 2) {
                return { success: false, error: 'Name must be at least 2 characters long.' };
            }

            if (!email || !email.includes('@')) {
                return { success: false, error: 'Please enter a valid email address.' };
            }

            // Get stored users
            const usersJson = localStorage.getItem('users');
            const users: Array<{ email: string; password: string; name: string; id: string; createdAt: string }> =
                usersJson ? JSON.parse(usersJson) : [];

            // Check if email is already taken by another user
            if (email !== user.email && users.some(u => u.email === email && u.id !== user.id)) {
                return { success: false, error: 'Email already in use.' };
            }

            // Update user in 'users' array
            const updatedUsers = users.map(u => {
                if (u.id === user.id) {
                    return { ...u, name, email };
                }
                return u;
            });
            localStorage.setItem('users', JSON.stringify(updatedUsers));

            // Update current user state
            const updatedUser = { ...user, name, email };
            setUser(updatedUser);

            return { success: true };
        } catch (error) {
            console.error('Update profile error:', error);
            return { success: false, error: 'An error occurred while updating profile.' };
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateProfile
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
