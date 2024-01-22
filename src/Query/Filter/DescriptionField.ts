import { GlobalFilter } from '../../Config/GlobalFilter';
import type { Task } from '../../Task/Task';
import type { Comparator } from '../Sort/Sorter';
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
        return GlobalFilter.getInstance().removeAsSubstringFrom(task.description);
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
            const descriptionA = DescriptionField.cleanDescription(a.description);
            const descriptionB = DescriptionField.cleanDescription(b.description);
            return descriptionA.localeCompare(descriptionB, undefined, { numeric: true });
        };
    }

    /**
     * Removes `*`, `=`, and `[` from the beginning of the description.
     *
     * Will remove them only if they are closing.
     * Properly reads links [[like this|one]] (note pipe).
     */
    public static cleanDescription(description: string): string {
        description = GlobalFilter.getInstance().removeAsSubstringFrom(description);

        const startsWithLinkRegex = /^\[\[?([^\]]*)]]?/;
        const linkRegexMatch = description.match(startsWithLinkRegex);
        if (linkRegexMatch !== null) {
            const innerLinkText = linkRegexMatch[1];
            // For a link, we have to check whether it has another visible name set.
            // For example `[[this is the link|but this is actually shown]]`.
            description =
                innerLinkText.substring(innerLinkText.indexOf('|') + 1) + description.replace(startsWithLinkRegex, '');
        }

        description = this.replaceFormatting(description, /^\*\*([^*]+)\*\*/);
        description = this.replaceFormatting(description, /^\*([^*]+)\*/);
        description = this.replaceFormatting(description, /^==([^=]+)==/);
        description = this.replaceFormatting(description, /^__([^_]+)__/);
        description = this.replaceFormatting(description, /^_([^_]+)_/);

        return description;
    }

    /**
     * Remove some formatting from text
     * @param description
     * @param regExp A regular expression - all matching text is discarded except the first group
     */
    private static replaceFormatting(description: string, regExp: RegExp) {
        const italicBoldRegexMatch = description.match(regExp);
        if (italicBoldRegexMatch !== null) {
            const innerItalicBoldText = italicBoldRegexMatch[1];
            description = innerItalicBoldText + description.replace(regExp, '');
        }
        return description;
    }
}
