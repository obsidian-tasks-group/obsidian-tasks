import type { Moment } from 'moment';

export class Reminder {
    public date: Moment | null;
    private isAck: boolean;

    constructor(date: Moment) {
        this.date = date;
        this.isAck = false;
    }

    public toString(): string {
        return `${this.date?.format('YYYY-MM-DD')}`;
    }

    public getDate(): Moment | null {
        return this.date;
    }

    public getIsCompleted(): boolean {
        return this.isAck;
    }

    public complete(): void {
        this.isAck = true;
    }

    //   public getExpiredReminders(defaultTime: Time): Array<Reminder> {
    //     const now = new Date().getTime();
    //     const result: Array<Reminder> = [];
    //     for (let i = 0; i < this.reminders.length; i++) {
    //       const reminder = this.reminders[i]!;
    //       if (reminder.time.getTimeInMillis(defaultTime) <= now) {
    //         result.push(reminder);
    //       } else {
    //         break;
    //       }
    //     }
    //     return result;
    //   }
}
