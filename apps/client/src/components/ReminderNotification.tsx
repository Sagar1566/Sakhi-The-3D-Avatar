'use client';

import React, { useEffect, useState } from 'react';
import { useReminders } from '@/contexts/ReminderContext';
import { Button } from '@/components/ui/button';
import { Bell, Clock, Calendar, X } from 'lucide-react';
import { format } from 'date-fns';

export const ReminderNotification: React.FC = () => {
    const { activeNotification, dismissNotification, snoozeReminder } = useReminders();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (activeNotification) {
            setIsVisible(true);
        }
    }, [activeNotification]);

    if (!activeNotification || !isVisible) return null;

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(() => {
            dismissNotification();
        }, 300);
    };

    const handleSnooze = (minutes: number) => {
        snoozeReminder(activeNotification.id, minutes);
        setIsVisible(false);
    };

    const getIcon = () => {
        switch (activeNotification.type) {
            case 'alarm':
                return <Clock className="w-8 h-8" />;
            case 'calendar':
                return <Calendar className="w-8 h-8" />;
            default:
                return <Bell className="w-8 h-8" />;
        }
    };

    const getColor = () => {
        switch (activeNotification.priority) {
            case 'high':
                return 'from-red-500 to-orange-500';
            case 'low':
                return 'from-gray-500 to-gray-600';
            default:
                return 'from-purple-500 to-pink-500';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className={`relative w-full max-w-md bg-gradient-to-br ${getColor()} p-1 rounded-2xl shadow-2xl animate-in zoom-in duration-300`}
            >
                <div className="bg-white rounded-xl p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${getColor()} text-white`}>
                            {getIcon()}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDismiss}
                            className="h-8 w-8 rounded-full"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                {activeNotification.type}
                            </span>
                            {activeNotification.priority === 'high' && (
                                <span className="text-xs font-bold text-red-500 animate-pulse">
                                    HIGH PRIORITY
                                </span>
                            )}
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900">
                            {activeNotification.title}
                        </h2>

                        {activeNotification.description && (
                            <p className="text-gray-600">{activeNotification.description}</p>
                        )}

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            {format(new Date(activeNotification.dateTime), 'MMM dd, yyyy • hh:mm a')}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        {activeNotification.type === 'alarm' && (
                            <>
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => handleSnooze(5)}
                                >
                                    <Clock className="w-4 h-4 mr-2" />
                                    5 min
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => handleSnooze(10)}
                                >
                                    <Clock className="w-4 h-4 mr-2" />
                                    10 min
                                </Button>
                            </>
                        )}
                        <Button
                            className={`flex-1 bg-gradient-to-r ${getColor()} text-white hover:opacity-90`}
                            onClick={handleDismiss}
                        >
                            Dismiss
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReminderNotification;
