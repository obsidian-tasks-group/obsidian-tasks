import type { Moment } from 'moment';

export class Reminder {
    public date: Moment | null;
    private isAck: boolean;

    constructor(date: Moment) {
        this.date = date;
        this.isAck = false;
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
}
