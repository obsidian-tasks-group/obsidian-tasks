import type { Comparator } from '../Sort/Sorter';
import type { GrouperFunction } from '../Group/Grouper';
import type { Task } from '../../Task/Task';
import { Explanation } from '../Explain/Explanation';
import { Field } from './Field';
import { Filter, type FilterFunction } from './Filter';
import { FilterInstructions } from './FilterInstructions';
import { FilterOrErrorMessage } from './FilterOrErrorMessage';

const reminderTimeFormat = /^([0-1]\d|2[0-3]):[0-5]\d$/;

/**
 * ReminderTimeField supports filtering, sorting and grouping tasks by {@link Task.reminderTime}.
 *
 * This does not extend {@link DateField}: that base class's filter grammar (calendar-date ranges,
 * parsed via chrono) and grouper (calendar day headings) are both built around a full date, which
 * `reminderTime` does not have - it is a plain 'HH:mm' string, with no date of its own (see
 * {@link Task.reminderDateTime}).
 *
 * Supports:
 * - `has reminder` / `no reminder`
 * - `reminder before|after|on HH:mm`
 * - `sort by reminder` (present values before absent ones, then earliest time first)
 * - `group by reminder` (grouped by exact time, absent last)
 */
export class ReminderTimeField extends Field {
    private readonly filterInstructions = new FilterInstructions();

    constructor() {
        super();
        this.filterInstructions.add('has reminder', (task: Task) => task.reminderTime !== null);
        this.filterInstructions.add('no reminder', (task: Task) => task.reminderTime === null);
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Filtering
    // -----------------------------------------------------------------------------------------------------------------

    public canCreateFilterForLine(line: string): boolean {
        if (this.filterInstructions.canCreateFilterForLine(line)) {
            return true;
        }
        return super.canCreateFilterForLine(line);
    }

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        const instructionResult = this.filterInstructions.createFilterOrErrorMessage(line);
        if (instructionResult.isValid()) {
            return instructionResult;
        }

        const match = Field.getMatch(this.filterRegExp(), line);
        if (match === null) {
            return FilterOrErrorMessage.fromError(line, `do not understand query filter (${this.fieldName()})`);
        }

        const operator = match[1].toLowerCase();
        const timeToCompare = match[2].trim();
        if (!reminderTimeFormat.test(timeToCompare)) {
            return FilterOrErrorMessage.fromError(
                line,
                `do not understand ${this.fieldName()} time - expected a time in HH:mm format, such as '09:00'`,
            );
        }

        const filterFunction: FilterFunction = (task: Task) => {
            const reminderTime = task.reminderTime;
            if (reminderTime === null) {
                return false;
            }
            switch (operator) {
                case 'before':
                    return reminderTime < timeToCompare;
                case 'after':
                    return reminderTime > timeToCompare;
                default:
                    // 'on'
                    return reminderTime === timeToCompare;
            }
        };

        const explanation = new Explanation(`${this.fieldName()} time is ${operator} ${timeToCompare}`);
        return FilterOrErrorMessage.fromFilter(new Filter(line, filterFunction, explanation));
    }

    protected filterRegExp(): RegExp {
        return new RegExp(`^${this.fieldName()} (before|after|on) (.*)`, 'i');
    }

    public fieldName(): string {
        return 'reminder';
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Sorting
    // -----------------------------------------------------------------------------------------------------------------

    public supportsSorting(): boolean {
        return true;
    }

    public comparator(): Comparator {
        return (a: Task, b: Task) => {
            const timeA = a.reminderTime;
            const timeB = b.reminderTime;
            // Tasks with a reminder sort before tasks without one, matching the convention used
            // elsewhere for date fields (see compareByDate()).
            if (timeA !== null && timeB === null) {
                return -1;
            }
            if (timeA === null && timeB !== null) {
                return 1;
            }
            if (timeA === null || timeB === null) {
                return 0;
            }
            // 'HH:mm' strings compare correctly as plain text: same length, zero-padded.
            return timeA.localeCompare(timeB);
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
            // Text sort order already puts 'HH:mm' values before 'No reminder', so no hidden
            // sort-order prefix is needed here (contrast PropertyCategory's %%N%% trick).
            return [task.reminderTime ?? 'No reminder'];
        };
    }
}
