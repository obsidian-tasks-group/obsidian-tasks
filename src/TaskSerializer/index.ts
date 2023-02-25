import type { Task } from '../Task';

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

// A propertity bag of fields that can be parsed by a TaskSerializer
// All fields are writeable for convenience

export type TaskDetails = Writeable<
    Pick<Task, 'description' | 'priority' | 'startDate' | 'scheduledDate' | 'dueDate' | 'doneDate' | 'recurrence'> &
        Partial<Pick<Task, 'tags'>>
>;

export interface TaskSerializer {
    deserialize(line: string): TaskDetails | null;
    serialize(task: Task): string;
}

export { DefaultTaskSerializer } from './default';
