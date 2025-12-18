'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Reminder, ReminderType } from '@/types/reminder';
import { useWebSocketContext } from './WebSocketContext';

interface ReminderContextType {
    reminders: Reminder[];
    addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'notified'>) => void;
    updateReminder: (id: string, updates: Partial<Reminder>) => void;
    deleteReminder: (id: string) => void;
    getUpcomingReminders: (hours?: number) => Reminder[];
    snoozeReminder: (id: string, minutes?: number) => void;
    activeNotification: Reminder | null;
    dismissNotification: () => void;
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export const useReminders = () => {
    const context = useContext(ReminderContext);
    if (!context) {
        throw new Error('useReminders must be used within ReminderProvider');
    }
    return context;
};

export const ReminderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [activeNotification, setActiveNotification] = useState<Reminder | null>(null);
    const { sendText } = useWebSocketContext();

    // Load reminders from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('reminders');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Convert date strings back to Date objects
                const remindersWithDates = parsed.map((r: any) => ({
                    ...r,
                    dateTime: new Date(r.dateTime),
                    createdAt: new Date(r.createdAt),
                    endDateTime: r.endDateTime ? new Date(r.endDateTime) : undefined,
                }));
                setReminders(remindersWithDates);
            } catch (error) {
                console.error('Failed to load reminders:', error);
            }
        }
    }, []);

    // Save reminders to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('reminders', JSON.stringify(reminders));
    }, [reminders]);

    // Check for due reminders every minute
    useEffect(() => {
        const checkReminders = () => {
            const now = new Date();

            reminders.forEach((reminder) => {
                if (!reminder.isActive || reminder.notified) return;

                const reminderTime = new Date(reminder.dateTime);

                // Check if reminder is due (within 1 minute)
                if (reminderTime <= now && reminderTime > new Date(now.getTime() - 60000)) {
                    // Mark as notified
                    setReminders(prev =>
                        prev.map(r => r.id === reminder.id ? { ...r, notified: true } : r)
                    );

                    // Set active notification
                    setActiveNotification(reminder);

                    // Play notification sound if enabled
                    if (reminder.sound !== false) {
                        playNotificationSound();
                    }

                    // Send to AI avatar
                    notifyAIAvatar(reminder);

                    // Handle repeat
                    if (reminder.repeat && reminder.repeat !== 'none') {
                        scheduleNextOccurrence(reminder);
                    }
                }
            });
        };

        const interval = setInterval(checkReminders, 10000); // Check every 10 seconds
        checkReminders(); // Check immediately

        return () => clearInterval(interval);
    }, [reminders]);

    const playNotificationSound = () => {
        try {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(err => console.log('Audio play failed:', err));
        } catch (error) {
            console.log('Audio not available:', error);
        }
    };

    const notifyAIAvatar = (reminder: Reminder) => {
        const message = formatReminderMessage(reminder);
        // Send text message to trigger AI response
        sendText(message);
    };

    const formatReminderMessage = (reminder: Reminder): string => {
        const typeText = reminder.type === 'alarm' ? 'Alarm' :
            reminder.type === 'calendar' ? 'Calendar Event' : 'Reminder';

        let message = `${typeText}: ${reminder.title}`;
        if (reminder.description) {
            message += `. ${reminder.description}`;
        }
        return message;
    };

    const scheduleNextOccurrence = (reminder: Reminder) => {
        const nextDate = new Date(reminder.dateTime);

        switch (reminder.repeat) {
            case 'daily':
                nextDate.setDate(nextDate.getDate() + 1);
                break;
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
        }

        setReminders(prev => [
            ...prev,
            {
                ...reminder,
                id: `${reminder.id}-${Date.now()}`,
                dateTime: nextDate,
                notified: false,
                createdAt: new Date(),
            }
        ]);
    };

    const addReminder = useCallback((reminder: Omit<Reminder, 'id' | 'createdAt' | 'notified'>) => {
        const newReminder: Reminder = {
            ...reminder,
            id: `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            notified: false,
        };
        setReminders(prev => [...prev, newReminder]);
    }, []);

    const updateReminder = useCallback((id: string, updates: Partial<Reminder>) => {
        setReminders(prev =>
            prev.map(r => r.id === id ? { ...r, ...updates } : r)
        );
    }, []);

    const deleteReminder = useCallback((id: string) => {
        setReminders(prev => prev.filter(r => r.id !== id));
    }, []);

    const getUpcomingReminders = useCallback((hours: number = 24): Reminder[] => {
        const now = new Date();
        const future = new Date(now.getTime() + hours * 60 * 60 * 1000);

        return reminders
            .filter(r => r.isActive && !r.notified)
            .filter(r => {
                const reminderTime = new Date(r.dateTime);
                return reminderTime >= now && reminderTime <= future;
            })
            .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    }, [reminders]);

    const snoozeReminder = useCallback((id: string, minutes: number = 10) => {
        const reminder = reminders.find(r => r.id === id);
        if (!reminder) return;

        const newDateTime = new Date(new Date().getTime() + minutes * 60 * 1000);

        setReminders(prev =>
            prev.map(r => r.id === id ? { ...r, dateTime: newDateTime, notified: false } : r)
        );

        setActiveNotification(null);
    }, [reminders]);

    const dismissNotification = useCallback(() => {
        setActiveNotification(null);
    }, []);

    const value: ReminderContextType = {
        reminders,
        addReminder,
        updateReminder,
        deleteReminder,
        getUpcomingReminders,
        snoozeReminder,
        activeNotification,
        dismissNotification,
    };

    return (
        <ReminderContext.Provider value={value}>
            {children}
        </ReminderContext.Provider>
    );
};
