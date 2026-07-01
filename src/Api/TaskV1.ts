import { GlobalFilter } from '../Config/GlobalFilter';
import { taskFromLine } from '../Commands/CreateOrEditTaskParser';
import { Occurrence } from '../Task/Occurrence';
import { parseOnCompletionValue } from '../Task/OnCompletion';
import { Priority } from '../Task/Priority';
import { Task } from '../Task/Task';
import { TaskRegularExpressions } from '../Task/TaskRegularExpressions';
import { Recurrence } from '../Task/Recurrence';
import { StatusRegistry } from '../Statuses/StatusRegistry';
import type { TaskV1 } from './TasksApiV2';

const formatDate = (date: Moment | null): string | null => {
    return date?.isValid() ? date.format(TaskRegularExpressions.dateFormat) : null;
};

const parseDate = (date: string | null | undefined, fieldName: string): Moment | null | undefined => {
    if (date === undefined) {
        return undefined;
    }
    if (date === null) {
        return null;
    }

    const parsedDate = window.moment(date, TaskRegularExpressions.dateFormat, true);
    if (!parsedDate.isValid()) {
        throw new Error(`Invalid TaskV1 ${fieldName}: '${date}'. Expected YYYY-MM-DD.`);
    }
    return parsedDate;
};

const parsePriority = (priority: string | undefined): Priority | undefined => {
    if (priority === undefined) {
        return undefined;
    }

    if (Object.values(Priority).includes(priority as Priority)) {
        return priority as Priority;
    }

    throw new Error(`Invalid TaskV1 priority: '${priority}'.`);
};

const descriptionWithGlobalFilter = (description: string): string => {
    const globalFilter = GlobalFilter.getInstance();
    if (globalFilter.isEmpty() || globalFilter.includedIn(description)) {
        return description;
    }

    return globalFilter.prependTo(description);
};

const publicDescription = (description: string): string => {
    return GlobalFilter.getInstance().removeAsWordFrom(description);
};

const descriptionWithTags = (description: string, tags: string[] | undefined): string => {
    if (tags === undefined) {
        return description;
    }

    const descriptionWithoutTags = description.replace(TaskRegularExpressions.hashTags, '').replace(/\s+/g, ' ').trim();
    return [descriptionWithoutTags, ...tags].filter((part) => part !== '').join(' ');
};

export type { TaskV1 } from './TasksApiV2';

const randomId = (): string => {
    return Math.random().toString(36).slice(2, 10);
};

/**
 * Converts an internal {@link Task} to its public API v2 representation.
 *
 * @param task The internal task to convert
 * @returns A public {@link TaskV1} object
 */
export const taskToTaskV1 = (task: Task): TaskV1 => {
    return {
        id: task.id,
        description: publicDescription(task.description),
        status: task.status.symbol,
        priority: task.priority.toString(),
        createdDate: formatDate(task.createdDate),
        startDate: formatDate(task.startDate),
        scheduledDate: formatDate(task.scheduledDate),
        dueDate: formatDate(task.dueDate),
        doneDate: formatDate(task.doneDate),
        cancelledDate: formatDate(task.cancelledDate),
        recurrenceRule: task.recurrenceRule,
        onCompletion: task.onCompletion,
        dependsOn: [...task.dependsOn],
        tags: [...task.tags],
        blockLink: task.blockLink,
        originalMarkdown: task.originalMarkdown,
        path: task.path,
        lineNumber: task.lineNumber,
    };
};

/**
 * Creates an internal {@link Task} from a description and optional public API v2 task fields.
 *
 * @param description The task description to use unless overridden by taskData.description
 * @param path The vault-relative path where the task will be written
 * @param taskData Optional public task fields that override parser defaults
 * @returns An internal task ready to serialize
 */
export const taskFromTaskV1 = ({
    description,
    path,
    taskData = {},
}: {
    description: string;
    path: string;
    taskData?: Partial<TaskV1>;
}): Task => {
    const requestedDescription = taskData.description ?? description;
    const filteredDescription = descriptionWithGlobalFilter(descriptionWithTags(requestedDescription, taskData.tags));
    const baseTask = taskFromLine({
        line: `- [ ] ${filteredDescription}`,
        path,
    });

    return taskWithTaskV1Data(baseTask, taskData);
};

/**
 * Applies public API v2 task fields to an existing internal task.
 *
 * @param baseTask The internal task that supplies defaults and file/list metadata
 * @param taskData Public task fields to apply
 * @returns A new internal task with the supplied fields applied
 */
export const taskWithTaskV1Data = (baseTask: Task, taskData: Partial<TaskV1>): Task => {
    const requestedDescription = taskData.description ?? baseTask.description;
    const filteredDescription = descriptionWithGlobalFilter(descriptionWithTags(requestedDescription, taskData.tags));
    const createdDate = parseDate(taskData.createdDate, 'createdDate');
    const startDate = parseDate(taskData.startDate, 'startDate');
    const scheduledDate = parseDate(taskData.scheduledDate, 'scheduledDate');
    const dueDate = parseDate(taskData.dueDate, 'dueDate');
    const doneDate = parseDate(taskData.doneDate, 'doneDate');
    const cancelledDate = parseDate(taskData.cancelledDate, 'cancelledDate');

    const taskStartDate = startDate === undefined ? baseTask.startDate : startDate;
    const taskScheduledDate = scheduledDate === undefined ? baseTask.scheduledDate : scheduledDate;
    const taskDueDate = dueDate === undefined ? baseTask.dueDate : dueDate;
    const recurrence =
        taskData.recurrenceRule === undefined
            ? baseTask.recurrence
            : Recurrence.fromText({
                  recurrenceRuleText: taskData.recurrenceRule,
                  occurrence: new Occurrence({
                      startDate: taskStartDate,
                      scheduledDate: taskScheduledDate,
                      dueDate: taskDueDate,
                  }),
              });

    return new Task({
        ...baseTask,
        description: filteredDescription,
        status:
            taskData.status === undefined
                ? baseTask.status
                : StatusRegistry.getInstance().bySymbolOrCreate(taskData.status),
        priority: parsePriority(taskData.priority) ?? baseTask.priority,
        createdDate: createdDate === undefined ? baseTask.createdDate : createdDate,
        startDate: taskStartDate,
        scheduledDate: taskScheduledDate,
        dueDate: taskDueDate,
        doneDate: doneDate === undefined ? baseTask.doneDate : doneDate,
        cancelledDate: cancelledDate === undefined ? baseTask.cancelledDate : cancelledDate,
        recurrence,
        onCompletion:
            taskData.onCompletion === undefined ? baseTask.onCompletion : parseOnCompletionValue(taskData.onCompletion),
        dependsOn: taskData.dependsOn === undefined ? baseTask.dependsOn : [...taskData.dependsOn],
        id: taskData.id ?? baseTask.id,
        blockLink: taskData.blockLink ?? baseTask.blockLink,
        tags: taskData.tags === undefined ? Task.extractHashtags(filteredDescription) : [...taskData.tags],
        originalMarkdown: '',
        scheduledDateIsInferred: scheduledDate === undefined ? baseTask.scheduledDateIsInferred : false,
    });
};

/**
 * Ensures that a public API v2 task object has a unique ID.
 *
 * @param task The task to inspect
 * @param allTasks All current internal tasks, used to avoid ID collisions
 * @returns The same task object if it already has an ID, otherwise a copy with a generated unique ID
 */
export const ensureTaskHasUniqueId = (task: TaskV1, allTasks: Task[]): TaskV1 => {
    if (task.id !== '') {
        return task;
    }

    const existingIds = new Set(allTasks.map((existingTask) => existingTask.id).filter((id) => id !== ''));
    let id = randomId();
    while (id === '' || existingIds.has(id)) {
        id = randomId();
    }

    return {
        ...task,
        id,
    };
};
