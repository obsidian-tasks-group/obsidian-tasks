/**
 * @fileoverview UI parts of the Quick Search command implementation.
 * See also `src/Commands/QuickSearchTasks.ts`.
 */

import { type App, Component, MarkdownRenderer, Notice, SuggestModal, setIcon } from 'obsidian';
import type { Task } from '../Task/Task';
import { TASK_FORMATS, getSettings, updateSettings } from '../Config/Settings';
import { TaskLayoutComponent } from '../Layout/TaskLayoutOptions';
import { findIncompleteTasksByDescription } from '../lib/QuickSearchTasks';
import { GlobalFilter } from '../Config/GlobalFilter';
import { getTaskLineAndFile } from '../Obsidian/File';
import { QuickSearchOptionsModal } from './QuickSearchOptionsModal';
import { appendIcon, iconForComponent, labelForComponent, useIconsForDisplay } from './Icons';

interface TaskSearchSuggestionText {
    description: string;
    source: string;
    heading: string;
}

export function taskSearchSuggestionText(task: Task): TaskSearchSuggestionText {
    return {
        description: task.descriptionWithoutTags,
        source: task.path.split('/').pop() ?? task.path,
        heading: task.precedingHeader ?? 'No heading',
    };
}

const metadataComponents = [
    TaskLayoutComponent.DueDate,
    TaskLayoutComponent.ScheduledDate,
    TaskLayoutComponent.StartDate,
    TaskLayoutComponent.Priority,
    TaskLayoutComponent.RecurrenceRule,
];

export function taskSearchMetadataText(task: Task): string[] {
    const serializer = TASK_FORMATS.tasksPluginEmoji.taskSerializer;
    return metadataComponents
        .map((component) => serializer.componentToString(task, false, component).trim())
        .filter((text) => text !== '');
}

/**
 * Show the task's dates, priority and recurrence, each with its icon - or as emoji text if the user prefers.
 */
function renderTaskSearchMetadata(task: Task, el: HTMLElement) {
    if (!useIconsForDisplay()) {
        el.textContent = taskSearchMetadataText(task).join(' ');
        return;
    }

    const serializer = TASK_FORMATS.tasksPluginEmoji.taskSerializer;
    for (const component of metadataComponents) {
        if (serializer.componentToString(task, false, component) === '') {
            continue;
        }
        const iconId = iconForComponent(component, task.priority);
        const item = el.createSpan({ cls: 'tasks-quick-search-result-metadata-item' });
        if (iconId) {
            appendIcon(item, iconId, labelForComponent(component, task.priority));
        }
        const value = serializer.componentValueToString(task, component);
        if (value) {
            item.append(' ' + value);
        }
    }
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

async function saveFuzzyMatchingSetting(
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

        const metadata = el.createDiv({ cls: 'tasks-quick-search-result-metadata' });
        renderTaskSearchMetadata(task, metadata);
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
