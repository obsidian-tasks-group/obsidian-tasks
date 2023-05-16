import type { Moment } from 'moment';
import { TIME_FORMATS, getSettings } from '../Config/Settings';

export class ReminderSettings {
    notificationTitle: string = 'Task Reminder';
    dateFormat: string = 'YYYY-MM-DD';
    dateTimeFormat: string = TIME_FORMATS.twelveHour;
    dailyReminderTime: string = '9:00 am';
    refreshIntervalMilliseconds: number = 5 * 1000;

    constructor() {}
}

export class ReminderList {
    public reminders: Reminder[] = [];

    constructor(time: Moment | null) {
        if (time) {
            this.reminders.push(parseMoment(time));
        }
    }

    public toString(): string {
        return this.reminders.map((reminder) => `${reminder.toString()}`).join(', ');
    }

    // TODO only used in ReminderDateField & Edit modal need way to deal with modal multiple reminders
    public peek(): Moment | null {
        if (this.reminders.length === 0) {
            return null;
        }
        return this.reminders[0].time;
    }

    isSame(other: ReminderList | null) {
        return isRemindersSame(this, other);
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

    isSame(other: Reminder | null) {
        return isReminderSame(this, other);
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

// TODO Add detailed tests
// TODO Move to Reminder class
export function isReminderSame(a: Reminder | null, b: Reminder | null) {
    if (a === null && b !== null) {
        return false;
    } else if (a !== null && b === null) {
        return false;
    } else if (a !== null && b !== null) {
        if (!a.time.isSame(b.time)) {
            return false;
        }
        if (a.type != b.type) {
            return false;
        }
    }

    return true;
}

export function isRemindersSame(a: ReminderList | null, b: ReminderList | null) {
    if (a === null && b !== null) {
        return false;
    } else if (a !== null && b === null) {
        return false;
    } else if (a !== null && b !== null) {
        if (a.reminders.length !== b.reminders.length) {
            return false;
        }

        const sortedA = a.reminders.map((reminder) => reminder.time.valueOf()).sort();
        const sortedB = b.reminders.map((reminder) => reminder.time.valueOf()).sort();

        for (let i = 0; i < sortedA.length; i++) {
            if (sortedA[i] !== sortedB[i]) {
                return false;
            }
        }
    }

    return true;
}
