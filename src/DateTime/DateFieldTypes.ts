import type { Task } from '../Task/Task';

export type HappensDate = keyof Pick<Task, 'startDate' | 'scheduledDate' | 'dueDate'>;
