import type { Task } from '../Task/Task';
import { TASK_FORMATS } from '../Config/Settings';
import { TaskLayoutComponent } from '../Layout/TaskLayoutOptions';
import type { TaskSearchSuggestionText } from '../Commands/QuickSearchTasks';

export function taskSearchSuggestionText(task: Task): TaskSearchSuggestionText {
    return {
        description: task.descriptionWithoutTags,
        source: task.path.split('/').pop() ?? task.path,
        heading: task.precedingHeader ?? 'No heading',
    };
}

export function taskSearchMetadataText(task: Task): string[] {
    const serializer = TASK_FORMATS.tasksPluginEmoji.taskSerializer;
    const components = [
        TaskLayoutComponent.DueDate,
        TaskLayoutComponent.ScheduledDate,
        TaskLayoutComponent.StartDate,
        TaskLayoutComponent.Priority,
        TaskLayoutComponent.RecurrenceRule,
    ];
    return components
        .map((component) => serializer.componentToString(task, false, component).trim())
        .filter((text) => text !== '');
}
