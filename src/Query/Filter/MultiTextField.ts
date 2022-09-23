import type { Task } from '../../Task';
import type { IStringMatcher } from '../Matchers/IStringMatcher';
import { TextField } from './TextField';
import type { Filter } from './Filter';

/**
 * MultiTextField is an abstract base class to help implement
 * all the filter instructions that act on multiple string values
 * such as the tags.
 */
export abstract class MultiTextField extends TextField {
    /**
     * Returns the singular form of the field's name.
     */
    public abstract fieldNameSingular(): string;

    /**
     * Returns the plural form of the field's name.
     * If not overridden, returns the singular form appended with an "s".
     */
    protected fieldNamePlural(): string {
        return this.fieldNameSingular() + 's';
    }

    public fieldName(): string {
        return `${this.fieldNameSingular()}/${this.fieldNamePlural()}`;
    }

    protected fieldPattern(): string {
        return `${this.fieldNameSingular()}|${this.fieldNamePlural()}`;
    }

    protected operatorPattern(): string {
        return `${super.operatorPattern()}|include|do not include`;
    }

    /**
     * If not overridden, returns a comma-separated concatenation of all
     * the values of this field or an empty string if there are not values
     * @param task
     * @public
     */
    public value(task: Task): string {
        return this.values(task).join(', ');
    }

    /**
     * Returns the array of values of this field, or an empty array
     * if the field has no values
     * @param task
     * @public
     */
    public abstract values(task: Task): string[];

    protected getFilter(matcher: IStringMatcher, negate: boolean): Filter {
        return (task: Task) => {
            const match = matcher!.matchesAnyOf(this.values(task));
            return negate ? !match : match;
        };
    }
}
