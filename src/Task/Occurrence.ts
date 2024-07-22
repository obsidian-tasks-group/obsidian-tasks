import type { Moment } from 'moment/moment';
import { compareByDate } from '../lib/DateTools';

export class Occurrence {
    readonly startDate: Moment | null;
    readonly scheduledDate: Moment | null;
    readonly dueDate: Moment | null;

    /**
     * The reference date is used to calculate future occurrences.
     *
     * Future occurrences will recur based on the reference date.
     * The reference date is the due date, if it is given.
     * Otherwise the scheduled date, if it is given. And so on.
     *
     * Recurrence of all dates will be kept relative to the reference date.
     * For example: if the due date and the start date are given, the due date
     * is the reference date. Future occurrences will have a start date with the
     * same relative distance to the due date as the original task. For example
     * "starts one week before it is due".
     */
    readonly referenceDate: Moment | null;

    constructor({
        startDate,
        scheduledDate,
        dueDate,
    }: {
        startDate: Moment | null;
        scheduledDate: Moment | null;
        dueDate: Moment | null;
    }) {
        this.startDate = startDate;
        this.scheduledDate = scheduledDate;
        this.dueDate = dueDate;
        this.referenceDate = this.getReferenceDate();
    }

    public getReferenceDate(): Moment | null {
        // Pick the reference date for recurrence based on importance.
        // Assuming due date has the highest priority.
        let referenceDate: Moment | null = null;
        // Clone the moment objects.
        if (this.dueDate) {
            referenceDate = window.moment(this.dueDate);
        } else if (this.scheduledDate) {
            referenceDate = window.moment(this.scheduledDate);
        } else if (this.startDate) {
            referenceDate = window.moment(this.startDate);
        }
        return referenceDate;
    }

    public isIdenticalTo(other: Occurrence) {
        // Compare Date fields
        if (compareByDate(this.startDate, other.startDate) !== 0) {
            return false;
        }
        if (compareByDate(this.scheduledDate, other.scheduledDate) !== 0) {
            return false;
        }
        if (compareByDate(this.dueDate, other.dueDate) !== 0) {
            return false;
        }

        return true;
    }

    /**
     * Gets next occurrence (start/scheduled/due date) keeping the relative distance
     * with the reference date
     *
     * @param nextReferenceDate
     * @param currentOccurrenceDate start/scheduled/due date
     * @private
     */
    public nextOccurrenceDate(currentOccurrenceDate: Moment | null, nextReferenceDate: Date) {
        if (currentOccurrenceDate === null) {
            return null;
        }
        const originalDifference = window.moment.duration(currentOccurrenceDate.diff(this.referenceDate));

        // Cloning so that original won't be manipulated:
        const nextOccurrence = window.moment(nextReferenceDate);
        // Rounding days to handle cross daylight-savings-time recurrences.
        nextOccurrence.add(Math.round(originalDifference.asDays()), 'days');
        return nextOccurrence;
    }

    public next(nextReferenceDate: Date): Occurrence {
        // Only if a reference date is given. A reference date will exist if at
        // least one of the other dates is set.
        if (this.referenceDate === null) {
            return new Occurrence({
                startDate: null,
                scheduledDate: null,
                dueDate: null,
            });
        }

        return new Occurrence({
            startDate: this.nextOccurrenceDate(this.startDate, nextReferenceDate),
            scheduledDate: this.nextOccurrenceDate(this.scheduledDate, nextReferenceDate),
            dueDate: this.nextOccurrenceDate(this.dueDate, nextReferenceDate),
        });
    }
}
