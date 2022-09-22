import type { Task } from '../../Task';
import { MultiTextField } from './TextField';

/**
 * Support the 'tag' and 'tags' search instructions.
 *
 * Tags can be searched for with and without the hash tag at the start.
 */
export class TagsField extends MultiTextField {
    public fieldNameSingular(): string {
        return 'tag';
    }

    public values(task: Task): string[] {
        return task.tags;
    }
}
