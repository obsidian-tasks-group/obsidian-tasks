import type { Task } from '../Task/Task';

export type BacklinksEventHandler = (ev: MouseEvent, task: Task) => Promise<void>;
export type EditButtonClickHandler = (event: MouseEvent, task: Task, allTasks: Task[]) => void;
