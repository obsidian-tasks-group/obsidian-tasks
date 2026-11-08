// NEW_TASK_FIELD_EDIT_REQUIRED - if new field is included in 'happens' searches.
// This is deliberately not checked with `satisfies readonly (keyof Task)[]`:
// importing Task in this file would create a circular dependency with Task.ts.
export const HAPPENS_DATE_FIELDS = ['startDate', 'scheduledDate', 'dueDate'] as const;
export type HappensDate = (typeof HAPPENS_DATE_FIELDS)[number];

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
 * See also {@link Task.allDateFields}
 */
export type AllTaskDateFields = (typeof ALL_DATE_FIELDS)[number];

export function isAHappensDate(field: AllTaskDateFields): field is HappensDate {
    return HAPPENS_DATE_FIELDS.some((happensField) => happensField === field);
}
