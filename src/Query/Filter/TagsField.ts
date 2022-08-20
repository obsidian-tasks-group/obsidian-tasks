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
        const result = new FilterOrErrorMessage();
        const tagMatch = Field.getMatch(this.filterRegexp(), line);
        if (tagMatch !== null) {
            const filterMethod = tagMatch[2];

            // Search is done sans the hash. If it is provided then strip it off.
            const search = tagMatch[3].replace(/^#/, '');

            if (filterMethod.includes('include')) {
                const matcher = new SubstringMatcher(search);
                result.filter = (task: Task) =>
                    TextField.maybeNegate(
                        matcher.matchesAnyOf(task.tags),
                        filterMethod,
                    );
            } else {
                result.error = 'do not understand query filter (tag/tags)';
            }
        } else {
            result.error = 'do not understand query filter (tag/tags)';
        }
        return result;
    }

    /**
     * Returns both forms of the field name, singular and plural.
     * @protected
     */
    protected fieldName(): string {
        return 'tag/tags';
    }

    protected filterRegexp(): RegExp {
        return TagsField.tagRegexp;
    }
}
