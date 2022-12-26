import type { Task } from '../../Task';
import type { Comparator } from '../Sorter';
import { Sorter } from '../Sorter';
import { MultiTextField } from './MultiTextField';

/**
 * Support the 'tag' and 'tags' search instructions.
 *
 * Tags can be searched for with and without the hash tag at the start.
 */
export class TagsField extends MultiTextField {
    // -----------------------------------------------------------------------------------------------------------------
    // Filtering
    // -----------------------------------------------------------------------------------------------------------------

    public fieldNameSingular(): string {
        return 'tag';
    }

    public values(task: Task): string[] {
        return task.tags;
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Sorting
    // -----------------------------------------------------------------------------------------------------------------

    public supportsSorting(): boolean {
        return true;
    }

    /** Overridden to add support for tag number.
     *
     * @param line
     */
    public createSorterFromLine(line: string): Sorter | null {
        const match = line.match(this.sorterRegExp());
        if (match === null) {
            return null;
        }

        const reverse = !!match[1];
        const propertyInstance = isNaN(+match[2]) ? 1 : +match[2];
        const comparator = TagsField.makeCompareByTagComparator(propertyInstance);
        return new Sorter(this.fieldNameSingular(), comparator, reverse);
    }

    /**
     * Return a regular expression that will match a correctly-formed
     * instruction line for sorting Tasks by tag.
     *
     * `match[1]` will be either `reverse` or undefined.
     * `match[2]` will be either the tag number or undefined.
     */
    protected sorterRegExp(): RegExp {
        return /^sort by tag( reverse)?[\s]*(\d+)?/;
    }

    /**
     * Create a ${@link Comparator} that sorts by the first tag.
     */
    public comparator(): Comparator {
        return TagsField.makeCompareByTagComparator(1);
    }

    private static makeCompareByTagComparator(propertyInstance: number): Comparator {
        return (a: Task, b: Task) => {
            // If no tags then assume they are equal.
            if (a.tags.length === 0 && b.tags.length === 0) {
                return 0;
            } else if (a.tags.length === 0) {
                // a is less than b
                return 1;
            } else if (b.tags.length === 0) {
                // b is less than a
                return -1;
            }

            // Arrays start at 0 but the users specify a tag starting at 1.
            const tagInstanceToSortBy = propertyInstance - 1;

            if (a.tags.length < propertyInstance && b.tags.length >= propertyInstance) {
                return 1;
            } else if (b.tags.length < propertyInstance && a.tags.length >= propertyInstance) {
                return -1;
            } else if (a.tags.length < propertyInstance && b.tags.length < propertyInstance) {
                return 0;
            }

            if (a.tags[tagInstanceToSortBy] < b.tags[tagInstanceToSortBy]) {
                return -1;
            } else if (a.tags[tagInstanceToSortBy] > b.tags[tagInstanceToSortBy]) {
                return 1;
            } else {
                return 0;
            }
        };
    }
}
