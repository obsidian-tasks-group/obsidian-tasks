import { TaskLayout } from '../TaskLayout';
import type { TaskLayoutComponent } from '../TaskLayout';
import { Priority, type Task, TaskRegularExpressions } from '../Task';
import type { TaskDetails, TaskSerializer } from '.';

/* Interface describing the symbols that {@link DefaultTaskSerializer}
 * uses to serialize and deserialize tasks.
 *
 * @export
 * @interface DefaultTaskSerializerSymbols
 */
export interface DefaultTaskSerializerSymbols {
    readonly prioritySymbols: {
        High: string;
        Medium: string;
        Low: string;
        None: string;
    };
    readonly startDateSymbol: string;
    readonly createdDateSymbol: string;
    readonly scheduledDateSymbol: string;
    readonly dueDateSymbol: string;
    readonly doneDateSymbol: string;
    readonly recurrenceSymbol: string;
    readonly TaskFormatRegularExpressions: {
        priorityRegex: RegExp;
        startDateRegex: RegExp;
        createdDateRegex: RegExp;
        scheduledDateRegex: RegExp;
        dueDateRegex: RegExp;
        doneDateRegex: RegExp;
        recurrenceRegex: RegExp;
    };
}

/**
 * A symbol map for obsidian-task's default task style.
 * Uses emojis to concisely convey meaning
 */
export const DEFAULT_SYMBOLS: DefaultTaskSerializerSymbols = {
    prioritySymbols: {
        High: '⏫',
        Medium: '🔼',
        Low: '🔽',
        None: '',
    },
    startDateSymbol: '🛫',
    createdDateSymbol: '➕',
    scheduledDateSymbol: '⏳',
    dueDateSymbol: '📅',
    doneDateSymbol: '✅',
    recurrenceSymbol: '🔁',
    TaskFormatRegularExpressions: {
        // The following regex's end with `$` because they will be matched and
        // removed from the end until none are left.
        priorityRegex: /([⏫🔼🔽])$/u,
        startDateRegex: /🛫 *(\d{4}-\d{2}-\d{2})$/u,
        createdDateRegex: /➕ *(\d{4}-\d{2}-\d{2})$/u,
        scheduledDateRegex: /[⏳⌛] *(\d{4}-\d{2}-\d{2})$/u,
        dueDateRegex: /[📅📆🗓] *(\d{4}-\d{2}-\d{2})$/u,
        doneDateRegex: /✅ *(\d{4}-\d{2}-\d{2})$/u,
        recurrenceRegex: /🔁 ?([a-zA-Z0-9, !]+)$/iu,
    },
} as const;

export class DefaultTaskSerializer implements TaskSerializer {
    constructor(public readonly symbols: DefaultTaskSerializerSymbols) {}

    /* Convert a task to its string representation
     *
     * @param task The task to serialize
     *
     * @return The string representation of the task
     */
    public serialize(task: Task): string {
        const taskLayout = new TaskLayout();
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
            createdDateSymbol,
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
            case 'createdDate':
                if (!task.createdDate) return '';
                return layout.options.shortMode
                    ? ' ' + createdDateSymbol
                    : ` ${createdDateSymbol} ${task.createdDate.format(TaskRegularExpressions.dateFormat)}`;
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

    /* Try to parse Task Details from a string
     *
     * @param line The string to parse
     *
     * @return TaskDetails if parsing was successful, null otherwise
     */
    public deserialize(line: string): TaskDetails | null {
        line;
        throw new Error('Not implemented');
    }
}
