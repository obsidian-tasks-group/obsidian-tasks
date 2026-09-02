import { type App, Component, MarkdownRenderer, Notice, SuggestModal, prepareFuzzySearch, setIcon } from 'obsidian';
import { TASK_FORMATS, getSettings, updateSettings } from '../Config/Settings';
import { TaskLayoutComponent } from '../Layout/TaskLayoutOptions';
import type { Task } from '../Task/Task';
import { getTaskLineAndFile } from '../Obsidian/File';
import { GlobalFilter } from '../Config/GlobalFilter';
import { GlobalQuery } from '../Config/GlobalQuery';
import { SearchInfo } from '../Query/SearchInfo';
import type { Filter } from '../Query/Filter/Filter';
import { TasksFile } from '../Scripting/TasksFile';
import { DescriptionField } from '../Query/Filter/DescriptionField';
import { Sort } from '../Query/Sort/Sort';
import { QuickSearchOptionsModal } from '../Obsidian/QuickSearchOptionsModal';

export interface TaskSearchSuggestionText {
    description: string;
    source: string;
    heading: string;
}

interface TaskDescriptionMatch {
    score: number;
}

type TaskDescriptionMatcher = (description: string) => TaskDescriptionMatch | null;

function getGlobalQueryFilters(): Filter[] {
    // The placeholder presents mechanism results in an exception being thrown
    // if we do not provide a location for the query source file,
    // and the Global Query contains placeholder presets as {{preset.simple}}:
    //     Invalid Global Query: The query looks like it contains a placeholder, with "{{" and "}}"
    //     but no file path has been supplied, so cannot expand placeholder values.
    //     The query is:
    //     {{preset.simple}}
    // So we create a fake location for the query source file:
    const dummyTasksFile = new TasksFile('Dummy Path for Quick Search command.md');

    const query = GlobalQuery.getInstance().query(dummyTasksFile);
    if (query.error !== undefined) {
        // Silently ignore invalid Global Query
        return [];
    }
    return query.filters;
}

function applyFiltersToTask(globalQueryFilters: Filter[], task: Task, searchInfo: SearchInfo): boolean {
    try {
        return globalQueryFilters.every((filter) => filter.filterFunction(task, searchInfo));
    } catch {
        // Silently ignore search-time errors from Global Query - just include the task in the search results
        return true;
    }
}

export function findIncompleteTasksByDescriptionSubstring(tasks: readonly Task[], query: string): Task[] {
    if (query.trim() === '') {
        return [];
    }

    const normalizedQuery = query.toLowerCase();

    return rankMatchingIncompleteTasksByDescription(tasks, (description) =>
        description.toLowerCase().includes(normalizedQuery) ? { score: 0 } : null,
    );
}

export function findIncompleteTasksByFuzzyDescription(tasks: readonly Task[], query: string): Task[] {
    if (query.trim() === '') {
        return [];
    }

    return rankMatchingIncompleteTasksByDescription(tasks, prepareFuzzySearch(query));
}

export function findIncompleteTasksByDescription(tasks: readonly Task[], query: string): Task[] {
    return getSettings().quickSearch.fuzzyMatching
        ? findIncompleteTasksByFuzzyDescription(tasks, query)
        : findIncompleteTasksByDescriptionSubstring(tasks, query);
}

export function rankMatchingIncompleteTasksByDescription(
    tasks: readonly Task[],
    matchDescription: TaskDescriptionMatcher,
): Task[] {
    // Many users will have defined a Global Query in their Tasks settings,
    // such as to tell Tasks to ignore tasks that are in their Template folder.
    // So we want Quick Search to only return tasks that match the filters in the Global Query.
    const globalQueryFilters = getGlobalQueryFilters();
    const searchInfo = SearchInfo.fromAllTasks([...tasks]);

    const matches = tasks
        .filter((task) => !task.isDone && applyFiltersToTask(globalQueryFilters, task, searchInfo))
        .map((task) => {
            const match = matchDescription(task.descriptionWithoutTags);
            return match === null ? null : { task, score: match.score };
        })
        .filter((match): match is { task: Task; score: number } => match !== null);

    const defaultOrder = new Map(
        sortResults(
            matches.map((match) => match.task),
            searchInfo,
        ).map((task, index) => [task, index]),
    );

    return matches
        .sort((a, b) => b.score - a.score || defaultOrder.get(a.task)! - defaultOrder.get(b.task)!)
        .map((match) => match.task);
}

function sortResults(results: Task[], searchInfo: SearchInfo): Task[] {
    // Sort the results by description, using same logic as the 'sort by description' instruction.
    const sorter = new DescriptionField().createNormalSorter();
    // And if the descriptions are identical, sort the tasks by the
    // default Tasks order used in Tasks queries.
    return Sort.by([sorter], results, searchInfo);
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

export async function saveFuzzyMatchingSetting(
    fuzzyMatching: boolean,
    onSaveSettings: () => Promise<void>,
    onChange: () => void,
): Promise<void> {
    updateSettings({ quickSearch: { fuzzyMatching } });
    onChange();
    await onSaveSettings();
}

export class QuickSearchTasksModal extends SuggestModal<Task> {
    private readonly renderComponents: Component[] = [];

    constructor(
        app: App,
        private readonly getTasks: () => Task[],
        private readonly onSaveSettings: () => Promise<void>,
    ) {
        super(app);
        this.setPlaceholder('Search incomplete tasks');
        this.emptyStateText = 'Type to search incomplete tasks.';
    }

    public onOpen(): void {
        super.onOpen();
        this.modalEl.addClass('tasks-quick-search-modal-container');

        const inputContainer = this.inputEl.parentElement ?? this.modalEl;
        const optionsButton = inputContainer.createEl('button', {
            cls: [
                'modal-close-button',
                'mod-raised',
                'clickable-icon',
                'modal-option-button',
                'tasks-quick-search-options-button',
            ],
            attr: { 'aria-label': 'Quick search options' },
        });
        setIcon(optionsButton, 'settings');
        optionsButton.onclick = () => {
            new QuickSearchOptionsModal({
                app: this.app,
                fuzzyMatching: getSettings().quickSearch.fuzzyMatching,
                onChange: async (fuzzyMatching) =>
                    await saveFuzzyMatchingSetting(fuzzyMatching, this.onSaveSettings, () =>
                        this.inputEl.dispatchEvent(new Event('input', { bubbles: true })),
                    ),
            }).open();
        };
    }

    public getSuggestions(query: string): Task[] {
        return findIncompleteTasksByDescription(this.getTasks(), query);
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
