import { type App, Component, MarkdownRenderer, Notice, SuggestModal, prepareFuzzySearch } from 'obsidian';
import { TASK_FORMATS, getSettings } from '../Config/Settings';
import { TaskLayoutComponent } from '../Layout/TaskLayoutOptions';
import type { Task } from '../Task/Task';
import { getTaskLineAndFile } from '../Obsidian/File';

export interface TaskSearchSuggestionText {
    description: string;
    source: string;
    heading: string;
}

export function filterIncompleteTasksByDescription(
    tasks: readonly Task[],
    query: string,
    includeCompleted = false,
    fuzzyMatching = false,
): Task[] {
    if (query.trim() === '') {
        return [];
    }

    const candidateTasks = tasks.filter((task) => includeCompleted || !task.isDone);
    if (!fuzzyMatching) {
        const normalizedQuery = query.toLowerCase();
        return candidateTasks.filter((task) => task.descriptionWithoutTags.toLowerCase().includes(normalizedQuery));
    }

    const preparedSearch = prepareFuzzySearch(query);
    return candidateTasks
        .map((task) => {
            const match = preparedSearch(task.descriptionWithoutTags);
            return match === null ? null : { task, score: match.score };
        })
        .filter((match): match is { task: Task; score: number } => match !== null)
        .sort((a, b) => b.score - a.score)
        .map((match) => match.task);
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

export class SearchTasksModal extends SuggestModal<Task> {
    private readonly renderComponents: Component[] = [];

    constructor(app: App, private readonly getTasks: () => Task[]) {
        super(app);
        this.setPlaceholder('Search incomplete tasks');
        this.emptyStateText = 'Type to search incomplete tasks.';
    }

    public getSuggestions(query: string): Task[] {
        return filterIncompleteTasksByDescription(
            this.getTasks(),
            query,
            getSettings().searchTasks.includeCompleted,
            getSettings().searchTasks.fuzzyMatching,
        );
    }

    public renderSuggestion(task: Task, el: HTMLElement): void {
        const suggestion = taskSearchSuggestionText(task);
        el.classList.add('tasks-search-result');

        const checkbox = el.ownerDocument.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.status.symbol !== ' ';
        checkbox.tabIndex = -1;
        checkbox.classList.add('task-list-item-checkbox', 'tasks-search-result__checkbox');
        checkbox.setAttribute('aria-label', task.status.name);
        el.appendChild(checkbox);

        const description = el.ownerDocument.createElement('div');
        description.classList.add('tasks-search-result__description');
        el.appendChild(description);
        const renderComponent = new Component();
        renderComponent.load();
        this.renderComponents.push(renderComponent);
        void MarkdownRenderer.render(this.app, task.description, description, task.path, renderComponent).catch(() => {
            description.textContent = suggestion.description;
        });

        const location = el.ownerDocument.createElement('div');
        location.classList.add('tasks-search-result__location');
        location.textContent = `${suggestion.source} · ${suggestion.heading}`;
        el.appendChild(location);

        const metadata = el.ownerDocument.createElement('div');
        metadata.classList.add('tasks-search-result__metadata');
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
