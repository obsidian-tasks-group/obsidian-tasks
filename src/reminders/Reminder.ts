import type { Moment } from 'moment';
import { getSettings } from '../Config/Settings';

export class ReminderSettings {
    notificationTitle: string = 'Task Reminders';
    dateFormat: string = 'YYYY-MM-DD';
    dateTimeFormat: string = 'YYYY-MM-DD h:mm a';
    dailyReminderTime: string = '9:00 am';
    refreshInterval: number = 5 * 1000; // in Miliseconds

    constructor() {}
}

export class ReminderList {
    public reminders: Reminder[] = [];

    constructor(times: Moment[] | null) {
        times?.forEach((time) => {
            this.reminders.push(parseMoment(time));
        });
    }

    public toString(): string {
        return this.reminders.map((reminder) => `${reminder.toString()}`).join(', ');
    }

    // TODO only used in ReminderDateField need way to deal with modal multiple reminders
    public peek(): Moment | null {
        if (this.reminders.length === 0) {
            return null;
        }
        return this.reminders[0].time;
    }

    public push(reminder: Moment) {
        this.reminders.push(parseMoment(reminder));
    }
}

export enum ReminderType {
    Date,
    DateTime,
}

export class Reminder {
    public time: Moment;
    public type: ReminderType;
    public notified: boolean = false;

    constructor(time: Moment, type: ReminderType) {
        this.time = time;
        this.type = type;
    }

    public toString(): string {
        const reminderSettings = getSettings().reminderSettings;
        if (this.type === ReminderType.Date) {
            return this.time.format(reminderSettings.dateFormat);
        }
        return this.time.format(reminderSettings.dateTimeFormat);
    }
}

export function parseDateTime(dateTime: string): Reminder {
    const reminderSettings = getSettings().reminderSettings;
    const reminder = window.moment(dateTime, reminderSettings.dateTimeFormat);
    return parseMoment(reminder);
}

export function parseMoment(reminder: Moment): Reminder {
    if (reminder.format('h:mm a') === '12:00 am') {
        //aka .startOf(day) which is the default time for reminders
        return new Reminder(reminder, ReminderType.Date);
    } else {
        return new Reminder(reminder, ReminderType.DateTime);
    }
}
