import type { Task } from '../../Task/Task';
import type { Comparator } from '../Sort/Sorter';
import { Sorter } from '../Sort/Sorter';
import type { GrouperFunction } from '../Group/Grouper';
import type { FilterOrErrorMessage } from './FilterOrErrorMessage';
import { FilterInstructions } from './FilterInstructions';
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
    private readonly filterInstructions: FilterInstructions;

    constructor() {
        super();
        this.filterInstructions = new FilterInstructions();
        this.filterInstructions.add(`has ${this.fieldNameSingular()}`, (task: Task) => this.values(task).length > 0);
        this.filterInstructions.add(`has ${this.fieldNamePlural()}`, (task: Task) => this.values(task).length > 0);
        this.filterInstructions.add(`no ${this.fieldNameSingular()}`, (task: Task) => this.values(task).length === 0);
        this.filterInstructions.add(`no ${this.fieldNamePlural()}`, (task: Task) => this.values(task).length === 0);
    }

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        const filterResult = this.filterInstructions.createFilterOrErrorMessage(line);
        if (filterResult.isValid()) {
            return filterResult;
        }

        return super.createFilterOrErrorMessage(line);
    }

    public canCreateFilterForLine(line: string): boolean {
        if (this.filterInstructions.canCreateFilterForLine(line)) {
            return true;
        }

        return super.canCreateFilterForLine(line);
    }

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
        return new Sorter(line, this.fieldNameSingular(), comparator, reverse);
    }

    /**
     * Return a regular expression that will match a correctly-formed
     * instruction line for sorting Tasks by tag.
     *
     * `match[1]` will be either `reverse` or undefined.
     * `match[2]` will be either the tag number or undefined.
     */
    protected sorterRegExp(): RegExp {
        return /^sort by tag( reverse)?[\s]*(\d+)?/i;
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

            const tagA = a.tags[tagInstanceToSortBy];
            const tagB = b.tags[tagInstanceToSortBy];
            return tagA.localeCompare(tagB, undefined, { numeric: true });
        };
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Grouping
    // -----------------------------------------------------------------------------------------------------------------

    public supportsGrouping(): boolean {
        return true;
    }

    public grouper(): GrouperFunction {
        return (task: Task) => {
            if (task.tags.length == 0) {
                return ['(No tags)'];
            }
            return task.tags;
        };
    }
}
