import { MarkdownRenderChild, MarkdownRenderer, TFile } from 'obsidian';
import { GlobalQuery } from '../Config/GlobalQuery';
import type { IQuery } from '../IQuery';
import { QueryLayout } from '../Layout/QueryLayout';
import { TaskLayout } from '../Layout/TaskLayout';
import { getQueryForQueryRenderer } from '../lib/QueryRendererHelper';
import type { GroupDisplayHeading } from '../Query/Group/GroupDisplayHeading';
import type { TaskGroups } from '../Query/Group/TaskGroups';
import type { QueryResult } from '../Query/QueryResult';
import { postponeButtonTitle, shouldShowPostponeButton } from '../Scripting/Postponer';
import type { TasksFile } from '../Scripting/TasksFile';
import type { Task } from '../Task/Task';
import { PostponeMenu } from '../ui/Menus/PostponeMenu';
import { TaskLineRenderer, createAndAppendElement } from './TaskLineRenderer';

type BacklinksEventHandler = (ev: MouseEvent, task: Task) => Promise<void>;
type EditButtonClickHandler = (event: MouseEvent, task: Task, allTasks: Task[]) => void;

export interface QueryRendererParameters {
    allTasks: Task[];
    allMarkdownFiles: TFile[];
    backlinksClickHandler: BacklinksEventHandler;
    backlinksMousedownHandler: BacklinksEventHandler;
    editTaskPencilClickHandler: EditButtonClickHandler;
}

export class QueryResultsRenderer extends MarkdownRenderChild {
    /**
     * The complete text in the instruction block, such as:
     * ```
     *   not done
     *   short mode
     * ```
     *
     * This does not contain the Global Query from the user's settings.
     * Use {@link getQueryForQueryRenderer} to get this value prefixed with the Global Query.
     */
    protected readonly source: string;

    // The path of the file that contains the instruction block, and cached data from that file.
    protected readonly tasksFile: TasksFile;

    protected query: IQuery;
    protected queryType: string; // whilst there is only one query type, there is no point logging this value

    constructor(container: HTMLElement, source: string, tasksFile: TasksFile) {
        super(container);

        this.source = source;
        this.tasksFile = tasksFile;

        // The engine is chosen on the basis of the code block language. Currently,
        // there is only the main engine for the plugin, this allows others to be
        // added later.
        switch (this.containerEl.className) {
            case 'block-language-tasks':
                this.query = getQueryForQueryRenderer(this.source, GlobalQuery.getInstance(), this.tasksFile);
                this.queryType = 'tasks';
                break;

            default:
                this.query = getQueryForQueryRenderer(this.source, GlobalQuery.getInstance(), this.tasksFile);
                this.queryType = 'tasks';
                break;
        }
    }

    public get filePath(): string | undefined {
        return this.tasksFile?.path ?? undefined;
    }

    protected async addAllTaskGroups(
        tasksSortedLimitedGrouped: TaskGroups,
        content: HTMLDivElement,
        queryRendererParameters: QueryRendererParameters,
    ) {
        for (const group of tasksSortedLimitedGrouped.groups) {
            // If there were no 'group by' instructions, group.groupHeadings
            // will be empty, and no headings will be added.
            await this.addGroupHeadings(content, group.groupHeadings);

            await this.createTaskList(group.tasks, content, queryRendererParameters);
        }
    }

    private async createTaskList(
        tasks: Task[],
        content: HTMLDivElement,
        queryRendererParameters: QueryRendererParameters,
    ): Promise<void> {
        const taskList = createAndAppendElement('ul', content);

        taskList.addClasses(['contains-task-list', 'plugin-tasks-query-result']);
        const taskLayout = new TaskLayout(this.query.taskLayoutOptions);
        taskList.addClasses(taskLayout.generateHiddenClasses());
        const queryLayout = new QueryLayout(this.query.queryLayoutOptions);
        taskList.addClasses(queryLayout.getHiddenClasses());

        const groupingAttribute = this.getGroupingAttribute();
        if (groupingAttribute && groupingAttribute.length > 0) taskList.dataset.taskGroupBy = groupingAttribute;

        const taskLineRenderer = new TaskLineRenderer({
            obsidianComponent: this,
            parentUlElement: taskList,
            taskLayoutOptions: this.query.taskLayoutOptions,
            queryLayoutOptions: this.query.queryLayoutOptions,
        });

        for (const [taskIndex, task] of tasks.entries()) {
            await this.addTask(taskList, taskLineRenderer, task, taskIndex, queryRendererParameters);
        }

        content.appendChild(taskList);
    }

    private async addTask(
        taskList: HTMLUListElement,
        taskLineRenderer: TaskLineRenderer,
        task: Task,
        taskIndex: number,
        queryRendererParameters: QueryRendererParameters,
    ) {
        const isFilenameUnique = this.isFilenameUnique({ task }, queryRendererParameters.allMarkdownFiles);
        const listItem = await taskLineRenderer.renderTaskLine(task, taskIndex, isFilenameUnique);

        // Remove all footnotes. They don't re-appear in another document.
        const footnotes = listItem.querySelectorAll('[data-footnote-id]');
        footnotes.forEach((footnote) => footnote.remove());

        const extrasSpan = listItem.createSpan('task-extras');

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
    }

    private addEditButton(listItem: HTMLElement, task: Task, queryRendererParameters: QueryRendererParameters) {
        const editTaskPencil = createAndAppendElement('a', listItem);
        editTaskPencil.addClass('tasks-edit');
        editTaskPencil.title = 'Edit task';
        editTaskPencil.href = '#';

        editTaskPencil.onClickEvent((event: MouseEvent) => {
            queryRendererParameters.editTaskPencilClickHandler(event, task, queryRendererParameters.allTasks);
        });
    }

    private addUrgency(listItem: HTMLElement, task: Task) {
        const text = new Intl.NumberFormat().format(task.urgency);
        listItem.createSpan({ text, cls: 'tasks-urgency' });
    }

    /**
     * Display headings for a group of tasks.
     * @param content
     * @param groupHeadings - The headings to display. This can be an empty array,
     *                        in which case no headings will be added.
     * @private
     */
    private async addGroupHeadings(content: HTMLDivElement, groupHeadings: GroupDisplayHeading[]) {
        for (const heading of groupHeadings) {
            await this.addGroupHeading(content, heading);
        }
    }

    private async addGroupHeading(content: HTMLDivElement, group: GroupDisplayHeading) {
        // Headings nested to 2 or more levels are all displayed with 'h6:
        let header: keyof HTMLElementTagNameMap = 'h6';
        if (group.nestingLevel === 0) {
            header = 'h4';
        } else if (group.nestingLevel === 1) {
            header = 'h5';
        }

        const headerEl = createAndAppendElement(header, content);
        headerEl.addClass('tasks-group-heading');
        await MarkdownRenderer.renderMarkdown(group.displayName, headerEl, this.tasksFile.path, this);
    }

    private addBacklinks(
        listItem: HTMLElement,
        task: Task,
        shortMode: boolean,
        isFilenameUnique: boolean | undefined,
        queryRendererParameters: QueryRendererParameters,
    ) {
        const backLink = listItem.createSpan({ cls: 'tasks-backlink' });

        if (!shortMode) {
            backLink.append(' (');
        }

        const link = createAndAppendElement('a', backLink);

        link.rel = 'noopener';
        link.target = '_blank';
        link.addClass('internal-link');
        if (shortMode) {
            link.addClass('internal-link-short-mode');
        }

        let linkText: string;
        if (shortMode) {
            linkText = ' 🔗';
        } else {
            linkText = task.getLinkText({ isFilenameUnique }) ?? '';
        }

        link.setText(linkText);

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
        button.addClass('tasks-postpone');
        if (shortMode) {
            button.addClass('tasks-postpone-short-mode');
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
            ev.preventDefault(); // suppress the default context menu
            ev.stopPropagation(); // suppress further event propagation
            const menu = new PostponeMenu(button, task);
            menu.showAtPosition({ x: ev.clientX, y: ev.clientY });
        });
    }

    protected addTaskCount(content: HTMLDivElement, queryResult: QueryResult) {
        if (!this.query.queryLayoutOptions.hideTaskCount) {
            content.createDiv({
                text: queryResult.totalTasksCountDisplayText(),
                cls: 'tasks-count',
            });
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
        for (const group of this.query.grouping) {
            groupingRules.push(group.property);
        }
        return groupingRules.join(',');
    }
}
