export type ReminderType = 'alarm' | 'reminder' | 'calendar';

export interface Reminder {
    id: string;
    type: ReminderType;
    title: string;
    description?: string;
    dateTime: Date;
    repeat?: 'none' | 'daily' | 'weekly' | 'monthly';
    isActive: boolean;
    notified: boolean;
    createdAt: Date;
    sound?: boolean;
    priority?: 'low' | 'medium' | 'high';
}

export interface CalendarEvent extends Reminder {
    type: 'calendar';
    endDateTime?: Date;
    location?: string;
    attendees?: string[];
}

export interface Alarm extends Reminder {
    type: 'alarm';
    snoozeCount?: number;
    snoozeDuration?: number; // in minutes
}
