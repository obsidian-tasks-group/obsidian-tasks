import type { Moment } from 'moment';

//TODO erik-handeland: not used now, might want to give user ability to switch from 12 to 24 hour time
export const reminderSettings = {
    enabled: true,
    dateTimeRegex: 'YYYY-MM-DD h:mm a',
    dailyReminderTime: '09:00 am',
    refreshInterval: 30 * 1000, // Miliseconds
};

export class Reminder {
    private date: Moment;
    private isAck: boolean; // is acknowledged, not sure if needed could just remove from array

    constructor(date: Moment) {
        this.date = date;
        this.isAck = false;
    }

    public toString(): string {
        return `${this.date.format(reminderSettings.dateTimeRegex)}`;
    }

    public getDate(): Moment {
        return this.date;
    }

    public setDate(date: Moment): void {
        this.date = date;
    }

    // could probably remove this and just check if reminder is in array
    public isComplete(): boolean {
        return this.isAck;
    }

    public complete(): void {
        this.isAck = true;
    }
}

export function printReminders(reminders: Reminder[]): string {
    return reminders.map((reminder) => `${reminder.toString()}`).join(', ');
}

export function getReminders(reminders: Reminder[]): Moment[] {
    return reminders.map((reminder) => reminder.getDate());
}
