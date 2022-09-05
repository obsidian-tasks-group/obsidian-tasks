import type { Task } from '../../Task';
import { SubstringMatcher } from '../Matchers/SubstringMatcher';
import { RegexMatcher } from '../Matchers/RegexMatcher';
import type { IStringMatcher } from '../Matchers/IStringMatcher';
import { Field } from './Field';
import { FilterOrErrorMessage } from './Filter';
import { TextField } from './TextField';

/**
 * Support the 'tag' and 'tags' search instructions.
 *
 * Tags can be searched for with and without the hash tag at the start.
 */
export class TagsField extends Field {
    // Handles both ways of referencing the tags query.
    private static readonly tagRegexp =
        /^(tag|tags) (includes|does not include|include|do not include|regex matches|regex does not match) (.*)/;

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        const match = Field.getMatch(this.filterRegexp(), line);
        if (match === null) {
            return FilterOrErrorMessage.fromError(
                `do not understand query filter (${this.fieldName()})`,
            );
        }
        const filterMethod = match[2];
        const search = match[3];
        let matcher: IStringMatcher | null = null;
        if (filterMethod.includes('include')) {
            matcher = new SubstringMatcher(search);
        } else if (filterMethod.includes('regex')) {
            matcher = RegexMatcher.validateAndConstruct(search);
            if (matcher === null) {
                return FilterOrErrorMessage.fromError(
                    `cannot parse regex (${this.fieldName()}); check your leading and trailing slashes for your query`,
                );
            }
        }

        if (matcher === null) {
            // It's likely this can now never be reached.
            // Retained for safety, for now.
            return FilterOrErrorMessage.fromError(
                `do not understand query filter (${this.fieldName()})`,
            );
        }

        return FilterOrErrorMessage.fromFilter((task: Task) => {
            return TextField.maybeNegate(
                matcher!.matchesAnyOf(task.tags),
                filterMethod,
            );
        });
    }

    /**
     * Returns both forms of the field name, singular and plural.
     * @protected
     */
    public fieldName(): string {
        return 'tag/tags';
    }

    protected filterRegexp(): RegExp {
        return TagsField.tagRegexp;
    }
}
