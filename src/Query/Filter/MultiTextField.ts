import type { Task } from '../../Task/Task';
import type { IStringMatcher } from '../Matchers/IStringMatcher';
import { Grouper } from '../Group/Grouper';
import { TextField } from './TextField';
import type { FilterFunction } from './Filter';

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
    public fieldNamePlural(): string {
        return this.fieldNameSingular() + 's';
    }

    public fieldName(): string {
        return `${this.fieldNameSingular()}/${this.fieldNamePlural()}`;
    }

    protected fieldPattern(): string {
        return `${this.fieldNameSingular()}|${this.fieldNamePlural()}`;
    }

    protected filterOperatorPattern(): string {
        return `${super.filterOperatorPattern()}|include|do not include`;
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

    protected getFilter(matcher: IStringMatcher, negate: boolean): FilterFunction {
        return (task: Task) => {
            const match = matcher!.matchesAnyOf(this.values(task));
            return negate ? !match : match;
        };
    }

    /**
     * This overloads {@link Field.createGrouper} to put a plural field name in the {@link Grouper.property}.
     */
    public createGrouper(reverse: boolean): Grouper {
        return new Grouper(this.grouperInstruction(reverse), this.fieldNamePlural(), this.grouper(), reverse);
    }

    protected grouperRegExp(): RegExp {
        if (!this.supportsGrouping()) {
            throw Error(`grouperRegExp() unimplemented for ${this.fieldNameSingular()}`);
        }

        return new RegExp(`^group by ${this.fieldNamePlural()}( reverse)?$`, 'i');
    }

    protected grouperInstruction(reverse: boolean) {
        let instruction = `group by ${this.fieldNamePlural()}`;
        if (reverse) {
            instruction += ' reverse';
        }
        return instruction;
    }
}
