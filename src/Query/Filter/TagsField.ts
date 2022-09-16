import type { Task } from '../../Task';
import { TextField } from './TextField';

/**
 * Support the 'tag' and 'tags' search instructions.
 *
 * Tags can be searched for with and without the hash tag at the start.
 */
export class TagsField extends TextField {
    /**
     * Allow both forms of the field name, singular and plural,
     * since this field can have multiple values.
     * @protected
     */
    public fieldName(): string {
        return 'tag/tags';
    }

    public value(task: Task): string {
        return task.tags.join(', ');
    }

    public values(task: Task): string[] {
        return task.tags;
    }
}
