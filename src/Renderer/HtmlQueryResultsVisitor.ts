import type { App, Component, TFile } from 'obsidian';
import { postponeButtonTitle, shouldShowPostponeButton } from '../DateTime/Postponer';
import type { IQuery } from '../IQuery';
import type { GroupDisplayHeading } from '../Query/Group/GroupDisplayHeading';
import type { TasksFile } from '../Scripting/TasksFile';
import type { ListItem } from '../Task/ListItem';
import type { Task } from '../Task/Task';
import { PostponeMenu } from '../ui/Menus/PostponeMenu';
import { showMenu } from '../ui/Menus/TaskEditingMenu';
import type { QueryRendererParameters } from './QueryResultsRenderer';
import type { QueryResultsVisitor } from './QueryResultsVisitor';
import { TaskLineRenderer, createAndAppendElement } from './TaskLineRenderer';

/**
 * HTML implementation of the QueryResultsVisitor.
 *
 * This visitor renders query results as HTML elements, creating
 * list items for tasks and headings for groups.
 */
export class HtmlQueryResultsVisitor implements QueryResultsVisitor {
    private readonly query: IQuery;
    private readonly tasksFile: TasksFile;
    private readonly content: HTMLDivElement;
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

    constructor(
        query: IQuery,
        tasksFile: TasksFile,
        content: HTMLDivElement,
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
    ) {
        this.query = query;
        this.tasksFile = tasksFile;
        this.content = content;
        this.renderMarkdown = renderMarkdown;
        this.obsidianComponent = obsidianComponent;
        this.obsidianApp = obsidianApp;
        this.filePath = filePath;
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

    async addTask(
        taskList: HTMLUListElement,
        taskLineRenderer: TaskLineRenderer,
        task: Task,
        taskIndex: number,
        queryRendererParameters: QueryRendererParameters,
    ): Promise<HTMLLIElement> {
        const isFilenameUnique = this.isFilenameUnique({ task }, queryRendererParameters.allMarkdownFiles);
        const listItem = await taskLineRenderer.renderTaskLine({
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

        if (!this.query.queryLayoutOptions.hideUrgency) {
            this.addUrgency(extrasSpan, task);
        }

        const shortMode = this.query.queryLayoutOptions.shortMode;

        if (!this.query.queryLayoutOptions.hideBacklinks) {
            this.addBacklinks(extrasSpan, task, shortMode, isFilenameUnique, queryRendererParameters);
        }

        if (!this.query.queryLayoutOptions.hideEditButton) {
            this.addEditButton(extrasSpan, task, queryRendererParameters);
        }

        if (!this.query.queryLayoutOptions.hidePostponeButton && shouldShowPostponeButton(task)) {
            this.addPostponeButton(extrasSpan, task, shortMode);
        }

        taskList.appendChild(listItem);

        return listItem;
    }

    async addListItem(
        taskList: HTMLUListElement,
        taskLineRenderer: TaskLineRenderer,
        listItem: ListItem,
        listItemIndex: number,
    ): Promise<HTMLLIElement> {
        return await taskLineRenderer.renderListItem(taskList, listItem, listItemIndex);
    }

    private addEditButton(listItem: HTMLElement, task: Task, queryRendererParameters: QueryRendererParameters) {
        const editTaskPencil = createAndAppendElement('a', listItem);
        editTaskPencil.classList.add('tasks-edit');
        editTaskPencil.title = 'Edit task';
        editTaskPencil.href = '#';

        editTaskPencil.addEventListener('click', (event: MouseEvent) =>
            queryRendererParameters.editTaskPencilClickHandler(event, task, queryRendererParameters.allTasks),
        );
    }

    private addUrgency(listItem: HTMLElement, task: Task) {
        const text = new Intl.NumberFormat().format(task.urgency);
        const span = createAndAppendElement('span', listItem);
        span.textContent = text;
        span.classList.add('tasks-urgency');
    }

    private addBacklinks(
        listItem: HTMLElement,
        task: Task,
        shortMode: boolean,
        isFilenameUnique: boolean | undefined,
        queryRendererParameters: QueryRendererParameters,
    ) {
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
            await queryRendererParameters.backlinksClickHandler(ev, task);
        });

        link.addEventListener('mousedown', async (ev: MouseEvent) => {
            await queryRendererParameters.backlinksMousedownHandler(ev, task);
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
