import { type App, type Component, Notice, type TFile } from 'obsidian';
import { postponeButtonTitle, shouldShowPostponeButton } from '../DateTime/Postponer';
import { QueryLayout } from '../Layout/QueryLayout';
import { TaskLayout } from '../Layout/TaskLayout';
import type { GroupDisplayHeading } from '../Query/Group/GroupDisplayHeading';
import type { TaskGroup } from '../Query/Group/TaskGroup';
import type { QueryResult } from '../Query/QueryResult';
import type { ListItem } from '../Task/ListItem';
import type { Task } from '../Task/Task';
import { PostponeMenu } from '../ui/Menus/PostponeMenu';
import { showMenu } from '../ui/Menus/TaskEditingMenu';
import type { QueryRendererParameters } from './QueryResultsRenderer';
import { QueryResultsRendererBase, type QueryResultsRendererGetters } from './QueryResultsRendererBase';
import { TaskLineRenderer, type TextRenderer, createAndAppendElement } from './TaskLineRenderer';

export class HtmlQueryResultsRenderer extends QueryResultsRendererBase {
    // Renders the description in TaskLineRenderer:
    protected readonly textRenderer;

    // Renders the group heading in this class:
    protected readonly renderMarkdown;
    protected readonly obsidianComponent: Component | null;
    protected readonly obsidianApp: App;

    // TODO access this via getContent() for now
    public content: HTMLDivElement | null = null;

    private readonly taskLineRenderer: TaskLineRenderer;

    private readonly ulElementStack: HTMLUListElement[] = [];
    private readonly liElementStack: HTMLLIElement[] = [];

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
    }

    private getContent() {
        // TODO remove throw
        const content = this.content;
        if (!content) {
            throw new Error('Must initialize content field before calling renderQuery()');
        }
        return content;
    }

    protected renderSearchResultsHeader(queryResult: QueryResult): void {
        this.addCopyButton(queryResult);
    }

    protected renderSearchResultsFooter(queryResult: QueryResult): void {
        this.addTaskCount(queryResult);
    }

    protected renderErrorMessage(errorMessage: string) {
        const container = createAndAppendElement('div', this.getContent());
        container.innerHTML = '<pre>' + `Tasks query: ${errorMessage.replace(/\n/g, '<br>')}` + '</pre>';
    }

    protected renderLoadingMessage() {
        this.getContent().textContent = 'Loading Tasks ...';
    }

    protected renderExplanation(explanation: string | null) {
        const explanationsBlock = createAndAppendElement('pre', this.getContent());
        explanationsBlock.classList.add('plugin-tasks-query-explanation');
        explanationsBlock.textContent = explanation;
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

    protected async addTaskGroup(group: TaskGroup): Promise<void> {
        // TODO re-extract the method to include this back
        try {
            await this.addTaskList(group.tasks);
        } finally {
            this.ulElementStack.pop();
        }
    }
    protected beginTaskList(): void {
        const taskListContainer = this.ulElementStack.length > 0 ? this.currentLIElement() : this.getContent();
        const taskList1 = createAndAppendElement('ul', taskListContainer);
        this.ulElementStack.push(taskList1);

        const taskList = taskList1;
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
    }

    protected beginTask() {
        const taskList = this.currentULElement();
        const listItemElement = createAndAppendElement('li', taskList);
        this.liElementStack.push(listItemElement);
    }

    protected async addListItem(listItem: ListItem, listItemIndex: number, children: ListItem[]): Promise<void> {
        const listItemElement = this.currentLIElement();

        await this.taskLineRenderer.renderListItem(listItemElement, listItem, listItemIndex);

        await this.addChildren(children);
    }

    protected async addTask(task: Task, taskIndex: number, children: ListItem[]): Promise<void> {
        const isFilenameUnique = this.isFilenameUnique({ task }, this.queryRendererParameters.allMarkdownFiles());
        const listItem = this.currentLIElement();

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

        await this.addChildren(children);
    }

    private async addChildren(children: ListItem[]) {
        if (children.length > 0) {
            try {
                await this.addTaskList(children);
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

    protected async addGroupHeading(group: GroupDisplayHeading) {
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

    private currentLIElement() {
        return this.liElementStack[this.liElementStack.length - 1];
    }
}
