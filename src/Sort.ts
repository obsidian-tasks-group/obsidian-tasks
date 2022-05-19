import type moment from 'moment';
import type { Task } from './Task';
import type { Query, SortingProperty } from './Query';

import { getSettings } from './Settings';

type Comparator = (a: Task, b: Task) => number;

export class Sort {
    static tagPropertyInstance: number = 1;

    public static by(query: Pick<Query, 'sorting'>, tasks: Task[]): Task[] {
        const defaultComparators: Comparator[] = [
            Sort.compareByUrgency,
            Sort.compareByStatus,
            Sort.compareByDueDate,
            Sort.compareByPriority,
            Sort.compareByPath,
        ];

        const userComparators: Comparator[] = [];

        for (const { property, reverse, propertyInstance } of query.sorting) {
            const comparator = Sort.comparators[property];
            userComparators.push(
                reverse ? Sort.makeReversedComparator(comparator) : comparator,
            );
            if (property === 'tag') {
                Sort.tagPropertyInstance = propertyInstance;
            }
        }

        return tasks.sort(
            Sort.makeCompositeComparator([
                ...userComparators,
                ...defaultComparators,
            ]),
        );
    }

    private static comparators: Record<SortingProperty, Comparator> = {
        urgency: Sort.compareByUrgency,
        description: Sort.compareByDescription,
        priority: Sort.compareByPriority,
        start: Sort.compareByStartDate,
        scheduled: Sort.compareByScheduledDate,
        due: Sort.compareByDueDate,
        done: Sort.compareByDoneDate,
        path: Sort.compareByPath,
        status: Sort.compareByStatus,
        tag: Sort.compareByTag,
    };

    private static makeReversedComparator(comparator: Comparator): Comparator {
        return (a, b) => (comparator(a, b) * -1) as -1 | 0 | 1;
    }

    private static makeCompositeComparator(
        comparators: Comparator[],
    ): Comparator {
        return (a, b) => {
            for (const comparator of comparators) {
                const result = comparator(a, b);
                if (result !== 0) {
                    return result;
                }
            }
            return 0;
        };
    }

    private static compareByUrgency(a: Task, b: Task): number {
        // Higher urgency should be sorted earlier.
        return b.urgency - a.urgency;
    }

    private static compareByStatus(a: Task, b: Task): -1 | 0 | 1 {
        if (a.status.indicator > b.status.indicator) {
            return 1;
        } else if (a.status.indicator < b.status.indicator) {
            return -1;
        } else {
            return 0;
        }
    }

    private static compareByPriority(a: Task, b: Task): number {
        return a.priority.localeCompare(b.priority);
    }

    private static compareByStartDate(a: Task, b: Task): -1 | 0 | 1 {
        return Sort.compareByDate(a.startDate, b.startDate);
    }

    private static compareByScheduledDate(a: Task, b: Task): -1 | 0 | 1 {
        return Sort.compareByDate(a.scheduledDate, b.scheduledDate);
    }

    private static compareByDueDate(a: Task, b: Task): -1 | 0 | 1 {
        return Sort.compareByDate(a.dueDate, b.dueDate);
    }

    private static compareByDoneDate(a: Task, b: Task): -1 | 0 | 1 {
        return Sort.compareByDate(a.doneDate, b.doneDate);
    }

    private static compareByTag(a: Task, b: Task): -1 | 0 | 1 {
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
        const tagInstanceToSortBy = Sort.tagPropertyInstance - 1;

        if (
            a.tags.length < Sort.tagPropertyInstance &&
            b.tags.length >= Sort.tagPropertyInstance
        ) {
            return 1;
        } else if (
            b.tags.length < Sort.tagPropertyInstance &&
            a.tags.length >= Sort.tagPropertyInstance
        ) {
            return -1;
        } else if (
            a.tags.length < Sort.tagPropertyInstance &&
            b.tags.length < Sort.tagPropertyInstance
        ) {
            return 0;
        }

        if (a.tags[tagInstanceToSortBy] < b.tags[tagInstanceToSortBy]) {
            return -1;
        } else if (a.tags[tagInstanceToSortBy] > b.tags[tagInstanceToSortBy]) {
            return 1;
        } else {
            return 0;
        }
    }

    private static compareByDate(
        a: moment.Moment | null,
        b: moment.Moment | null,
    ): -1 | 0 | 1 {
        if (a !== null && b === null) {
            return -1;
        } else if (a === null && b !== null) {
            return 1;
        } else if (a !== null && b !== null) {
            if (a.isAfter(b)) {
                return 1;
            } else if (a.isBefore(b)) {
                return -1;
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }

    private static compareByPath(a: Task, b: Task): -1 | 0 | 1 {
        if (a.path < b.path) {
            return -1;
        } else if (a.path > b.path) {
            return 1;
        } else {
            return 0;
        }
    }

    /**
     * Compare the description by how it is rendered in markdown.
     *
     * Does not use the MarkdownRenderer, but tries to match regexes instead
     * in order to be simpler, faster, and not async.
     */
    private static compareByDescription(a: Task, b: Task) {
        return Sort.cleanDescription(a.description).localeCompare(
            Sort.cleanDescription(b.description),
        );
    }

    /**
     * Removes `*`, `=`, and `[` from the beginning of the description.
     *
     * Will remove them only if they are closing.
     * Properly reads links [[like this|one]] (note pipe).
     */
    private static cleanDescription(description: string): string {
        const globalFilter = getSettings().globalFilter;
        description = description.replace(globalFilter, '').trim();

        const startsWithLinkRegex = /^\[\[?([^\]]*)\]/;
        const linkRegexMatch = description.match(startsWithLinkRegex);
        if (linkRegexMatch !== null) {
            const innerLinkText = linkRegexMatch[1];
            // For a link, we have to check whether it has another visible name set.
            // For example `[[this is the link|but this is actually shown]]`.
            description =
                innerLinkText.substring(innerLinkText.indexOf('|') + 1) +
                description.replace(startsWithLinkRegex, '');
        }

        const startsWithItalicOrBoldRegex = /^\*\*?([^*]*)\*/;
        const italicBoldRegexMatch = description.match(
            startsWithItalicOrBoldRegex,
        );
        if (italicBoldRegexMatch !== null) {
            const innerItalicBoldText = italicBoldRegexMatch[1];
            description =
                innerItalicBoldText +
                description.replace(startsWithLinkRegex, '');
        }

        const startsWithHighlightRegex = /^==?([^=]*)==/;
        const highlightRegexMatch = description.match(startsWithHighlightRegex);
        if (highlightRegexMatch !== null) {
            const innerHighlightsText = highlightRegexMatch[1];
            description =
                innerHighlightsText +
                description.replace(startsWithHighlightRegex, '');
        }

        return description;
    }
}
