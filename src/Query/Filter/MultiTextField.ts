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
    public abstract fieldNameSingular(): string;

    public fieldNamePlural(): string {
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
     * Returns the field's value, or an empty string if the value is null
     * @param task
     * @public
     */
    public value(task: Task): string {
        return this.values(task).join(', ');
    }

    /**
     * Returns the array of values of this field, or an empty array
     * if the value is null
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
