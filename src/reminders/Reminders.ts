import type { Moment } from 'moment';

//TODO erik-handeland: not used now, might want to give user ability to switch from 12 to 24 hour time
export const reminderSettings = {
    enabled: true,
    dateTimeFormat: 'YYYY-MM-DD h:mm a',
    dailyReminderTime: '09:00 am',
    refreshInterval: 30 * 1000, // Miliseconds
};

export class Reminders {
    public times: Moment[];

    constructor(times: Moment[] | null) {
        this.times = times ?? [];
    }

    public toString(): string {
        return this.times.map((reminder) => `${reminder.format(reminderSettings.dateTimeFormat)}`).join(', ');
    }
}
