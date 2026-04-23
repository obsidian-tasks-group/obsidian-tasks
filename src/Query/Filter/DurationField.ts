import type { Task } from '../../Task/Task';
import { Explanation } from '../Explain/Explanation';
import type { Comparator } from '../Sort/Sorter';
import type { GrouperFunction } from '../Group/Grouper';
import { Duration } from '../../Task/Duration';
import { Field } from './Field';
import { Filter } from './Filter';
import { FilterOrErrorMessage } from './FilterOrErrorMessage';
import { FilterInstructions } from './FilterInstructions';

/**
 * Support the 'duration' search instruction.
 *
 * Supported filters:
 * - `has duration`
 * - `no duration`
 * - `duration is <value>`
 * - `duration above <value>`
 * - `duration below <value>`
 *
 * Duration values are in formats like '1h30m', '2h', '45m'.
 * Comparisons are done by total minutes, so '90m' and '1h30m' are treated as equal.
 */
export class DurationField extends Field {
    private static readonly durationRegExp = /^duration (is|above|below) ?(.*)/i;

    private readonly filterInstructions: FilterInstructions;

    constructor() {
        super();
        this.filterInstructions = new FilterInstructions();
        this.filterInstructions.add('has duration', (task: Task) => task.duration !== Duration.None);
        this.filterInstructions.add('no duration', (task: Task) => task.duration === Duration.None);
    }

    public fieldName(): string {
        return 'duration';
    }

    protected filterRegExp(): RegExp {
        return DurationField.durationRegExp;
    }

    public canCreateFilterForLine(line: string): boolean {
        return this.filterInstructions.canCreateFilterForLine(line) || super.canCreateFilterForLine(line);
    }

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        const fromInstructions = this.filterInstructions.createFilterOrErrorMessage(line);
        if (fromInstructions.isValid()) {
            return fromInstructions;
        }

        const durationMatch = Field.getMatch(this.filterRegExp(), line);
        if (durationMatch === null) {
            return FilterOrErrorMessage.fromError(line, 'do not understand query filter (duration)');
        }

        const keyword = durationMatch[1].toLowerCase();
        const durationText = durationMatch[2].trim();

        const duration = Duration.fromText(durationText);
        if (duration === null) {
            return FilterOrErrorMessage.fromError(line, `do not understand duration value '${durationText}' in filter`);
        }

        const targetMinutes = duration.totalMinutes;
        let filter;
        switch (keyword) {
            case 'is':
                filter = (task: Task) =>
                    task.duration !== Duration.None && task.duration.totalMinutes === targetMinutes;
                break;
            case 'above':
                filter = (task: Task) => task.duration !== Duration.None && task.duration.totalMinutes > targetMinutes;
                break;
            case 'below':
                filter = (task: Task) => task.duration !== Duration.None && task.duration.totalMinutes < targetMinutes;
                break;
            default:
                return FilterOrErrorMessage.fromError(line, 'do not understand query filter (duration)');
        }

        return FilterOrErrorMessage.fromFilter(new Filter(line, filter, new Explanation(line)));
    }

    protected filterResultIfFieldMissing(): boolean {
        return false;
    }

    public supportsSorting(): boolean {
        return true;
    }

    public comparator(): Comparator {
        return (a: Task, b: Task) => {
            if (a.duration === Duration.None && b.duration === Duration.None) return 0;
            if (a.duration === Duration.None) return 1;
            if (b.duration === Duration.None) return -1;
            return a.duration.totalMinutes - b.duration.totalMinutes;
        };
    }

    public supportsGrouping(): boolean {
        return true;
    }

    public grouper(): GrouperFunction {
        return (task: Task) => {
            if (task.duration === Duration.None) {
                return ['No duration'];
            }
            return [task.duration.toText()];
        };
    }
}
