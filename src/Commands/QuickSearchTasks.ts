import { type App, Component, MarkdownRenderer, Notice, SuggestModal } from 'obsidian';
import { TASK_FORMATS } from '../Config/Settings';
import { TaskLayoutComponent } from '../Layout/TaskLayoutOptions';
import type { Task } from '../Task/Task';
import { getTaskLineAndFile } from '../Obsidian/File';

export interface TaskSearchSuggestionText {
    description: string;
    source: string;
    heading: string;
}

export function filterIncompleteTasksByDescription(tasks: readonly Task[], query: string): Task[] {
    if (query.trim() === '') {
        return [];
    }

    const normalizedQuery = query.toLowerCase();
    return tasks.filter((task) => !task.isDone && task.descriptionWithoutTags.toLowerCase().includes(normalizedQuery));
}

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

export async function openTaskAtSourceLocation(task: Task, app: App): Promise<void> {
    const result = await getTaskLineAndFile(task, app.vault);
    if (result === undefined) {
        // The source file or task can change after the task cache was last refreshed.
        const message = 'Tasks: Could not open the selected task.\nIt may have changed. Try searching again.';
        console.warn(message);
        new Notice(message);
        return;
    }

    const [line, file] = result;
    try {
        await app.workspace.getLeaf(false).openFile(file, { eState: { line } });
    } catch (error) {
        console.error('Tasks: Could not open task source.', error);
        new Notice('Tasks: Could not open task source.');
    }
}

export class QuickSearchTasksModal extends SuggestModal<Task> {
    private readonly renderComponents: Component[] = [];

    constructor(app: App, private readonly getTasks: () => Task[]) {
        super(app);
        this.setPlaceholder('Search incomplete tasks');
        this.emptyStateText = 'Type to search incomplete tasks.';
    }

    public getSuggestions(query: string): Task[] {
        return filterIncompleteTasksByDescription(this.getTasks(), query);
    }

    public renderSuggestion(task: Task, el: HTMLElement): void {
        const suggestion = taskSearchSuggestionText(task);
        el.classList.add('tasks-quick-search-result');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.isDone;
        checkbox.tabIndex = -1;
        checkbox.classList.add('task-list-item-checkbox', 'tasks-quick-search-result-checkbox');
        checkbox.setAttribute('aria-label', `Task status: ${task.status.name}`);
        el.appendChild(checkbox);

        const description = document.createElement('div');
        description.classList.add('tasks-quick-search-result-description');
        el.appendChild(description);
        const renderComponent = new Component();
        renderComponent.load();
        this.renderComponents.push(renderComponent);
        void MarkdownRenderer.render(this.app, task.description, description, task.path, renderComponent).catch(() => {
            description.textContent = suggestion.description;
        });

        const location = document.createElement('div');
        location.classList.add('tasks-quick-search-result-location');
        location.textContent = `${suggestion.source} · ${suggestion.heading}`;
        el.appendChild(location);

        const metadata = document.createElement('div');
        metadata.classList.add('tasks-quick-search-result-metadata');
        metadata.textContent = taskSearchMetadataText(task).join(' ');
        el.appendChild(metadata);
    }

    public onChooseSuggestion(task: Task, _evt: MouseEvent | KeyboardEvent): void {
        void openTaskAtSourceLocation(task, this.app);
    }

    public onClose(): void {
        this.renderComponents.forEach((component) => component.unload());
        this.renderComponents.length = 0;
        super.onClose();
    }
}
