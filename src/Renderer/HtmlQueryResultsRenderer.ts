import { type App, type Component, Notice, type TFile, setIcon, setTooltip } from 'obsidian';
import { postponeButtonTitle, shouldShowPostponeButton } from '../DateTime/Postponer';
import { QueryLayout } from '../Layout/QueryLayout';
import { TaskLayout } from '../Layout/TaskLayout';
import { State } from '../Obsidian/Cache';
import type { GroupDisplayHeading } from '../Query/Group/GroupDisplayHeading';
import type { QueryResult } from '../Query/QueryResult';
import type { ListItem } from '../Task/ListItem';
import type { Task } from '../Task/Task';
import { PostponeMenu } from '../ui/Menus/PostponeMenu';
import { showMenu } from '../ui/Menus/TaskEditingMenu';
import { MarkdownQueryResultsRenderer } from './MarkdownQueryResultsRenderer';
import type { QueryRendererParameters } from './QueryResultsRenderer';
import { QueryResultsRendererBase, type QueryResultsRendererGetters } from './QueryResultsRendererBase';
import { TaskLineRenderer, type TextRenderer, createAndAppendElement } from './TaskLineRenderer';

/**
 * HTML-specific implementation of {@link QueryResultsRendererBase} abstract class.
 *
 * @example
 *   this.htmlRenderer.content = content;
 *   await this.htmlRenderer.renderQuery(state, tasks);
 */
export class HtmlQueryResultsRenderer extends QueryResultsRendererBase {
    // Renders the description in TaskLineRenderer:
    protected readonly textRenderer;

    // Renders the group heading in this class:
    protected readonly renderMarkdown;
    protected readonly obsidianComponent: Component | null;
    protected readonly obsidianApp: App;

    private readonly taskLineRenderer: TaskLineRenderer;

    // document.createElement() creates dummy elements that must be overwritten later
    // with the values of elements that will be rendered
    public content: HTMLDivElement = document.createElement('div');
    private readonly ulElementStack: HTMLUListElement[] = [];
    private lastLIElement: HTMLLIElement = document.createElement('li');

    private readonly queryRendererParameters: QueryRendererParameters;

    private readonly markdownRenderer: MarkdownQueryResultsRenderer;

    constructor(
        renderMarkdown: (
            app: App,
            markdown: string,
            el: HTMLElement,
            sourcePath: string,
            component: Component,
        ) => Promise<void>,
        obsidianComponent: Component | null,
        obsidianApp: App,
        textRenderer: TextRenderer,
        queryRendererParameters: QueryRendererParameters,
        getters: QueryResultsRendererGetters,
    ) {
        super(getters);

        this.renderMarkdown = renderMarkdown;
        this.obsidianComponent = obsidianComponent;
        this.obsidianApp = obsidianApp;
        this.textRenderer = textRenderer;
        this.queryRendererParameters = queryRendererParameters;

        this.taskLineRenderer = new TaskLineRenderer({
            textRenderer: this.textRenderer,
            obsidianApp: this.obsidianApp,
            obsidianComponent: this.obsidianComponent,
            taskLayoutOptions: this.getters.query().taskLayoutOptions,
            queryLayoutOptions: this.getters.query().queryLayoutOptions,
        });

        this.markdownRenderer = new MarkdownQueryResultsRenderer(getters);
    }

    protected beginRender(): void {
        return;
    }

    protected renderSearchResultsHeader(queryResult: QueryResult): void {
        this.addToolbar(queryResult);
    }

    protected renderSearchResultsFooter(queryResult: QueryResult): void {
        this.addTaskCount(queryResult);
    }

    protected renderErrorMessage(errorMessage: string): void {
        const container = createAndAppendElement('div', this.content);
        container.innerHTML = '<pre>' + `Tasks query: ${errorMessage.replace(/\n/g, '<br>')}` + '</pre>';
    }

    protected renderLoadingMessage(): void {
        this.content.textContent = 'Loading Tasks ...';
    }

    protected renderExplanation(explanation: string | null) {
        const explanationsBlock = createAndAppendElement('pre', this.content);
        explanationsBlock.classList.add('plugin-tasks-query-explanation');
        explanationsBlock.textContent = explanation;
    }

    private addToolbar(_queryResult: QueryResult) {
        if (this.getters.query().queryLayoutOptions.hideToolbar) {
            return;
        }

        const toolbar = createAndAppendElement('div', this.content);
        toolbar.classList.add('plugin-tasks-toolbar');
        const copyButton = createAndAppendElement('button', toolbar);
        setIcon(copyButton, 'lucide-copy');
        setTooltip(copyButton, 'Copy results');
        copyButton.addEventListener('click', async () => {
            // TODO reimplement this using QueryResult.asMarkdown() when it supports trees and list items.
            await this.markdownRenderer.renderQuery(State.Warm, this.queryRendererParameters.allTasks());
            await navigator.clipboard.writeText(this.markdownRenderer.markdown);
            new Notice('Results copied to clipboard');
        });
    }

    protected beginTaskList(): void {
        const isFirstTaskListInContainer = this.ulElementStack.length === 0;
        const taskListContainer = isFirstTaskListInContainer ? this.content : this.lastLIElement;
        const taskList = createAndAppendElement('ul', taskListContainer);

        taskList.classList.add(
            'contains-task-list',
            'plugin-tasks-query-result',
            ...new TaskLayout(this.getters.query().taskLayoutOptions).generateHiddenClasses(),
            ...new QueryLayout(this.getters.query().queryLayoutOptions).getHiddenClasses(),
        );

        const groupingAttribute = this.getGroupingAttribute();
        if (groupingAttribute && groupingAttribute.length > 0) {
            taskList.dataset.taskGroupBy = groupingAttribute;
        }

        this.ulElementStack.push(taskList);
    }

    protected endTaskList(): void {
        this.ulElementStack.pop();
    }

    protected beginListItem(): void {
        const taskList = this.currentULElement();
        this.lastLIElement = createAndAppendElement('li', taskList);
    }

    protected async addListItem(listItem: ListItem, listItemIndex: number): Promise<void> {
        await this.taskLineRenderer.renderListItem(this.lastLIElement, listItem, listItemIndex);
    }

    protected async addTask(task: Task, taskIndex: number): Promise<void> {
        const isFilenameUnique = this.isFilenameUnique({ task }, this.queryRendererParameters.allMarkdownFiles());
        const listItem = this.lastLIElement;

        await this.taskLineRenderer.renderTaskLine({
            li: listItem,
            task,
            taskIndex,
            isTaskInQueryFile: this.filePath === task.path,
            isFilenameUnique,
        });

        // Remove all footnotes. They don't re-appear in another document.
        const footnotes = listItem.querySelectorAll('[data-footnote-id]');
        footnotes.forEach((footnote) => footnote.remove());

        const extrasSpan = createAndAppendElement('span', listItem);
        extrasSpan.classList.add('task-extras');

        if (!this.getters.query().queryLayoutOptions.hideUrgency) {
            this.addUrgency(extrasSpan, task);
        }

        const shortMode = this.getters.query().queryLayoutOptions.shortMode;

        if (!this.getters.query().queryLayoutOptions.hideBacklinks) {
            this.addBacklinks(extrasSpan, task, shortMode, isFilenameUnique);
        }

        if (!this.getters.query().queryLayoutOptions.hideEditButton) {
            this.addEditButton(extrasSpan, task);
        }

        if (!this.getters.query().queryLayoutOptions.hidePostponeButton && shouldShowPostponeButton(task)) {
            this.addPostponeButton(extrasSpan, task, shortMode);
        }

        this.currentULElement().appendChild(listItem);
    }

    private addEditButton(listItem: HTMLElement, task: Task) {
        const editTaskPencil = createAndAppendElement('a', listItem);
        editTaskPencil.classList.add('tasks-edit');
        editTaskPencil.title = 'Edit task';
        editTaskPencil.href = '#';

        editTaskPencil.addEventListener('click', (event: MouseEvent) =>
            this.queryRendererParameters.editTaskPencilClickHandler(
                event,
                task,
                this.queryRendererParameters.allTasks(),
            ),
        );
    }

    private addUrgency(listItem: HTMLElement, task: Task) {
        const text = new Intl.NumberFormat().format(task.urgency);
        const span = createAndAppendElement('span', listItem);
        span.textContent = text;
        span.classList.add('tasks-urgency');
    }

    protected async addGroupHeading(group: GroupDisplayHeading) {
        // Headings nested to 2 or more levels are all displayed with 'h6:
        let header: keyof HTMLElementTagNameMap = 'h6';
        if (group.nestingLevel === 0) {
            header = 'h4';
        } else if (group.nestingLevel === 1) {
            header = 'h5';
        }

        const headerEl = createAndAppendElement(header, this.content);
        headerEl.classList.add('tasks-group-heading');

        if (this.obsidianComponent === null) {
            headerEl.textContent = 'For test purposes: ' + group.displayName;
            return;
        }
        await this.renderMarkdown(
            this.obsidianApp,
            group.displayName,
            headerEl,
            this.getters.tasksFile().path,
            this.obsidianComponent,
        );
    }

    private addBacklinks(listItem: HTMLElement, task: Task, shortMode: boolean, isFilenameUnique: boolean | undefined) {
        const backLink = createAndAppendElement('span', listItem);
        backLink.classList.add('tasks-backlink');

        if (!shortMode) {
            backLink.append(' (');
        }

        const link = createAndAppendElement('a', backLink);

        link.rel = 'noopener';
        link.target = '_blank';
        link.classList.add('internal-link');
        if (shortMode) {
            link.classList.add('internal-link-short-mode');
        }

        let linkText: string;
        if (shortMode) {
            linkText = ' 🔗';
        } else {
            linkText = task.getLinkText({ isFilenameUnique }) ?? '';
        }

        link.text = linkText;

        // Go to the line the task is defined at
        link.addEventListener('click', async (ev: MouseEvent) => {
            await this.queryRendererParameters.backlinksClickHandler(ev, task);
        });

        link.addEventListener('mousedown', async (ev: MouseEvent) => {
            await this.queryRendererParameters.backlinksMousedownHandler(ev, task);
        });

        if (!shortMode) {
            backLink.append(')');
        }
    }

    private addPostponeButton(listItem: HTMLElement, task: Task, shortMode: boolean) {
        const amount = 1;
        const timeUnit = 'day';
        const buttonTooltipText = postponeButtonTitle(task, amount, timeUnit);

        const button = createAndAppendElement('a', listItem);
        button.classList.add('tasks-postpone');
        if (shortMode) {
            button.classList.add('tasks-postpone-short-mode');
        }
        button.title = buttonTooltipText;

        button.addEventListener('click', (ev: MouseEvent) => {
            ev.preventDefault(); // suppress the default click behavior
            ev.stopPropagation(); // suppress further event propagation
            PostponeMenu.postponeOnClickCallback(button, task, amount, timeUnit);
        });

        /** Open a context menu on right-click.
         */
        button.addEventListener('contextmenu', async (ev: MouseEvent) => {
            showMenu(ev, new PostponeMenu(button, task));
        });
    }

    private addTaskCount(queryResult: QueryResult) {
        if (!this.getters.query().queryLayoutOptions.hideTaskCount) {
            const taskCount = createAndAppendElement('div', this.content);
            taskCount.classList.add('task-count');
            taskCount.textContent = queryResult.totalTasksCountDisplayText();
        }
    }

    private isFilenameUnique({ task }: { task: Task }, allMarkdownFiles: TFile[]): boolean | undefined {
        // Will match the filename without extension (the file's "basename").
        const filenameMatch = task.path.match(/([^/]*)\..+$/i);
        if (filenameMatch === null) {
            return undefined;
        }

        const filename = filenameMatch[1];
        const allFilesWithSameName = allMarkdownFiles.filter((file: TFile) => {
            if (file.basename === filename) {
                // Found a file with the same name (it might actually be the same file, but we'll take that into account later.)
                return true;
            }
        });

        return allFilesWithSameName.length < 2;
    }

    private getGroupingAttribute() {
        const groupingRules: string[] = [];
        for (const group of this.getters.query().grouping) {
            groupingRules.push(group.property);
        }
        return groupingRules.join(',');
    }

    private currentULElement(): HTMLUListElement {
        return this.ulElementStack[this.ulElementStack.length - 1];
    }
}
