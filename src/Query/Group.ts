import type { Task } from '../Task';
import { TaskGroups } from './TaskGroups';
import type { Grouper } from './Grouper';

/**
 * Implementation of the 'group by' instruction.
 */
export class Group {
    /**
     * Group a list of tasks, according to one or more task properties
     * @param grouping 0 or more Grouping values, one per 'group by' line
     * @param tasks The tasks that match the task block's Query
     */
    public static by(grouping: Grouper[], tasks: Task[]): TaskGroups {
        return new TaskGroups(grouping, tasks);
    }

    public static escapeMarkdownCharacters(filename: string) {
        // https://wilsonmar.github.io/markdown-text-for-github-from-html/#special-characters
        return filename.replace(/\\/g, '\\\\').replace(/_/g, '\\_');
    }
}
