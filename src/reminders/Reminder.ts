import type { Moment } from 'moment';

// not used now, might want to give user ability to switch from 12 to 24 hour time
export const reminderSettings = {
    enabled: true,
    dateTimeRegex: 'YYYY-MM-DD h:mm a',
    dailyReminderTime: '09:00 am',
    refreshInterval: 30 * 1000, // Miliseconds
};

export class Reminder {
    public date: Moment;
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

    public getIsCompleted(): boolean {
        return this.isAck;
    }

    public complete(): void {
        this.isAck = true;
    }
}
