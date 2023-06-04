import type { Moment } from 'moment';
import { TIME_FORMATS, getSettings } from '../Config/Settings';

export class ReminderSettings {
    notificationTitle: string = 'Task Reminder';
    dateFormat: string = 'YYYY-MM-DD'; // TODO Do not put format strings in user settings
    dailyReminderTime: string = '09:00';
    refreshIntervalMilliseconds: number = 5 * 1000;

    constructor() {}
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
        return this.time.format(TIME_FORMATS.twentyFourHour);
    }

    // TODO Rename this to identicalTo() - for consistency with similar methods...?? Check how Task does it
    isSame(other: Reminder | null) {
        return isReminderSame(this, other);
    }
}

// TODO Move this to a named constructor
export function parseDateTime(dateTime: string): Reminder {
    const reminder = window.moment(dateTime, TIME_FORMATS.twentyFourHour);
    return parseMoment(reminder);
}

// TODO Move this to a named constructor
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
