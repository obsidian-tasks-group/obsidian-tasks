import type { App, Component, TFile } from 'obsidian';
import { postponeButtonTitle, shouldShowPostponeButton } from '../DateTime/Postponer';
import type { IQuery } from '../IQuery';
import { QueryLayout } from '../Layout/QueryLayout';
import { TaskLayout } from '../Layout/TaskLayout';
import type { GroupDisplayHeading } from '../Query/Group/GroupDisplayHeading';
import type { TasksFile } from '../Scripting/TasksFile';
import type { ListItem } from '../Task/ListItem';
import type { Task } from '../Task/Task';
import { PostponeMenu } from '../ui/Menus/PostponeMenu';
import { showMenu } from '../ui/Menus/TaskEditingMenu';
import type { QueryRendererParameters } from './QueryResultsRenderer';
import type { QueryResultsVisitor, VisitorRenderContext } from './QueryResultsVisitor';
import { TaskLineRenderer, createAndAppendElement } from './TaskLineRenderer';

/**
 * HTML implementation of the QueryResultsVisitor.
 *
 * This visitor renders query results as HTML elements, creating
 * list items for tasks and headings for groups.
 *
 * This is the default visitor that provides all the Obsidian-specific
 * functionality like edit buttons, backlinks, postpone buttons, etc.
 */
export class HtmlQueryResultsVisitor implements QueryResultsVisitor {
    private readonly query: IQuery;
    private readonly tasksFile: TasksFile;
    private readonly content: HTMLDivElement;
    private readonly taskLineRenderer: TaskLineRenderer;
    private readonly renderMarkdown: (
        app: App,
        markdown: string,
        el: HTMLElement,
        sourcePath: string,
        component: Component,
    ) => Promise<void>;
    private readonly obsidianComponent: Component | null;
    private readonly obsidianApp: App;
    private readonly filePath: string | undefined;
    private readonly queryRendererParameters: QueryRendererParameters;
    private readonly allMarkdownFiles: TFile[];
    private lastRenderedElement: HTMLElement | undefined;

    // Stack to manage nested list contexts
    private listStack: HTMLUListElement[] = [];
    private currentList: HTMLUListElement;

    constructor(
        query: IQuery,
        tasksFile: TasksFile,
        content: HTMLDivElement,
        taskList: HTMLUListElement,
        taskLineRenderer: TaskLineRenderer,
        renderMarkdown: (
            app: App,
            markdown: string,
            el: HTMLElement,
            sourcePath: string,
            component: Component,
        ) => Promise<void>,
        obsidianComponent: Component | null,
        obsidianApp: App,
        filePath: string | undefined,
        queryRendererParameters: QueryRendererParameters,
    ) {
        this.query = query;
        this.tasksFile = tasksFile;
        this.content = content;
        this.currentList = taskList; // Start with the root list
        this.taskLineRenderer = taskLineRenderer;
        this.renderMarkdown = renderMarkdown;
        this.obsidianComponent = obsidianComponent;
        this.obsidianApp = obsidianApp;
        this.filePath = filePath;
        this.queryRendererParameters = queryRendererParameters;
        this.allMarkdownFiles = queryRendererParameters.allMarkdownFiles;
    }

    async addGroupHeading(group: GroupDisplayHeading): Promise<void> {
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
            return;
        }
        await this.renderMarkdown(
            this.obsidianApp,
            group.displayName,
            headerEl,
            this.tasksFile.path,
            this.obsidianComponent,
        );
    }

    async addTask(task: Task, taskIndex: number, context: VisitorRenderContext): Promise<void> {
        const isFilenameUnique = this.isFilenameUnique({ task }, this.allMarkdownFiles);
        const listItem = await this.taskLineRenderer.renderTaskLine({
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

        if (!context.hideUrgency) {
            this.addUrgency(extrasSpan, task);
        }

        if (!context.hideBacklinks) {
            this.addBacklinks(extrasSpan, task, context.shortMode, isFilenameUnique);
        }

        if (!context.hideEditButton) {
            this.addEditButton(extrasSpan, task);
        }

        if (!context.hidePostponeButton && shouldShowPostponeButton(task)) {
            this.addPostponeButton(extrasSpan, task, context.shortMode);
        }

        this.currentList.appendChild(listItem);
        this.lastRenderedElement = listItem;
    }

    async addListItem(listItem: ListItem, listItemIndex: number, _context: VisitorRenderContext): Promise<void> {
        const rendered = await this.taskLineRenderer.renderListItem(this.currentList, listItem, listItemIndex);
        this.lastRenderedElement = rendered;
    }

    public beginChildren(): void {
        if (!this.lastRenderedElement) {
            throw new Error('Cannot begin children without a parent element');
        }

        // Push current list onto stack
        this.listStack.push(this.currentList);

        // Create nested list inside the last rendered element
        const nestedList = createAndAppendElement('ul', this.lastRenderedElement);
        nestedList.classList.add('contains-task-list', 'plugin-tasks-query-result');

        // Apply the same styling classes as the parent list
        const taskLayout = new TaskLayout(this.query.taskLayoutOptions);
        const queryLayout = new QueryLayout(this.query.queryLayoutOptions);
        nestedList.classList.add(...taskLayout.generateHiddenClasses());
        nestedList.classList.add(...queryLayout.getHiddenClasses());

        // Make this the current list for subsequent renders
        this.currentList = nestedList;
    }

    public endChildren(): void {
        // Pop back to parent list
        const parentList = this.listStack.pop();
        if (!parentList) {
            throw new Error('endChildren called without matching beginChildren');
        }
        this.currentList = parentList;
    }

    private addEditButton(listItem: HTMLElement, task: Task) {
        const editTaskPencil = createAndAppendElement('a', listItem);
        editTaskPencil.classList.add('tasks-edit');
        editTaskPencil.title = 'Edit task';
        editTaskPencil.href = '#';

        editTaskPencil.addEventListener('click', (event: MouseEvent) =>
            this.queryRendererParameters.editTaskPencilClickHandler(event, task, this.queryRendererParameters.allTasks),
        );
    }

    private addUrgency(listItem: HTMLElement, task: Task) {
        const text = new Intl.NumberFormat().format(task.urgency);
        const span = createAndAppendElement('span', listItem);
        span.textContent = text;
        span.classList.add('tasks-urgency');
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
}
