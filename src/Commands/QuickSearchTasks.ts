import { type App, Component, MarkdownRenderer, Notice, SuggestModal } from 'obsidian';
import { TASK_FORMATS } from '../Config/Settings';
import { TaskLayoutComponent } from '../Layout/TaskLayoutOptions';
import type { Task } from '../Task/Task';
import { getTaskLineAndFile } from '../Obsidian/File';
import { GlobalFilter } from '../Config/GlobalFilter';
import { GlobalQuery } from '../Config/GlobalQuery';
import { SearchInfo } from '../Query/SearchInfo';
import type { Filter } from '../Query/Filter/Filter';

export interface TaskSearchSuggestionText {
    description: string;
    source: string;
    heading: string;
}

function getGlobalQueryFilters(): Filter[] {
    return GlobalQuery.getInstance().query().filters;
}

export function filterIncompleteTasksByDescription(tasks: readonly Task[], query: string): Task[] {
    if (query.trim() === '') {
        return [];
    }

    const normalizedQuery = query.toLowerCase();

    // Many users will have defined a Global Query in their Tasks settings,
    // such as to tell Tasks to ignore tasks that are in their Template folder.
    // So we want Quick Search to only return tasks that match the filters in the Global Query.
    const globalQueryFilters = getGlobalQueryFilters();
    const searchInfo = SearchInfo.fromAllTasks([...tasks]);

    return tasks.filter((task) => {
        return (
            !task.isDone &&
            task.descriptionWithoutTags.toLowerCase().includes(normalizedQuery) &&
            globalQueryFilters.every((filter) => filter.filterFunction(task, searchInfo))
        );
    });
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

        const checkbox = el.createEl('input', {
            type: 'checkbox',
            cls: ['task-list-item-checkbox', 'tasks-quick-search-result-checkbox'],
        });
        checkbox.checked = task.isDone;
        checkbox.tabIndex = -1;
        checkbox.setAttribute('aria-label', `Task status: ${task.status.name}`);

        const description = el.createDiv({ cls: 'tasks-quick-search-result-description' });
        const renderComponent = new Component();
        renderComponent.load();
        this.renderComponents.push(renderComponent);
        const markdown = GlobalFilter.getInstance().removeAsWordFromDependingOnSettings(task.description);
        void MarkdownRenderer.render(this.app, markdown, description, task.path, renderComponent).catch(() => {
            description.textContent = suggestion.description;
        });

        el.createDiv({
            cls: 'tasks-quick-search-result-location',
            text: `${suggestion.source} · ${suggestion.heading}`,
        });

        el.createDiv({
            cls: 'tasks-quick-search-result-metadata',
            text: taskSearchMetadataText(task).join(' '),
        });
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
