/**
 * The names of the {@link Task} date fields that are used in 'happens' searches.
 *
 * Each name is also the name of a `Moment | null` property of {@link Task}, such as {@link Task.dueDate}.
 * That is checked by the compiler in {@link Task.happensDates}, which is built from this list, in this order.
 *
 * @see HappensDate
 * @see isAHappensDate
 */
// This is deliberately not checked with `satisfies readonly (keyof Task)[]`:
// importing Task in this file would create a circular dependency with Task.ts.
// NEW_TASK_FIELD_EDIT_REQUIRED - if new field is included in 'happens' searches.
export const HAPPENS_DATE_FIELDS = ['startDate', 'scheduledDate', 'dueDate'] as const;

/**
 * One of the names in {@link HAPPENS_DATE_FIELDS}: 'startDate' | 'scheduledDate' | 'dueDate'.
 */
export type HappensDate = (typeof HAPPENS_DATE_FIELDS)[number];

/**
 * The names of all the {@link Task} date fields, in the same order as {@link Task.allDateFields} returns them.
 *
 * Each name is also the name of a `Moment | null` property of {@link Task}, such as {@link Task.createdDate}.
 * The compiler checks that in the test `tests/DateTime/DateFieldTypes.test.ts`,
 * which fails to compile if a date field is added to {@link Task} but not to this list.
 *
 * The matching `TasksDate` properties of {@link Task} have the same names without the 'Date' suffix:
 * `created`, `start`, `scheduled`, `due`, `done` and `cancelled`.
 *
 * {@link Task.allDateFields} is typed `(keyof Task)[]`, so for type-safe code, loop over this list instead:
 *
 * @example
 * for (const field of ALL_DATE_FIELDS) {
 *     const date: Moment | null = task[field]; // Compiles: field is an AllTaskDateFields
 * }
 *
 * @see AllTaskDateFields
 */
// NEW_TASK_FIELD_EDIT_REQUIRED - if new field is a date field.
export const ALL_DATE_FIELDS = [
    'createdDate',
    'startDate',
    'scheduledDate',
    'dueDate',
    'doneDate',
    'cancelledDate',
] as const;

/**
 * One of the names in {@link ALL_DATE_FIELDS}, such as 'dueDate'.
 * Any {@link Task} can be indexed with it, giving a `Moment | null`: `task[field]`.
 *
 * See also {@link Task.allDateFields}
 */
export type AllTaskDateFields = (typeof ALL_DATE_FIELDS)[number];

/**
 * Whether a date field is one of the {@link HAPPENS_DATE_FIELDS}.
 *
 * This is a type guard, so it narrows the type of the field in each branch:
 *
 * @example
 * if (isAHappensDate(field)) {
 *     // field is a HappensDate: 'startDate' | 'scheduledDate' | 'dueDate'
 * } else {
 *     // field is 'createdDate' | 'doneDate' | 'cancelledDate'
 * }
 */
export function isAHappensDate(field: AllTaskDateFields): field is HappensDate {
    return HAPPENS_DATE_FIELDS.some((happensField) => happensField === field);
}
