import type { Moment } from 'moment';
import { TaskLayoutComponent, TaskLayoutOptions } from '../Layout/TaskLayoutOptions';
import { Recurrence } from '../Task/Recurrence';
import { Task } from '../Task/Task';
import { Priority } from '../Task/Priority';
import { TaskRegularExpressions } from '../Task/TaskRegularExpressions';
import type { TaskDetails, TaskSerializer } from '.';

/* Interface describing the symbols that {@link DefaultTaskSerializer}
 * uses to serialize and deserialize tasks.
 *
 * @export
 * @interface DefaultTaskSerializerSymbols
 */
export interface DefaultTaskSerializerSymbols {
    // NEW_TASK_FIELD_EDIT_REQUIRED
    readonly prioritySymbols: {
        Highest: string;
        High: string;
        Medium: string;
        Low: string;
        Lowest: string;
        None: string;
    };
    readonly startDateSymbol: string;
    readonly createdDateSymbol: string;
    readonly scheduledDateSymbol: string;
    readonly dueDateSymbol: string;
    readonly doneDateSymbol: string;
    readonly cancelledDateSymbol: string;
    readonly recurrenceSymbol: string;
    readonly idSymbol: string;
    readonly dependsOnSymbol: string;
    readonly TaskFormatRegularExpressions: {
        priorityRegex: RegExp;
        startDateRegex: RegExp;
        createdDateRegex: RegExp;
        scheduledDateRegex: RegExp;
        dueDateRegex: RegExp;
        doneDateRegex: RegExp;
        cancelledDateRegex: RegExp;
        recurrenceRegex: RegExp;
        idRegex: RegExp;
        dependsOnRegex: RegExp;
    };
}

// The allowed characters in a single task id:
export const taskIdRegex = /[a-zA-Z0-9-_]+/;

// The allowed characters in a comma-separated sequence of task ids:
export const taskIdSequenceRegex = new RegExp(taskIdRegex.source + '( *, *' + taskIdRegex.source + ' *)*');

/**
 * A symbol map for obsidian-task's default task style.
 * Uses emojis to concisely convey meaning
 */
export const DEFAULT_SYMBOLS: DefaultTaskSerializerSymbols = {
    // NEW_TASK_FIELD_EDIT_REQUIRED
    prioritySymbols: {
        Highest: '🔺',
        High: '⏫',
        Medium: '🔼',
        Low: '🔽',
        Lowest: '⏬',
        None: '',
    },
    startDateSymbol: '🛫',
    createdDateSymbol: '➕',
    scheduledDateSymbol: '⏳',
    dueDateSymbol: '📅',
    doneDateSymbol: '✅',
    cancelledDateSymbol: '❌',
    recurrenceSymbol: '🔁',
    dependsOnSymbol: '⛔',
    idSymbol: '🆔',
    TaskFormatRegularExpressions: {
        // The following regex's end with `$` because they will be matched and
        // removed from the end until none are left.
        // \uFE0F? allows an optional Variant Selector 16 on emojis.
        priorityRegex: /([🔺⏫🔼🔽⏬])\uFE0F?$/u,
        startDateRegex: /🛫 *(\d{4}-\d{2}-\d{2})$/u,
        createdDateRegex: /➕ *(\d{4}-\d{2}-\d{2})$/u,
        scheduledDateRegex: /[⏳⌛] *(\d{4}-\d{2}-\d{2})$/u,
        dueDateRegex: /[📅📆🗓] *(\d{4}-\d{2}-\d{2})$/u,
        doneDateRegex: /✅ *(\d{4}-\d{2}-\d{2})$/u,
        cancelledDateRegex: /❌ *(\d{4}-\d{2}-\d{2})$/u,
        recurrenceRegex: /🔁 ?([a-zA-Z0-9, !]+)$/iu,
        dependsOnRegex: new RegExp('⛔\uFE0F? *(' + taskIdSequenceRegex.source + ')$', 'iu'),
        idRegex: new RegExp('🆔 *(' + taskIdRegex.source + ')$', 'iu'),
    },
} as const;

function symbolAndStringValue(shortMode: boolean, symbol: string, value: string) {
    if (!value) return '';
    return shortMode ? ' ' + symbol : ` ${symbol} ${value}`;
}

function symbolAndDateValue(shortMode: boolean, symbol: string, date: moment.Moment | null) {
    if (!date) return '';
    // We could call symbolAndStringValue() to remove a little code repetition,
    // but doing so would do some wasted date-formatting when in 'short mode',
    // so instead we repeat the check on shortMode value.
    return shortMode ? ' ' + symbol : ` ${symbol} ${date.format(TaskRegularExpressions.dateFormat)}`;
}

export function allTaskPluginEmojis() {
    const allEmojis: string[] = [];

    // All the priority emojis:
    Object.values(DEFAULT_SYMBOLS.prioritySymbols).forEach((value) => {
        if (value.length > 0) {
            allEmojis.push(value);
        }
    });

    // All the other field emojis:
    Object.values(DEFAULT_SYMBOLS).forEach((value) => {
        if (typeof value === 'string') {
            allEmojis.push(value);
        }
    });
    return allEmojis;
}

export class DefaultTaskSerializer implements TaskSerializer {
    constructor(public readonly symbols: DefaultTaskSerializerSymbols) {}

    /* Convert a task to its string representation
     *
     * @param task The task to serialize
     *
     * @return The string representation of the task
     */
    public serialize(task: Task): string {
        const taskLayoutOptions = new TaskLayoutOptions();
        let taskString = '';
        const shortMode = false;
        for (const component of taskLayoutOptions.shownComponents) {
            taskString += this.componentToString(task, shortMode, component);
        }
        return taskString;
    }

    /**
     * Renders a specific TaskLayoutComponent of the task (its description, priority, etc) as a string.
     */
    public componentToString(task: Task, shortMode: boolean, component: TaskLayoutComponent) {
        const {
            // NEW_TASK_FIELD_EDIT_REQUIRED
            prioritySymbols,
            startDateSymbol,
            createdDateSymbol,
            scheduledDateSymbol,
            doneDateSymbol,
            cancelledDateSymbol,
            recurrenceSymbol,
            dueDateSymbol,
            dependsOnSymbol,
            idSymbol,
        } = this.symbols;

        switch (component) {
            // NEW_TASK_FIELD_EDIT_REQUIRED
            case TaskLayoutComponent.Description:
                return task.description;
            case TaskLayoutComponent.Priority: {
                let priority: string = '';

                if (task.priority === Priority.Highest) {
                    priority = ' ' + prioritySymbols.Highest;
                } else if (task.priority === Priority.High) {
                    priority = ' ' + prioritySymbols.High;
                } else if (task.priority === Priority.Medium) {
                    priority = ' ' + prioritySymbols.Medium;
                } else if (task.priority === Priority.Low) {
                    priority = ' ' + prioritySymbols.Low;
                } else if (task.priority === Priority.Lowest) {
                    priority = ' ' + prioritySymbols.Lowest;
                }
                return priority;
            }
            case TaskLayoutComponent.StartDate:
                return symbolAndDateValue(shortMode, startDateSymbol, task.startDate);
            case TaskLayoutComponent.CreatedDate:
                return symbolAndDateValue(shortMode, createdDateSymbol, task.createdDate);
            case TaskLayoutComponent.ScheduledDate:
                if (task.scheduledDateIsInferred) return '';
                return symbolAndDateValue(shortMode, scheduledDateSymbol, task.scheduledDate);
            case TaskLayoutComponent.DoneDate:
                return symbolAndDateValue(shortMode, doneDateSymbol, task.doneDate);
            case TaskLayoutComponent.CancelledDate:
                return symbolAndDateValue(shortMode, cancelledDateSymbol, task.cancelledDate);
            case TaskLayoutComponent.DueDate:
                return symbolAndDateValue(shortMode, dueDateSymbol, task.dueDate);
            case TaskLayoutComponent.RecurrenceRule:
                if (!task.recurrence) return '';
                return symbolAndStringValue(shortMode, recurrenceSymbol, task.recurrence.toText());
            case TaskLayoutComponent.DependsOn: {
                if (task.dependsOn.length === 0) return '';
                return symbolAndStringValue(shortMode, dependsOnSymbol, task.dependsOn.join(','));
            }
            case TaskLayoutComponent.Id:
                return symbolAndStringValue(shortMode, idSymbol, task.id);
            case TaskLayoutComponent.BlockLink:
                return task.blockLink ?? '';
            default:
                throw new Error(`Don't know how to render task component of type '${component}'`);
        }
    }

    /**
     * Given the string captured in the first capture group of
     *    {@link DefaultTaskSerializerSymbols.TaskFormatRegularExpressions.priorityRegex},
     *    returns the corresponding Priority level.
     *
     * @param p String captured by priorityRegex
     * @returns Corresponding priority if parsing was successful, otherwise {@link Priority.None}
     */
    protected parsePriority(p: string): Priority {
        const { prioritySymbols } = this.symbols;
        switch (p) {
            case prioritySymbols.Lowest:
                return Priority.Lowest;
            case prioritySymbols.Low:
                return Priority.Low;
            case prioritySymbols.Medium:
                return Priority.Medium;
            case prioritySymbols.High:
                return Priority.High;
            case prioritySymbols.Highest:
                return Priority.Highest;
            default:
                return Priority.None;
        }
    }

    /* Parse TaskDetails from the textual description of a {@link Task}
     *
     * @param line The string to parse
     *
     * @return {TaskDetails}
     */
    public deserialize(line: string): TaskDetails {
        const { TaskFormatRegularExpressions } = this.symbols;

        // Keep matching and removing special strings from the end of the
        // description in any order. The loop should only run once if the
        // strings are in the expected order after the description.
        // NEW_TASK_FIELD_EDIT_REQUIRED
        let matched: boolean;
        let priority: Priority = Priority.None;
        let startDate: Moment | null = null;
        let scheduledDate: Moment | null = null;
        let dueDate: Moment | null = null;
        let doneDate: Moment | null = null;
        let cancelledDate: Moment | null = null;
        let createdDate: Moment | null = null;
        let recurrenceRule: string = '';
        let recurrence: Recurrence | null = null;
        let id: string = '';
        let dependsOn: string[] | [] = [];
        // Tags that are removed from the end while parsing, but we want to add them back for being part of the description.
        // In the original task description they are possibly mixed with other components
        // (e.g. #tag1 <due date> #tag2), they do not have to all trail all task components,
        // but eventually we want to paste them back to the task description at the end
        let trailingTags = '';
        // Add a "max runs" failsafe to never end in an endless loop:
        const maxRuns = 20;
        let runs = 0;
        do {
            // NEW_TASK_FIELD_EDIT_REQUIRED
            matched = false;
            const priorityMatch = line.match(TaskFormatRegularExpressions.priorityRegex);
            if (priorityMatch !== null) {
                priority = this.parsePriority(priorityMatch[1]);
                line = line.replace(TaskFormatRegularExpressions.priorityRegex, '').trim();
                matched = true;
            }

            const doneDateMatch = line.match(TaskFormatRegularExpressions.doneDateRegex);
            if (doneDateMatch !== null) {
                doneDate = window.moment(doneDateMatch[1], TaskRegularExpressions.dateFormat);
                line = line.replace(TaskFormatRegularExpressions.doneDateRegex, '').trim();
                matched = true;
            }

            const cancelledDateMatch = line.match(TaskFormatRegularExpressions.cancelledDateRegex);
            if (cancelledDateMatch !== null) {
                cancelledDate = window.moment(cancelledDateMatch[1], TaskRegularExpressions.dateFormat);
                line = line.replace(TaskFormatRegularExpressions.cancelledDateRegex, '').trim();
                matched = true;
            }

            const dueDateMatch = line.match(TaskFormatRegularExpressions.dueDateRegex);
            if (dueDateMatch !== null) {
                dueDate = window.moment(dueDateMatch[1], TaskRegularExpressions.dateFormat);
                line = line.replace(TaskFormatRegularExpressions.dueDateRegex, '').trim();
                matched = true;
            }

            const scheduledDateMatch = line.match(TaskFormatRegularExpressions.scheduledDateRegex);
            if (scheduledDateMatch !== null) {
                scheduledDate = window.moment(scheduledDateMatch[1], TaskRegularExpressions.dateFormat);
                line = line.replace(TaskFormatRegularExpressions.scheduledDateRegex, '').trim();
                matched = true;
            }

            const startDateMatch = line.match(TaskFormatRegularExpressions.startDateRegex);
            if (startDateMatch !== null) {
                startDate = window.moment(startDateMatch[1], TaskRegularExpressions.dateFormat);
                line = line.replace(TaskFormatRegularExpressions.startDateRegex, '').trim();
                matched = true;
            }

            const createdDateMatch = line.match(TaskFormatRegularExpressions.createdDateRegex);
            if (createdDateMatch !== null) {
                createdDate = window.moment(createdDateMatch[1], TaskRegularExpressions.dateFormat);
                line = line.replace(TaskFormatRegularExpressions.createdDateRegex, '').trim();
                matched = true;
            }

            const recurrenceMatch = line.match(TaskFormatRegularExpressions.recurrenceRegex);
            if (recurrenceMatch !== null) {
                // Save the recurrence rule, but *do not parse it yet*.
                // Creating the Recurrence object requires a reference date (e.g. a due date),
                // and it might appear in the next (earlier in the line) tokens to parse
                recurrenceRule = recurrenceMatch[1].trim();
                line = line.replace(TaskFormatRegularExpressions.recurrenceRegex, '').trim();
                matched = true;
            }

            // Match tags from the end to allow users to mix the various task components with
            // tags. These tags will be added back to the description below
            const tagsMatch = line.match(TaskRegularExpressions.hashTagsFromEnd);
            if (tagsMatch != null) {
                line = line.replace(TaskRegularExpressions.hashTagsFromEnd, '').trim();
                matched = true;
                const tagName = tagsMatch[0].trim();
                // Adding to the left because the matching is done right-to-left
                trailingTags = trailingTags.length > 0 ? [tagName, trailingTags].join(' ') : tagName;
            }

            const idMatch = line.match(TaskFormatRegularExpressions.idRegex);

            if (idMatch != null) {
                line = line.replace(TaskFormatRegularExpressions.idRegex, '').trim();
                id = idMatch[1].trim();
                matched = true;
            }

            const dependsOnMatch = line.match(TaskFormatRegularExpressions.dependsOnRegex);

            if (dependsOnMatch != null) {
                line = line.replace(TaskFormatRegularExpressions.dependsOnRegex, '').trim();
                dependsOn = dependsOnMatch[1]
                    .replace(/ /g, '')
                    .split(',')
                    .filter((item) => item !== '');
                matched = true;
            }

            runs++;
        } while (matched && runs <= maxRuns);

        // Now that we have all the task details, parse the recurrence rule if we found any
        if (recurrenceRule.length > 0) {
            recurrence = Recurrence.fromText({
                recurrenceRuleText: recurrenceRule,
                startDate,
                scheduledDate,
                dueDate,
            });
        }
        // Add back any trailing tags to the description. We removed them so we can parse the rest of the
        // components but now we want them back.
        // The goal is for a task of them form 'Do something #tag1 (due) tomorrow #tag2 (start) today'
        // to actually have the description 'Do something #tag1 #tag2'
        if (trailingTags.length > 0) line += ' ' + trailingTags;

        // NEW_TASK_FIELD_EDIT_REQUIRED
        return {
            description: line,
            priority,
            startDate,
            createdDate,
            scheduledDate,
            dueDate,
            doneDate,
            cancelledDate,
            recurrence,
            id,
            dependsOn,
            tags: Task.extractHashtags(line),
        };
    }
}
