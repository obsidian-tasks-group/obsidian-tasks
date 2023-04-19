import type { Moment } from 'moment';

export class Reminder {
    public date: Moment;
    private isAck: boolean;

    constructor(date: Moment) {
        this.date = date;
        this.isAck = false;
    }

    public toString(): string {
        return `${this.date.format('YYYY-MM-DD')}`;
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
