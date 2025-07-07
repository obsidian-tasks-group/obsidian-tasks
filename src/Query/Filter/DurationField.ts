import type { Task } from '../../Task/Task';
import { Duration } from '../../Task/Duration';
import { Explanation } from '../Explain/Explanation';
import type { Comparator } from '../Sort/Sorter';
import type { GrouperFunction } from '../Group/Grouper';
import { TemplatingPluginTools } from '../../lib/TemplatingPluginTools';
import { Field } from './Field';
import { Filter, type FilterFunction } from './Filter';
import { FilterInstructions } from './FilterInstructions';
import { FilterOrErrorMessage } from './FilterOrErrorMessage';

export type DurationFilterFunction = (duration: Duration) => boolean;

export class DurationField extends Field {
    protected readonly filterInstructions: FilterInstructions;

    constructor(filterInstructions: FilterInstructions | null = null) {
        super();
        if (filterInstructions !== null) {
            this.filterInstructions = filterInstructions;
        } else {
            this.filterInstructions = new FilterInstructions();
            this.filterInstructions.add(`has ${this.fieldName()}`, (task: Task) => task.duration !== Duration.None);
            this.filterInstructions.add(`no ${this.fieldName()}`, (task: Task) => task.duration === Duration.None);
        }
    }

    public fieldName(): string {
        return 'duration';
    }

    public canCreateFilterForLine(line: string): boolean {
        if (this.filterInstructions.canCreateFilterForLine(line)) {
            return true;
        }

        return super.canCreateFilterForLine(line);
    }

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        // There have been multiple "bug reports", where the query had un-expanded
        // template text to signify the search duration.
        // Enough to explicitly trap any such text for duration searches:
        const errorText = this.checkForUnexpandedTemplateText(line);
        if (errorText) {
            return FilterOrErrorMessage.fromError(line, errorText);
        }

        const filterResult = this.filterInstructions.createFilterOrErrorMessage(line);
        if (filterResult.isValid()) {
            return filterResult;
        }

        const fieldNameKeywordDuration = Field.getMatch(this.filterRegExp(), line);
        if (fieldNameKeywordDuration === null) {
            return FilterOrErrorMessage.fromError(line, 'do not understand query filter (' + this.fieldName() + ')');
        }

        const fieldKeyword = fieldNameKeywordDuration[2]?.toLowerCase(); // 'is', 'above', 'under'
        const fieldDurationString = fieldNameKeywordDuration[3]; // The remainder of the instruction

        // Try interpreting everything after the keyword as a duration:
        const fieldDuration = Duration.fromText(fieldDurationString);

        if (!fieldDuration) {
            return FilterOrErrorMessage.fromError(line, 'do not understand ' + this.fieldName());
        }

        const filterFunction = this.buildFilterFunction(fieldKeyword, fieldDuration);

        const explanation = DurationField.buildExplanation(
            this.fieldNameForExplanation(),
            fieldKeyword,
            this.filterResultIfFieldMissing(),
            fieldDuration,
        );
        return FilterOrErrorMessage.fromFilter(new Filter(line, filterFunction, explanation));
    }

    /**
     * Builds function that actually filters the tasks depending on the duration
     * @param fieldKeyword relationship to be held with the duration 'under', 'is', 'above'
     * @param fieldDuration the duration to be used by the filter function
     * @returns the function that filters the tasks
     */
    protected buildFilterFunction(fieldKeyword: string, fieldDuration: Duration): FilterFunction {
        let durationFilter: DurationFilterFunction;
        switch (fieldKeyword) {
            case 'under':
                durationFilter = (duration) => this.compare(duration, fieldDuration) < 0;
                break;
            case 'above':
                durationFilter = (duration) => this.compare(duration, fieldDuration) > 0;
                break;
            case 'is':
            default:
                durationFilter = (duration) => this.compare(duration, fieldDuration) === 0;
                break;
        }
        return this.getFilter(durationFilter);
    }

    protected getFilter(durationFilterFunction: DurationFilterFunction): FilterFunction {
        return (task: Task) => {
            return durationFilterFunction(task.duration);
        };
    }

    protected filterRegExp(): RegExp {
        return new RegExp('^duration( expectation)? (is|above|under) ?(.*)', 'i');
    }

    /**
     * Constructs an Explanation for a duration-based filter
     * @param fieldName - for example, 'due'
     * @param fieldKeyword - one of the keywords like 'before' or 'after'
     * @param filterResultIfFieldMissing - whether the search matches tasks without the requested duration value
     * @param filterDurations - the duration range used in the filter
     */
    public static buildExplanation(
        fieldName: string,
        fieldKeyword: string,
        filterResultIfFieldMissing: boolean,
        filterDurations: Duration,
    ): Explanation {
        const fieldKeywordVerbose = fieldKeyword === 'is' ? 'is' : 'is ' + fieldKeyword;
        let oneLineExplanation = `${fieldName} ${fieldKeywordVerbose} ${filterDurations.toText()}`;
        if (filterResultIfFieldMissing) {
            oneLineExplanation += ` OR no ${fieldName}`;
        }
        return new Explanation(oneLineExplanation);
    }

    protected fieldNameForExplanation() {
        return this.fieldName();
    }

    /**
     * Determine whether a task that does not have a duration value
     * should be treated as a match.
     * @protected
     */
    protected filterResultIfFieldMissing(): boolean {
        return false;
    }

    public supportsSorting(): boolean {
        return true;
    }

    public compare(a: Duration, b: Duration): number {
        if (a === Duration.None || b === Duration.None) {
            return 0;
        }
        return a.hours * 60 + a.minutes - (b.hours * 60 + b.minutes);
    }

    public comparator(): Comparator {
        return (a: Task, b: Task) => {
            return this.compare(a.duration, b.duration);
        };
    }

    public supportsGrouping(): boolean {
        return true;
    }

    public grouper(): GrouperFunction {
        return (task: Task) => {
            const duration = task.duration;
            if (!duration || duration === Duration.None) {
                return ['No ' + this.fieldName()];
            }
            return [duration.toText()];
        };
    }

    private checkForUnexpandedTemplateText(line: string): null | string {
        return new TemplatingPluginTools().findUnexpandedDateText(line);
    }
}
