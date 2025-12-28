import { TaskLayoutComponent } from '../Layout/TaskLayoutOptions';
import { OnCompletion } from '../Task/OnCompletion';
import type { Task } from '../Task/Task';
import { Priority } from '../Task/Priority';
import { getSettings } from '../Config/Settings';
import { DefaultTaskSerializer, taskIdRegex, taskIdSequenceRegex } from './DefaultTaskSerializer';

export class CustomTaskSerializer extends DefaultTaskSerializer {
    constructor() {
        // We pass empty symbols initially to the parent, but we immediately override the symbols property
        super({
            prioritySymbols: {
                Highest: '',
                High: '',
                Medium: '',
                Low: '',
                Lowest: '',
                None: '',
            },
            startDateSymbol: '',
            createdDateSymbol: '',
            scheduledDateSymbol: '',
            dueDateSymbol: '',
            doneDateSymbol: '',
            cancelledDateSymbol: '',
            recurrenceSymbol: '',
            onCompletionSymbol: '',
            dependsOnSymbol: '',
            idSymbol: '',
            TaskFormatRegularExpressions: {
                priorityRegex: new RegExp(''),
                startDateRegex: new RegExp(''),
                createdDateRegex: new RegExp(''),
                scheduledDateRegex: new RegExp(''),
                dueDateRegex: new RegExp(''),
                doneDateRegex: new RegExp(''),
                cancelledDateRegex: new RegExp(''),
                recurrenceRegex: new RegExp(''),
                onCompletionRegex: new RegExp(''),
                dependsOnRegex: new RegExp(''),
                idRegex: new RegExp(''),
            },
        });

        Object.defineProperty(this, 'symbols', {
            get: () => this.generateSymbols(),
            configurable: true,
            enumerable: true,
        });
    }

    private getCustomSettings() {
        return getSettings().customFormatSettings;
    }

    protected get dateFormat(): string {
        return this.getCustomSettings().dateFormat;
    }

    private convertDateFormatToRegex(format: string): string {
        let regex = format.replace(/\./g, '\\.');
        regex = regex.replace(/YYYY/g, '\\d{4}');
        regex = regex.replace(/YY/g, '\\d{2}');
        regex = regex.replace(/MM/g, '\\d{2}');
        regex = regex.replace(/DD/g, '\\d{2}');
        return regex;
    }

    private escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    private createPatternRegex(pattern: string, valueRegex: string): RegExp {
        const parts = pattern.split('%value%');
        const escapedParts = parts.map((part) => this.escapeRegExp(part));
        return new RegExp(escapedParts.join(valueRegex) + '$');
    }

    private generateSymbols() {
        const settings = this.getCustomSettings();
        const dateFormatRegex = this.convertDateFormatToRegex(settings.dateFormat);
        const dateCaptureRegex = '(' + dateFormatRegex + ')';

        return {
            prioritySymbols: {
                Highest: settings.priorityHighest,
                High: settings.priorityHigh,
                Medium: settings.priorityMedium,
                Low: settings.priorityLow,
                Lowest: settings.priorityLowest,
                None: settings.priorityNone,
            },
            startDateSymbol: settings.startDatePattern.replace('%value%', ''),
            createdDateSymbol: settings.createdDatePattern.replace('%value%', ''),
            scheduledDateSymbol: settings.scheduledDatePattern.replace('%value%', ''),
            dueDateSymbol: settings.dueDatePattern.replace('%value%', ''),
            doneDateSymbol: settings.doneDatePattern.replace('%value%', ''),
            cancelledDateSymbol: settings.cancelledDatePattern.replace('%value%', ''),
            recurrenceSymbol: settings.recurrencePattern.replace('%value%', ''),
            onCompletionSymbol: settings.onCompletionPattern.replace('%value%', ''),
            dependsOnSymbol: settings.dependsOnPattern.replace('%value%', ''),
            idSymbol: settings.idPattern.replace('%value%', ''),
            TaskFormatRegularExpressions: {
                priorityRegex: new RegExp(
                    '(' +
                        [
                            settings.priorityHighest,
                            settings.priorityHigh,
                            settings.priorityMedium,
                            settings.priorityLow,
                            settings.priorityLowest,
                        ]
                            .filter((s) => s.length > 0)
                            .map((s) => this.escapeRegExp(s))
                            .join('|') +
                        ')',
                ),
                startDateRegex: this.createPatternRegex(settings.startDatePattern, dateCaptureRegex),
                createdDateRegex: this.createPatternRegex(settings.createdDatePattern, dateCaptureRegex),
                scheduledDateRegex: this.createPatternRegex(settings.scheduledDatePattern, dateCaptureRegex),
                dueDateRegex: this.createPatternRegex(settings.dueDatePattern, dateCaptureRegex),
                doneDateRegex: this.createPatternRegex(settings.doneDatePattern, dateCaptureRegex),
                cancelledDateRegex: this.createPatternRegex(settings.cancelledDatePattern, dateCaptureRegex),
                recurrenceRegex: this.createPatternRegex(settings.recurrencePattern, '([a-zA-Z0-9, !]+)'),
                onCompletionRegex: this.createPatternRegex(settings.onCompletionPattern, '([a-zA-Z]+)'),
                dependsOnRegex: this.createPatternRegex(
                    settings.dependsOnPattern,
                    '(' + taskIdSequenceRegex.source + ')',
                ),
                idRegex: this.createPatternRegex(settings.idPattern, '(' + taskIdRegex.source + ')'),
            },
        };
    }

    public componentToString(task: Task, _shortMode: boolean, component: TaskLayoutComponent) {
        const settings = this.getCustomSettings();
        const dateFormat = settings.dateFormat;

        switch (component) {
            case TaskLayoutComponent.Description:
                return task.description;
            case TaskLayoutComponent.Priority: {
                switch (task.priority) {
                    case Priority.Highest:
                        return settings.priorityHighest ? ` ${settings.priorityHighest}` : '';
                    case Priority.High:
                        return settings.priorityHigh ? ` ${settings.priorityHigh}` : '';
                    case Priority.Medium:
                        return settings.priorityMedium ? ` ${settings.priorityMedium}` : '';
                    case Priority.Low:
                        return settings.priorityLow ? ` ${settings.priorityLow}` : '';
                    case Priority.Lowest:
                        return settings.priorityLowest ? ` ${settings.priorityLowest}` : '';
                    default:
                        return '';
                }
            }
            case TaskLayoutComponent.StartDate:
                return task.startDate
                    ? ' ' + settings.startDatePattern.replace('%value%', task.startDate.format(dateFormat))
                    : '';
            case TaskLayoutComponent.CreatedDate:
                return task.createdDate
                    ? ' ' + settings.createdDatePattern.replace('%value%', task.createdDate.format(dateFormat))
                    : '';
            case TaskLayoutComponent.ScheduledDate:
                if (task.scheduledDateIsInferred) return '';
                return task.scheduledDate
                    ? ' ' + settings.scheduledDatePattern.replace('%value%', task.scheduledDate.format(dateFormat))
                    : '';
            case TaskLayoutComponent.DoneDate:
                return task.doneDate
                    ? ' ' + settings.doneDatePattern.replace('%value%', task.doneDate.format(dateFormat))
                    : '';
            case TaskLayoutComponent.CancelledDate:
                return task.cancelledDate
                    ? ' ' + settings.cancelledDatePattern.replace('%value%', task.cancelledDate.format(dateFormat))
                    : '';
            case TaskLayoutComponent.DueDate:
                return task.dueDate
                    ? ' ' + settings.dueDatePattern.replace('%value%', task.dueDate.format(dateFormat))
                    : '';
            case TaskLayoutComponent.RecurrenceRule:
                if (!task.recurrence) return '';
                return ' ' + settings.recurrencePattern.replace('%value%', task.recurrence.toText());
            case TaskLayoutComponent.OnCompletion:
                if (task.onCompletion === OnCompletion.Ignore) return '';
                return ' ' + settings.onCompletionPattern.replace('%value%', task.onCompletion);
            case TaskLayoutComponent.DependsOn: {
                if (task.dependsOn.length === 0) return '';
                return ' ' + settings.dependsOnPattern.replace('%value%', task.dependsOn.join(','));
            }
            case TaskLayoutComponent.Id:
                if (!task.id) return '';
                return ' ' + settings.idPattern.replace('%value%', task.id);
            case TaskLayoutComponent.BlockLink:
                return task.blockLink ?? '';
            default:
                return '';
        }
    }
}
