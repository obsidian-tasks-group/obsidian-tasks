import type { Moment } from 'moment';
import { TaskLayout } from '../TaskLayout';
import type { TaskLayoutComponent } from '../TaskLayout';
import { Recurrence } from '../Recurrence';
import { Priority, type Task, TaskRegularExpressions } from '../Task';
import type { TaskDetails, TaskSerializer } from '.';

export interface DefaultTaskSerializerSymbols {
    readonly prioritySymbols: {
        High: string;
        Medium: string;
        Low: string;
        None: string;
    };
    readonly startDateSymbol: string;
    readonly scheduledDateSymbol: string;
    readonly dueDateSymbol: string;
    readonly doneDateSymbol: string;
    readonly recurrenceSymbol: string;
    readonly TaskFormatRegularExpressions: {
        priorityRegex: RegExp;
        startDateRegex: RegExp;
        scheduledDateRegex: RegExp;
        dueDateRegex: RegExp;
        doneDateRegex: RegExp;
        recurrenceRegex: RegExp;
    };
}

/**
 * A symbol map for obsidian-task's default task style.
 * Uses emoji's to concisely convey meaning
 */
export const DEFAULT_SYMBOLS: DefaultTaskSerializerSymbols = {
    prioritySymbols: {
        High: '⏫',
        Medium: '🔼',
        Low: '🔽',
        None: '',
    },
    startDateSymbol: '🛫',
    scheduledDateSymbol: '⏳',
    dueDateSymbol: '📅',
    doneDateSymbol: '✅',
    recurrenceSymbol: '🔁',
    TaskFormatRegularExpressions: {
        // The following regex's end with `$` because they will be matched and
        // removed from the end until none are left.
        priorityRegex: /([⏫🔼🔽])$/u,
        startDateRegex: /🛫 *(\d{4}-\d{2}-\d{2})$/u,
        scheduledDateRegex: /[⏳⌛] *(\d{4}-\d{2}-\d{2})$/u,
        dueDateRegex: /[📅📆🗓] *(\d{4}-\d{2}-\d{2})$/u,
        doneDateRegex: /✅ *(\d{4}-\d{2}-\d{2})$/u,
        recurrenceRegex: /🔁 ?([a-zA-Z0-9, !]+)$/iu,
    },
} as const;

export class DefaultTaskSerializer implements TaskSerializer {
    constructor(public readonly symbols: DefaultTaskSerializerSymbols) {}

    public serialize(task: Task): string {
        const taskLayout = new TaskLayout(undefined);
        let taskString = '';
        for (const component of taskLayout.layoutComponents) {
            taskString += this.componentToString(task, taskLayout, component);
        }
        return taskString;
    }

    /**
     * Renders a specific TaskLayoutComponent of the task (its description, priority, etc) as a string.
     */
    public componentToString(task: Task, layout: TaskLayout, component: TaskLayoutComponent) {
        const {
            prioritySymbols,
            startDateSymbol,
            scheduledDateSymbol,
            doneDateSymbol,
            recurrenceSymbol,
            dueDateSymbol,
        } = this.symbols;

        switch (component) {
            case 'description':
                return task.description;
            case 'priority': {
                let priority: string = '';

                if (task.priority === Priority.High) {
                    priority = ' ' + prioritySymbols.High;
                } else if (task.priority === Priority.Medium) {
                    priority = ' ' + prioritySymbols.Medium;
                } else if (task.priority === Priority.Low) {
                    priority = ' ' + prioritySymbols.Low;
                }
                return priority;
            }
            case 'startDate':
                if (!task.startDate) return '';
                return layout.options.shortMode
                    ? ' ' + startDateSymbol
                    : ` ${startDateSymbol} ${task.startDate.format(TaskRegularExpressions.dateFormat)}`;
            case 'scheduledDate':
                if (!task.scheduledDate || task.scheduledDateIsInferred) return '';
                return layout.options.shortMode
                    ? ' ' + scheduledDateSymbol
                    : ` ${scheduledDateSymbol} ${task.scheduledDate.format(TaskRegularExpressions.dateFormat)}`;
            case 'doneDate':
                if (!task.doneDate) return '';
                return layout.options.shortMode
                    ? ' ' + doneDateSymbol
                    : ` ${doneDateSymbol} ${task.doneDate.format(TaskRegularExpressions.dateFormat)}`;
            case 'dueDate':
                if (!task.dueDate) return '';
                return layout.options.shortMode
                    ? ' ' + dueDateSymbol
                    : ` ${dueDateSymbol} ${task.dueDate.format(TaskRegularExpressions.dateFormat)}`;
            case 'recurrenceRule':
                if (!task.recurrence) return '';
                return layout.options.shortMode
                    ? ' ' + recurrenceSymbol
                    : ` ${recurrenceSymbol} ${task.recurrence.toText()}`;
            case 'blockLink':
                return task.blockLink ?? '';
            default:
                throw new Error(`Don't know how to render task component of type '${component}'`);
        }
    }

    /**
     *
     */
    public deserialize(line: string): TaskDetails | null {
        // Keep matching and removing special strings from the end of the
        // description in any order. The loop should only run once if the
        // strings are in the expected order after the description.
        let matched: boolean;
        let priority: Priority = Priority.None;
        let startDate: Moment | null = null;
        let scheduledDate: Moment | null = null;
        let dueDate: Moment | null = null;
        let doneDate: Moment | null = null;
        let recurrenceRule: string = '';
        let recurrence: Recurrence | null = null;
        // let tags: any = []; // Tags that are removed from the end while parsing, but we want to add them back for being part of the description.
        // In the original task description they are possibly mixed with other components
        // (e.g. #tag1 <due date> #tag2), they do not have to all trail all task components,
        // but eventually we want to paste them back to the task description at the end
        let trailingTags = '';
        // Add a "max runs" failsafe to never end in an endless loop:
        const maxRuns = 20;
        let runs = 0;
        const { prioritySymbols, TaskFormatRegularExpressions } = this.symbols;
        do {
            matched = false;
            const priorityMatch = line.match(TaskFormatRegularExpressions.priorityRegex);
            if (priorityMatch !== null) {
                switch (priorityMatch[1]) {
                    case prioritySymbols.Low:
                        priority = Priority.Low;
                        break;
                    case prioritySymbols.Medium:
                        priority = Priority.Medium;
                        break;
                    case prioritySymbols.High:
                        priority = Priority.High;
                        break;
                }

                line = line.replace(TaskFormatRegularExpressions.priorityRegex, '').trim();
                matched = true;
            }

            const doneDateMatch = line.match(TaskFormatRegularExpressions.doneDateRegex);
            if (doneDateMatch !== null) {
                doneDate = window.moment(doneDateMatch[1], TaskRegularExpressions.dateFormat);
                line = line.replace(TaskFormatRegularExpressions.doneDateRegex, '').trim();
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

        return {
            description: line,
            priority,
            startDate,
            scheduledDate,
            dueDate,
            doneDate,
            recurrence,
            tags: undefined,
        };
    }
}
