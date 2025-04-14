import type { Moment } from 'moment/moment';
import { compareByDate } from '../DateTime/DateTools';

/**
 * A set of dates on a single instance of {@link Recurrence}.
 *
 * It is responsible for calculating the set of dates for the next occurrence.
 */
export class Occurrence {
    public readonly startDate: Moment | null;
    public readonly scheduledDate: Moment | null;
    public readonly dueDate: Moment | null;

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
    public readonly referenceDate: Moment | null;

    constructor({
        startDate = null,
        scheduledDate = null,
        dueDate = null,
    }: {
        startDate?: Moment | null;
        scheduledDate?: Moment | null;
        dueDate?: Moment | null;
    }) {
        this.startDate = startDate ?? null;
        this.scheduledDate = scheduledDate ?? null;
        this.dueDate = dueDate ?? null;
        this.referenceDate = this.getReferenceDate();
    }

    /**
     *  Pick the reference date for occurrence based on importance.
     *  Assuming due date has the highest priority, then scheduled date,
     *  then start date.
     *
     *  The Moment objects are cloned.
     *
     * @private
     */
    private getReferenceDate(): Moment | null {
        if (this.dueDate) {
            return window.moment(this.dueDate);
        }

        if (this.scheduledDate) {
            return window.moment(this.scheduledDate);
        }

        if (this.startDate) {
            return window.moment(this.startDate);
        }

        return null;
    }

    public isIdenticalTo(other: Occurrence): boolean {
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
     * Provides an {@link Occurrence} with the dates calculated relative to a new reference date.
     *
     * If the occurrence has no reference date, an empty {@link Occurrence} will be returned.
     *
     * @param nextReferenceDate
     * @param removeScheduledDate - Optional boolean to remove the scheduled date from the next occurrence so long as a start or due date exists.
     */
    public next(nextReferenceDate: Date, removeScheduledDate: boolean = false): Occurrence {
        // Only if a reference date is given. A reference date will exist if at
        // least one of the other dates is set.
        if (this.referenceDate === null) {
            return new Occurrence({
                startDate: null,
                scheduledDate: null,
                dueDate: null,
            });
        }

        const hasStartDate = this.startDate !== null;
        const hasDueDate = this.dueDate !== null;
        const canRemoveScheduledDate = hasStartDate || hasDueDate;
        const shouldRemoveScheduledDate = removeScheduledDate && canRemoveScheduledDate;

        const startDate = this.nextOccurrenceDate(this.startDate, nextReferenceDate);
        const scheduledDate = shouldRemoveScheduledDate
            ? null
            : this.nextOccurrenceDate(this.scheduledDate, nextReferenceDate);
        const dueDate = this.nextOccurrenceDate(this.dueDate, nextReferenceDate);

        return new Occurrence({
            startDate,
            scheduledDate,
            dueDate,
        });
    }

    /**
     * Gets next occurrence (start/scheduled/due date) keeping the relative distance
     * with the reference date
     *
     * @param nextReferenceDate
     * @param currentOccurrenceDate start/scheduled/due date
     * @private
     */
    private nextOccurrenceDate(currentOccurrenceDate: Moment | null, nextReferenceDate: Date): Moment | null {
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
}
