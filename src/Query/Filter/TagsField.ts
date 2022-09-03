import type { Task } from '../../Task';
import { SubstringMatcher } from '../Matchers/SubstringMatcher';
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
        /^(tag|tags) (includes|does not include|include|do not include) (.*)/;

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        const tagMatch = Field.getMatch(this.filterRegexp(), line);
        if (tagMatch === null) {
            return FilterOrErrorMessage.fromError(
                'do not understand query filter (tag/tags)',
            );
        }
        const filterMethod = tagMatch[2];
        const search = tagMatch[3];

        if (filterMethod.includes('include')) {
            const matcher = new SubstringMatcher(search);
            return FilterOrErrorMessage.fromFilter((task: Task) => {
                return TextField.maybeNegate(
                    matcher.matchesAnyOf(task.tags),
                    filterMethod,
                );
            });
        } else {
            return FilterOrErrorMessage.fromError(
                'do not understand query filter (tag/tags)',
            );
        }
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
