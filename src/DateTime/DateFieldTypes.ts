import type { Task } from 'Task/Task';

// NEW_TASK_FIELD_EDIT_REQUIRED - if new field is included in 'happens' searches.
// This is deliberately not checked with `satisfies readonly (keyof Task)[]`:
// importing Task in this file would create a circular dependency with Task.ts.
export const HAPPENS_DATE_FIELDS = ['startDate', 'scheduledDate', 'dueDate'] as const;
export type HappensDate = (typeof HAPPENS_DATE_FIELDS)[number];

// NEW_TASK_FIELD_EDIT_REQUIRED - if new field is a date field.
/**
 * See also {@link Task.allDateFields}
 */
export type AllTaskDateFields = keyof Pick<
    Task,
    'cancelledDate' | 'createdDate' | 'doneDate' | 'dueDate' | 'scheduledDate' | 'startDate' // alphabetical order, please.
>;

export function isAHappensDate(field: AllTaskDateFields) {
    return ['startDate', 'scheduledDate', 'dueDate'].includes(field);
}
