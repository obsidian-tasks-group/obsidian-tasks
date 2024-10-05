import type { Comparator } from '../Sort/Sorter';
import type { Task } from '../../Task/Task';
import { FilterInstructionsBasedField } from './FilterInstructionsBasedField';

/**
 * Sort tasks in a stable, random order.
 *
 * The sort order changes each day.
 */
export class RandomField extends FilterInstructionsBasedField {
    public fieldName(): string {
        return 'random';
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Sorting
    // -----------------------------------------------------------------------------------------------------------------

    supportsSorting(): boolean {
        return true;
    }

    public comparator(): Comparator {
        return (a: Task, b: Task) => {
            return this.sortKey(a) - this.sortKey(b);
        };
    }

    public sortKey(task: Task): number {
        // Credit:
        //   - @qelo https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/330#discussioncomment-8902878
        //   - Based on TinySimpleHash in https://stackoverflow.com/a/52171480/104370
        const tinySimpleHash = (s: string): number => {
            let i = 0; // Index for iterating over the string
            let h = 9; // Initial hash value

            while (i < s.length) {
                h = Math.imul(h ^ s.charCodeAt(i++), 9 ** 9);
            }

            return h ^ (h >>> 9);
        };

        const currentDate = window.moment().format('Y-MM-DD');
        return tinySimpleHash(currentDate + ' ' + task.description);
    }
}
