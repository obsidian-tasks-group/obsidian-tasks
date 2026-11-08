import type { Moment } from 'moment';
import type { AllTaskDateFields } from 'DateTime/DateFieldTypes';
import type { Task } from 'Task/Task';

/** The names of all the properties of Task that hold a date, that is, whose type is `Moment | null`. */
type TaskDateFieldNames = { [K in keyof Task]-?: Task[K] extends Moment | null ? K : never }[keyof Task];

describe('DateFieldTypes', () => {
    it('should list every Moment | null field of Task in ALL_DATE_FIELDS', () => {
        // This is checked by the TypeScript compiler (yarn lint), not at runtime.
        // If it fails to compile, a new date field was added to `Task` but not yet to `ALL_DATE_FIELDS`.
        expectTypeOf<TaskDateFieldNames>().toEqualTypeOf<AllTaskDateFields>();
    });
});
