import { type App, type Component, Notice, type TFile } from 'obsidian';
import { GlobalFilter } from '../Config/GlobalFilter';
import { GlobalQuery } from '../Config/GlobalQuery';
import { postponeButtonTitle, shouldShowPostponeButton } from '../DateTime/Postponer';
import type { IQuery } from '../IQuery';
import { QueryLayout } from '../Layout/QueryLayout';
import { TaskLayout } from '../Layout/TaskLayout';
import { PerformanceTracker } from '../lib/PerformanceTracker';
import { State } from '../Obsidian/Cache';
import type { GroupDisplayHeading } from '../Query/Group/GroupDisplayHeading';
import type { TaskGroups } from '../Query/Group/TaskGroups';
import { explainResults } from '../Query/QueryRendererHelper';
import type { QueryResult } from '../Query/QueryResult';
import type { TasksFile } from '../Scripting/TasksFile';
import type { ListItem } from '../Task/ListItem';
import { Task } from '../Task/Task';
import { PostponeMenu } from '../ui/Menus/PostponeMenu';
import { showMenu } from '../ui/Menus/TaskEditingMenu';
import type { QueryRendererParameters } from './QueryResultsRenderer';
import { TaskLineRenderer, type TextRenderer, createAndAppendElement } from './TaskLineRenderer';

/**
 * Because properties in QueryResultsRenderer may be modified during the lifetime of this class,
 * we pass in getter functions instead of storing duplicate copies of the values.
 */
interface QueryResultsRendererGetters {
    source: () => string;
    tasksFile: () => TasksFile;
    query: () => IQuery;
}

export class HtmlQueryResultsRenderer {
    // Renders the description in TaskLineRenderer:
    protected readonly textRenderer;

    // Renders the group heading in this class:
    protected readonly renderMarkdown;
    protected readonly obsidianComponent: Component | null;
    protected readonly obsidianApp: App;
    public getters: QueryResultsRendererGetters;

    // TODO access this via getContent() for now
    public content: HTMLDivElement | null = null;

    private readonly taskLineRenderer: TaskLineRenderer;

    private readonly ulElementStack: HTMLUListElement[] = [];
    private readonly renderedListItems: Set<ListItem> = new Set<ListItem>();

    private readonly queryRendererParameters: QueryRendererParameters;

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
        this.renderMarkdown = renderMarkdown;
        this.obsidianComponent = obsidianComponent;
        this.obsidianApp = obsidianApp;
        this.textRenderer = textRenderer;
        this.getters = getters;
        this.queryRendererParameters = queryRendererParameters;

        this.taskLineRenderer = new TaskLineRenderer({
            textRenderer: this.textRenderer,
            obsidianApp: this.obsidianApp,
            obsidianComponent: this.obsidianComponent,
            taskLayoutOptions: this.getters.query().taskLayoutOptions,
            queryLayoutOptions: this.getters.query().queryLayoutOptions,
        });
    }

    public get filePath(): string | undefined {
        return this.getters.tasksFile().path;
    }

    public async renderQuery(state: State | State.Warm, tasks: Task[]) {
        // Don't log anything here, for any state, as it generates huge amounts of
        // console messages in large vaults, if Obsidian was opened with any
        // notes with tasks code blocks in Reading or Live Preview mode.
        const error = this.getters.query().error;
        if (state === State.Warm && error === undefined) {
            await this.renderQuerySearchResults(tasks, state);
        } else if (error) {
            this.renderErrorMessage(error);
        } else {
            this.renderLoadingMessage();
        }
    }

    private getContent() {
        // TODO remove throw
        const content = this.content;
        if (!content) {
            throw new Error('Must initialize content field before calling renderQuery()');
        }
        return content;
    }

    private async renderQuerySearchResults(tasks: Task[], state: State.Warm) {
        const queryResult = this.explainAndPerformSearch(state, tasks);

        if (queryResult.searchErrorMessage !== undefined) {
            // There was an error in the search, for example due to a problem custom function.
            this.renderErrorMessage(queryResult.searchErrorMessage);
            return;
        }

        await this.renderSearchResults(queryResult);
    }

    private explainAndPerformSearch(state: State.Warm, tasks: Task[]) {
        const measureSearch = new PerformanceTracker(`Search: ${this.getters.query().queryId} - ${this.filePath}`);
        measureSearch.start();

        this.getters.query().debug(`[render] Render called: plugin state: ${state}; searching ${tasks.length} tasks`);

        if (this.getters.query().queryLayoutOptions.explainQuery) {
            this.createExplanation();
        }

        const queryResult = this.getters.query().applyQueryToTasks(tasks);

        measureSearch.finish();
        return queryResult;
    }

    private async renderSearchResults(queryResult: QueryResult) {
        const measureRender = new PerformanceTracker(`Render: ${this.getters.query().queryId} - ${this.filePath}`);
        measureRender.start();

        this.addCopyButton(queryResult);

        await this.addAllTaskGroups(queryResult.taskGroups);

        const totalTasksCount = queryResult.totalTasksCount;
        this.addTaskCount(queryResult);

        this.getters.query().debug(`[render] ${totalTasksCount} tasks displayed`);

        measureRender.finish();
    }

    private renderErrorMessage(errorMessage: string) {
        const container = createAndAppendElement('div', this.getContent());
        container.innerHTML = '<pre>' + `Tasks query: ${errorMessage.replace(/\n/g, '<br>')}` + '</pre>';
    }

    private renderLoadingMessage() {
        this.getContent().textContent = 'Loading Tasks ...';
    }

    // Use the 'explain' instruction to enable this
    private createExplanation() {
        const explanationAsString = explainResults(
            this.getters.source(),
            GlobalFilter.getInstance(),
            GlobalQuery.getInstance(),
            this.getters.tasksFile(),
        );

        const explanationsBlock = createAndAppendElement('pre', this.getContent());
        explanationsBlock.classList.add('plugin-tasks-query-explanation');
        explanationsBlock.textContent = explanationAsString;
    }

    private addCopyButton(queryResult: QueryResult) {
        const copyButton = createAndAppendElement('button', this.getContent());
        copyButton.textContent = 'Copy results';
        copyButton.classList.add('plugin-tasks-copy-button');
        copyButton.addEventListener('click', async () => {
            await navigator.clipboard.writeText(queryResult.asMarkdown());
            new Notice('Results copied to clipboard');
        });
    }

    private async addAllTaskGroups(tasksSortedLimitedGrouped: TaskGroups) {
        for (const group of tasksSortedLimitedGrouped.groups) {
            // If there were no 'group by' instructions, group.groupHeadings
            // will be empty, and no headings will be added.
            await this.addGroupHeadings(group.groupHeadings);

            this.renderedListItems.clear();
            // TODO re-extract the method to include this back
            const taskList = createAndAppendElement('ul', this.getContent());
            this.ulElementStack.push(taskList);
            try {
                await this.createTaskList(group.tasks);
            } finally {
                this.ulElementStack.pop();
            }
        }
    }

    private async createTaskList(listItems: ListItem[]): Promise<void> {
        const taskList = this.currentULElement();
        taskList.classList.add(
            'contains-task-list',
            'plugin-tasks-query-result',
            ...new TaskLayout(this.getters.query().taskLayoutOptions).generateHiddenClasses(),
            ...new QueryLayout(this.getters.query().queryLayoutOptions).getHiddenClasses(),
        );

        const groupingAttribute = this.getGroupingAttribute();
        if (groupingAttribute && groupingAttribute.length > 0) taskList.dataset.taskGroupBy = groupingAttribute;

        for (const [listItemIndex, listItem] of listItems.entries()) {
            if (this.getters.query().queryLayoutOptions.hideTree) {
                /* Old-style rendering of tasks:
                 *  - What is rendered:
                 *      - Only task lines that match the query are rendered, as a flat list
                 *  - The order that lines are rendered:
                 *      - Tasks are rendered in the order specified in 'sort by' instructions and default sort order.
                 */
                if (listItem instanceof Task) {
                    await this.addTask(listItem, listItemIndex, []);
                }
            } else {
                /* New-style rendering of tasks:
                 *  - What is rendered:
                 *      - Task lines that match the query are rendered, as a tree.
                 *      - Currently, all child tasks and list items of the found tasks are shown,
                 *        including any child tasks that did not match the query.
                 *  - The order that lines are rendered:
                 *      - The top-level/outermost tasks are sorted in the order specified in 'sort by'
                 *        instructions and default sort order.
                 *      - Child tasks (and list items) are shown in their original order in their Markdown file.
                 */
                await this.addTaskOrListItemAndChildren(listItem, listItemIndex, listItems);
            }
        }
    }

    private willBeRenderedLater(listItem: ListItem, listItems: ListItem[]) {
        const closestParentTask = listItem.findClosestParentTask();
        if (!closestParentTask) {
            return false;
        }

        if (!this.renderedListItems.has(closestParentTask)) {
            // This task is a direct or indirect child of another task that we are waiting to draw,
            // so don't draw it yet, it will be done recursively later.
            if (listItems.includes(closestParentTask)) {
                return true;
            }
        }

        return false;
    }

    private alreadyRendered(listItem: ListItem) {
        return this.renderedListItems.has(listItem);
    }

    private async addTaskOrListItemAndChildren(listItem: ListItem, taskIndex: number, listItems: ListItem[]) {
        if (this.alreadyRendered(listItem)) {
            return;
        }

        if (this.willBeRenderedLater(listItem, listItems)) {
            return;
        }

        await this.createTaskOrListItem(listItem, taskIndex);
        this.renderedListItems.add(listItem);

        for (const childTask of listItem.children) {
            this.renderedListItems.add(childTask);
        }
    }

    private async createTaskOrListItem(listItem: ListItem, taskIndex: number): Promise<void> {
        if (listItem instanceof Task) {
            await this.addTask(listItem, taskIndex, listItem.children);
        } else {
            await this.addListItem(listItem, taskIndex, listItem.children);
        }
    }

    private async addListItem(listItem: ListItem, listItemIndex: number, children: ListItem[]): Promise<void> {
        const listItemElement = await this.taskLineRenderer.renderListItem(
            this.currentULElement(),
            listItem,
            listItemIndex,
        );

        if (children.length > 0) {
            // TODO re-extract the method to include this back
            const taskList1 = createAndAppendElement('ul', listItemElement);
            this.ulElementStack.push(taskList1);
            try {
                await this.createTaskList(children);
            } finally {
                this.ulElementStack.pop();
            }
        }
    }

    private async addTask(task: Task, taskIndex: number, children: ListItem[]): Promise<void> {
        const isFilenameUnique = this.isFilenameUnique({ task }, this.queryRendererParameters.allMarkdownFiles());
        const listItem = await this.taskLineRenderer.renderTaskLine({
            parentUlElement: this.currentULElement(),
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

        if (children.length > 0) {
            // TODO re-extract the method to include this back
            const taskList1 = createAndAppendElement('ul', listItem);
            this.ulElementStack.push(taskList1);
            try {
                await this.createTaskList(children);
            } finally {
                this.ulElementStack.pop();
            }
        }
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

    /**
     * Display headings for a group of tasks.
     * @param groupHeadings - The headings to display. This can be an empty array,
     *                        in which case no headings will be added.
     * @private
     */
    private async addGroupHeadings(groupHeadings: GroupDisplayHeading[]) {
        for (const heading of groupHeadings) {
            await this.addGroupHeading(heading);
        }
    }

    private async addGroupHeading(group: GroupDisplayHeading) {
        // Headings nested to 2 or more levels are all displayed with 'h6:
        let header: keyof HTMLElementTagNameMap = 'h6';
        if (group.nestingLevel === 0) {
            header = 'h4';
        } else if (group.nestingLevel === 1) {
            header = 'h5';
        }

        const headerEl = createAndAppendElement(header, this.getContent());
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
            const taskCount = createAndAppendElement('div', this.getContent());
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
