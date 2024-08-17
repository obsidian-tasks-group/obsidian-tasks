import type { Task } from '../Task/Task';

// NEW_TASK_FIELD_EDIT_REQUIRED - if new field is included in 'happens' searches.
export type HappensDate = keyof Pick<Task, 'startDate' | 'scheduledDate' | 'dueDate'>;

// NEW_TASK_FIELD_EDIT_REQUIRED - if new field is a date field.
export type AllTaskDateFields = keyof Pick<
    Task,
    'cancelledDate' | 'createdDate' | 'doneDate' | 'dueDate' | 'scheduledDate' | 'startDate' // alphabetical order, please.
>;
