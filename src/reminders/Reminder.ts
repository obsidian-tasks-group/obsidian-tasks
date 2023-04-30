import type { Moment } from 'moment';

//TODO erik-handeland: not used now, might want to give user ability to switch from 12 to 24 hour time
// would cause a breaking change if user has reminders set and switches from 12 to 24 hour time
// Either don't give them the option, option with a warning, or option with some kinda conversion?
export const reminderSettings = {
    notificationTitle: 'Task Reminders',
    enabled: true,
    dateTimeFormat: 'YYYY-MM-DD h:mm a',
    dateFormat: 'YYYY-MM-DD',
    dailyReminderTime: '09:00 am',
    refreshInterval: 10 * 1000, // Miliseconds (> 60 seconds is not recommended)
};

export class ReminderList {
    public reminders: Reminder[];

    constructor(times: Reminder[] | null) {
        this.reminders = times ?? [];
    }

    public toString(): string {
        return this.reminders.map((reminder) => `${reminder.toString()}`).join(', ');
    }

    // TODO only used in ReminderDateField need way to teal with modal multiple reminders
    public peek(): Moment | null {
        if (this.reminders.length === 0) {
            return null;
        }
        return this.reminders[0].time;
    }
}

enum ReminderType {
    Date,
    DateTime,
}

export class Reminder {
    public time: Moment;
    public type: ReminderType;

    constructor(time: Moment, type?: ReminderType) {
        this.time = time;
        this.type = type ?? ReminderType.Date;
    }

    public toString(): string {
        if (this.type === ReminderType.Date) {
            return this.time.format(reminderSettings.dateFormat);
        }
        return this.time.format(reminderSettings.dateTimeFormat);
    }
}

export function parseDateTime(dateTime: string): Reminder {
    const reminder = window.moment(dateTime, reminderSettings.dateTimeFormat);
    if (reminder.format('h:mm a') === '12:00 am') {
        //aka .startOf(day) which is the default time for reminders
        return new Reminder(reminder, ReminderType.Date);
    } else {
        return new Reminder(reminder, ReminderType.DateTime);
    }
}
