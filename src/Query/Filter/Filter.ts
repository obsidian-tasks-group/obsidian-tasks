import type { Task } from '../../Task';

type Filter = (task: Task) => boolean;

export class FilterOrErrorMessage {
    filter: Filter | undefined;
    error: string | undefined;
}
