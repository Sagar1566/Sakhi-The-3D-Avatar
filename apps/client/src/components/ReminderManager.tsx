'use client';

import React, { useState } from 'react';
import { useReminders } from '@/contexts/ReminderContext';
import { Reminder, ReminderType } from '@/types/reminder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Bell,
    Calendar,
    Clock,
    Plus,
    Trash2,
    Edit,
    X,
    AlertCircle,
    Repeat,
} from 'lucide-react';
import { format } from 'date-fns';

export const ReminderManager: React.FC = () => {
    const {
        reminders,
        addReminder,
        updateReminder,
        deleteReminder,
        getUpcomingReminders,
    } = useReminders();

    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        type: 'reminder' as ReminderType,
        title: '',
        description: '',
        date: '',
        time: '',
        repeat: 'none' as Reminder['repeat'],
        priority: 'medium' as Reminder['priority'],
        sound: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.date || !formData.time) {
            alert('Please fill in all required fields');
            return;
        }

        const dateTime = new Date(`${formData.date}T${formData.time}`);

        if (dateTime <= new Date()) {
            alert('Please select a future date and time');
            return;
        }

        const reminderData = {
            type: formData.type,
            title: formData.title,
            description: formData.description,
            dateTime,
            repeat: formData.repeat,
            priority: formData.priority,
            sound: formData.sound,
            isActive: true,
        };

        if (editingId) {
            updateReminder(editingId, reminderData);
            setEditingId(null);
        } else {
            addReminder(reminderData);
        }

        resetForm();
        setIsOpen(false);
    };

    const resetForm = () => {
        setFormData({
            type: 'reminder',
            title: '',
            description: '',
            date: '',
            time: '',
            repeat: 'none',
            priority: 'medium',
            sound: true,
        });
    };

    const handleEdit = (reminder: Reminder) => {
        const dateTime = new Date(reminder.dateTime);
        setFormData({
            type: reminder.type,
            title: reminder.title,
            description: reminder.description || '',
            date: format(dateTime, 'yyyy-MM-dd'),
            time: format(dateTime, 'HH:mm'),
            repeat: reminder.repeat || 'none',
            priority: reminder.priority || 'medium',
            sound: reminder.sound !== false,
        });
        setEditingId(reminder.id);
        setIsOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this reminder?')) {
            deleteReminder(id);
        }
    };

    const getTypeIcon = (type: ReminderType) => {
        switch (type) {
            case 'alarm':
                return <Clock className="w-4 h-4" />;
            case 'calendar':
                return <Calendar className="w-4 h-4" />;
            default:
                return <Bell className="w-4 h-4" />;
        }
    };

    const getPriorityColor = (priority?: Reminder['priority']) => {
        switch (priority) {
            case 'high':
                return 'bg-red-500';
            case 'low':
                return 'bg-gray-500';
            default:
                return 'bg-blue-500';
        }
    };

    const upcomingReminders = getUpcomingReminders(24);
    const activeReminders = reminders.filter(r => r.isActive && !r.notified);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="relative w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all shadow-lg overflow-visible"
                    title="Reminders"
                >
                    <Bell className="w-5 h-5" />
                    {upcomingReminders.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce">
                            {upcomingReminders.length}
                        </span>
                    )}
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Reminders & Alarms
                    </DialogTitle>
                    <DialogDescription>
                        Manage your reminders, alarms, and calendar events
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Add/Edit Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value: ReminderType) =>
                                        setFormData({ ...formData, type: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="reminder">
                                            <div className="flex items-center gap-2">
                                                <Bell className="w-4 h-4" />
                                                Reminder
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="alarm">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                Alarm
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="calendar">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                Calendar Event
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value: any) =>
                                        setFormData({ ...formData, priority: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                placeholder="Enter title..."
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Enter description..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date *</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) =>
                                        setFormData({ ...formData, date: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="time">Time *</Label>
                                <Input
                                    id="time"
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) =>
                                        setFormData({ ...formData, time: e.target.value })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="repeat">Repeat</Label>
                            <Select
                                value={formData.repeat}
                                onValueChange={(value: any) =>
                                    setFormData({ ...formData, repeat: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Repeat</SelectItem>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="sound"
                                checked={formData.sound}
                                onChange={(e) =>
                                    setFormData({ ...formData, sound: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-gray-300"
                            />
                            <Label htmlFor="sound" className="cursor-pointer">
                                Play notification sound
                            </Label>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" className="flex-1">
                                <Plus className="w-4 h-4 mr-2" />
                                {editingId ? 'Update' : 'Add'} {formData.type}
                            </Button>
                            {editingId && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setEditingId(null);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </form>

                    {/* Upcoming Reminders */}
                    {upcomingReminders.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                                Upcoming (Next 24 Hours)
                            </h3>
                            <div className="space-y-2">
                                {upcomingReminders.map((reminder) => (
                                    <ReminderCard
                                        key={reminder.id}
                                        reminder={reminder}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onToggle={(id) =>
                                            updateReminder(id, { isActive: !reminder.isActive })
                                        }
                                        getTypeIcon={getTypeIcon}
                                        getPriorityColor={getPriorityColor}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Active Reminders */}
                    <div className="space-y-2">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            All Active Reminders ({activeReminders.length})
                        </h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {activeReminders.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-8">
                                    No active reminders. Create one above!
                                </p>
                            ) : (
                                activeReminders.map((reminder) => (
                                    <ReminderCard
                                        key={reminder.id}
                                        reminder={reminder}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onToggle={(id) =>
                                            updateReminder(id, { isActive: !reminder.isActive })
                                        }
                                        getTypeIcon={getTypeIcon}
                                        getPriorityColor={getPriorityColor}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const ReminderCard: React.FC<{
    reminder: Reminder;
    onEdit: (reminder: Reminder) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string) => void;
    getTypeIcon: (type: ReminderType) => React.ReactNode;
    getPriorityColor: (priority?: Reminder['priority']) => string;
}> = ({ reminder, onEdit, onDelete, onToggle, getTypeIcon, getPriorityColor }) => {
    const dateTime = new Date(reminder.dateTime);
    const isOverdue = dateTime < new Date() && !reminder.notified;

    return (
        <div
            className={`p-3 rounded-lg border transition-all ${isOverdue
                ? 'bg-red-50 border-red-200'
                : 'bg-white border-gray-200 hover:border-purple-300'
                }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${getPriorityColor(reminder.priority)} text-white`}>
                        {getTypeIcon(reminder.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm truncate">{reminder.title}</h4>
                            {reminder.repeat && reminder.repeat !== 'none' && (
                                <Badge variant="outline" className="text-xs">
                                    <Repeat className="w-3 h-3 mr-1" />
                                    {reminder.repeat}
                                </Badge>
                            )}
                        </div>

                        {reminder.description && (
                            <p className="text-xs text-gray-600 mb-2">{reminder.description}</p>
                        )}

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {format(dateTime, 'MMM dd, yyyy • hh:mm a')}
                            {isOverdue && (
                                <Badge variant="destructive" className="text-xs">
                                    Overdue
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(reminder)}
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                        onClick={() => onDelete(reminder.id)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ReminderManager;
