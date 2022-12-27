import { getSettings } from '../../Config/Settings';
import type { Task } from '../../Task';
import type { Comparator } from '../Sorter';
import { TextField } from './TextField';

/**
 * Support the 'description' search instruction.
 *
 * Note that DescriptionField.value() returns the description
 * with the global filter (if any) removed.
 */
export class DescriptionField extends TextField {
    public fieldName(): string {
        return 'description';
    }

    /**
     * Return the task's description, with any global tag removed
     *
     * Promoted to public, to enable testing.
     * @param task
     * @public
     */
    public value(task: Task): string {
        // Remove global filter from description match if present.
        // This is necessary to match only on the content of the task, not
        // the global filter.
        const globalFilter = getSettings().globalFilter;
        return task.description.replace(globalFilter, '').trim();
    }

    public supportsSorting(): boolean {
        return true;
    }

    /**
     * Return a function to compare the description by how it is rendered in markdown.
     *
     * Does not use the MarkdownRenderer, but tries to match regexes instead
     * in order to be simpler, faster, and not async.
     *
     * Only searches at the start of the description. Markdown later in the tak is unchanged.
     */
    public comparator(): Comparator {
        return (a: Task, b: Task) => {
            return DescriptionField.cleanDescription(a.description).localeCompare(
                DescriptionField.cleanDescription(b.description),
            );
        };
    }

    /**
     * Removes `*`, `=`, and `[` from the beginning of the description.
     *
     * Will remove them only if they are closing.
     * Properly reads links [[like this|one]] (note pipe).
     */
    public static cleanDescription(description: string): string {
        const globalFilter = getSettings().globalFilter;
        description = description.replace(globalFilter, '').trim();

        const startsWithLinkRegex = /^\[\[?([^\]]*)\]/;
        const linkRegexMatch = description.match(startsWithLinkRegex);
        if (linkRegexMatch !== null) {
            const innerLinkText = linkRegexMatch[1];
            // For a link, we have to check whether it has another visible name set.
            // For example `[[this is the link|but this is actually shown]]`.
            description =
                innerLinkText.substring(innerLinkText.indexOf('|') + 1) + description.replace(startsWithLinkRegex, '');
        }

        const startsWithItalicOrBoldRegex = /^\*\*?([^*]*)\*/;
        const italicBoldRegexMatch = description.match(startsWithItalicOrBoldRegex);
        if (italicBoldRegexMatch !== null) {
            const innerItalicBoldText = italicBoldRegexMatch[1];
            description = innerItalicBoldText + description.replace(startsWithLinkRegex, '');
        }

        const startsWithHighlightRegex = /^==?([^=]*)==/;
        const highlightRegexMatch = description.match(startsWithHighlightRegex);
        if (highlightRegexMatch !== null) {
            const innerHighlightsText = highlightRegexMatch[1];
            description = innerHighlightsText + description.replace(startsWithHighlightRegex, '');
        }

        return description;
    }
}
