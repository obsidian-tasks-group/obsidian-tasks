import type { Moment } from 'moment';

export interface AbstractRecurrenceOptions {
    startDate: Moment | null;
    scheduledDate: Moment | null;
    dueDate: Moment | null;
}
export abstract class AbstractRecurrence {
    public readonly startDate: Moment | null;
    public readonly scheduledDate: Moment | null;
    public readonly dueDate: Moment | null;

    constructor({ startDate, scheduledDate, dueDate }: AbstractRecurrenceOptions) {
        this.startDate = startDate;
        this.scheduledDate = scheduledDate;
        this.dueDate = dueDate;
    }

    public abstract toText(): string;
    public abstract next(today: Moment): AbstractRecurrence | null;
    public abstract identicalTo(other: AbstractRecurrence): boolean;
}
export interface AbstractRecurrenceClassDefinition<
    Options extends AbstractRecurrenceOptions = AbstractRecurrenceOptions,
> {
    fromText(data: {
        recurrenceRuleText: string;
        startDate: Moment | null;
        scheduledDate: Moment | null;
        dueDate: Moment | null;
    }): AbstractRecurrence | null;
    new (options: Options): AbstractRecurrence;
}
