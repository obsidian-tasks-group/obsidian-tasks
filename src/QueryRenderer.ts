import type { EventRef, MarkdownPostProcessorContext } from 'obsidian';
import { App, Keymap, MarkdownRenderChild, MarkdownRenderer, Plugin, TFile } from 'obsidian';
import { State } from './Cache';
import { GlobalFilter } from './Config/GlobalFilter';
import { GlobalQuery } from './Config/GlobalQuery';
import { DateFallback } from './DateFallback';
import { getTaskLineAndFile, replaceTaskWithTasks } from './File';

import type { IQuery } from './IQuery';
import { explainResults, getQueryForQueryRenderer } from './lib/QueryRendererHelper';
import type { GroupDisplayHeading } from './Query/GroupDisplayHeading';
import type { QueryResult } from './Query/QueryResult';
import type { TaskGroups } from './Query/TaskGroups';
import { postponeButtonTitle, shouldShowPostponeButton } from './Scripting/Postponer';
import type { Task } from './Task';
import { TaskLayout } from './TaskLayout';
import { TaskLineRenderer } from './TaskLineRenderer';
import { TaskModal } from './TaskModal';
import type { TasksEvents } from './TasksEvents';
import { PostponeMenu } from './ui/Menus/PostponeMenu';

export class QueryRenderer {
    private readonly app: App;
    private readonly events: TasksEvents;

    constructor({ plugin, events }: { plugin: Plugin; events: TasksEvents }) {
        this.app = plugin.app;
        this.events = events;

        plugin.registerMarkdownCodeBlockProcessor('tasks', this._addQueryRenderChild.bind(this));
    }

    public addQueryRenderChild = this._addQueryRenderChild.bind(this);

    private async _addQueryRenderChild(source: string, element: HTMLElement, context: MarkdownPostProcessorContext) {
        context.addChild(
            new QueryRenderChild({
                app: this.app,
                events: this.events,
                container: element,
                source,
                filePath: context.sourcePath,
            }),
        );
    }
}

class QueryRenderChild extends MarkdownRenderChild {
    private readonly app: App;
    private readonly events: TasksEvents;

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
    private readonly source: string;

    /// The path of the file that contains the instruction block.
    private readonly filePath: string;

    private query: IQuery;
    // @ts-expect-error: TS6133: 'queryType' is declared but its value is never read
    private queryType: string; // whilst there is only one query type, there is no point logging this value

    private renderEventRef: EventRef | undefined;
    private queryReloadTimeout: NodeJS.Timeout | undefined;

    constructor({
        app,
        events,
        container,
        source,
        filePath,
    }: {
        app: App;
        events: TasksEvents;
        container: HTMLElement;
        source: string;
        filePath: string;
    }) {
        super(container);

        this.app = app;
        this.events = events;
        this.source = source;
        this.filePath = filePath;

        // The engine is chosen on the basis of the code block language. Currently,
        // there is only the main engine for the plugin, this allows others to be
        // added later.
        switch (this.containerEl.className) {
            case 'block-language-tasks':
                this.query = getQueryForQueryRenderer(this.source, GlobalQuery.getInstance(), this.filePath);
                this.queryType = 'tasks';
                break;

            default:
                this.query = getQueryForQueryRenderer(this.source, GlobalQuery.getInstance(), this.filePath);
                this.queryType = 'tasks';
                break;
        }
    }

    onload() {
        // Process the current cache state:
        this.events.triggerRequestCacheUpdate(this.render.bind(this));
        // Listen to future cache changes:
        this.renderEventRef = this.events.onCacheUpdate(this.render.bind(this));

        this.reloadQueryAtMidnight();
    }

    onunload() {
        if (this.renderEventRef !== undefined) {
            this.events.off(this.renderEventRef);
        }

        if (this.queryReloadTimeout !== undefined) {
            clearTimeout(this.queryReloadTimeout);
        }
    }

    /**
     * Reloads the query after midnight to update results from relative date queries.
     *
     * For example, the query `due today` changes every day. This makes sure that all query results
     * are re-rendered after midnight every day to ensure up-to-date results without having to
     * reload obsidian. Creating a new query object from the source re-applies the relative dates
     * to "now".
     */
    private reloadQueryAtMidnight(): void {
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        const now = new Date();

        const millisecondsToMidnight = midnight.getTime() - now.getTime();

        this.queryReloadTimeout = setTimeout(() => {
            this.query = getQueryForQueryRenderer(this.source, GlobalQuery.getInstance(), this.filePath);
            // Process the current cache state:
            this.events.triggerRequestCacheUpdate(this.render.bind(this));
            this.reloadQueryAtMidnight();
        }, millisecondsToMidnight + 1000); // Add buffer to be sure to run after midnight.
    }

    private async render({ tasks, state }: { tasks: Task[]; state: State }) {
        // Don't log anything here, for any state, as it generates huge amounts of
        // console messages in large vaults, if Obsidian was opened with any
        // notes with tasks code blocks in Reading or Live Preview mode.

        const content = this.containerEl.createEl('div');
        if (state === State.Warm && this.query.error === undefined) {
            await this.renderQuerySearchResults(tasks, state, content);
        } else if (this.query.error !== undefined) {
            this.renderErrorMessage(content, this.query.error);
        } else {
            this.renderLoadingMessage(content);
        }

        this.containerEl.firstChild?.replaceWith(content);
    }

    private async renderQuerySearchResults(tasks: Task[], state: State.Warm, content: HTMLDivElement) {
        // See https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2160
        this.query.debug(`[render] Render called: plugin state: ${state}; searching ${tasks.length} tasks`);

        if (this.query.queryLayoutOptions.explainQuery) {
            this.createExplanation(content);
        }

        const queryResult = this.query.applyQueryToTasks(tasks);
        if (queryResult.searchErrorMessage !== undefined) {
            // There was an error in the search, for example due to a problem custom function.
            this.renderErrorMessage(content, queryResult.searchErrorMessage);
            return;
        }

        await this.addAllTaskGroups(queryResult.taskGroups, content);

        const totalTasksCount = queryResult.totalTasksCount;
        this.addTaskCount(content, queryResult);

        this.query.debug(`[render] ${totalTasksCount} tasks displayed`);
    }

    private renderErrorMessage(content: HTMLDivElement, errorMessage: string) {
        content.createDiv().innerHTML = '<pre>' + `Tasks query: ${errorMessage.replace(/\n/g, '<br>')}` + '</pre>';
    }

    private renderLoadingMessage(content: HTMLDivElement) {
        content.setText('Loading Tasks ...');
    }

    // Use the 'explain' instruction to enable this
    private createExplanation(content: HTMLDivElement) {
        const explanationAsString = explainResults(
            this.source,
            GlobalFilter.getInstance(),
            GlobalQuery.getInstance(),
            this.filePath,
        );

        const explanationsBlock = content.createEl('pre');
        explanationsBlock.addClasses(['plugin-tasks-query-explanation']);
        explanationsBlock.setText(explanationAsString);
        content.appendChild(explanationsBlock);
    }

    private async createTaskList(tasks: Task[], content: HTMLDivElement): Promise<void> {
        const layout = new TaskLayout(this.query.taskLayoutOptions, this.query.queryLayoutOptions);
        const taskList = content.createEl('ul');
        taskList.addClasses(['contains-task-list', 'plugin-tasks-query-result']);
        taskList.addClasses(layout.taskListHiddenClasses());
        const groupingAttribute = this.getGroupingAttribute();
        if (groupingAttribute && groupingAttribute.length > 0) taskList.dataset.taskGroupBy = groupingAttribute;

        const taskLineRenderer = new TaskLineRenderer({
            obsidianComponent: this,
            parentUlElement: taskList,
            taskLayoutOptions: this.query.taskLayoutOptions,
            queryLayoutOptions: this.query.queryLayoutOptions,
        });

        for (const [taskIndex, task] of tasks.entries()) {
            const isFilenameUnique = this.isFilenameUnique({ task });
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
                this.addBacklinks(extrasSpan, task, shortMode, isFilenameUnique);
            }

            if (!this.query.queryLayoutOptions.hideEditButton) {
                this.addEditButton(extrasSpan, task);
            }

            if (!this.query.queryLayoutOptions.hidePostponeButton && shouldShowPostponeButton(task)) {
                this.addPostponeButton(extrasSpan, task, shortMode);
            }

            // NEW
            // if (!this.query.layoutOptions.hideSnoozeButton) {
            //     this.addUnSnoozeButton(extrasSpan, task, shortMode);
            //     this.addSnoozeButton1Day(extrasSpan, task, shortMode);
            //     this.addSnoozeButton3Days(extrasSpan, task, shortMode);
            // }

            taskList.appendChild(listItem);
        }

        content.appendChild(taskList);
    }

    private addEditButton(listItem: HTMLElement, task: Task) {
        const editTaskPencil = listItem.createEl('a', {
            cls: 'tasks-edit',
            href: '#',
            title: 'Edit task',
        });
        editTaskPencil.onClickEvent((event: MouseEvent) => {
            event.preventDefault();

            const onSubmit = async (updatedTasks: Task[]): Promise<void> => {
                await replaceTaskWithTasks({
                    originalTask: task,
                    newTasks: DateFallback.removeInferredStatusIfNeeded(task, updatedTasks),
                });
            };

            // Need to create a new instance every time, as cursor/task can change.
            const taskModal = new TaskModal({
                app: this.app,
                task,
                onSubmit,
            });
            taskModal.open();
        });
    }

    private addUrgency(listItem: HTMLElement, task: Task) {
        const text = new Intl.NumberFormat().format(task.urgency);
        listItem.createSpan({ text, cls: 'tasks-urgency' });
    }

    private async addAllTaskGroups(tasksSortedLimitedGrouped: TaskGroups, content: HTMLDivElement) {
        for (const group of tasksSortedLimitedGrouped.groups) {
            // If there were no 'group by' instructions, group.groupHeadings
            // will be empty, and no headings will be added.
            await this.addGroupHeadings(content, group.groupHeadings);

            await this.createTaskList(group.tasks, content);
        }
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

        const headerEl = content.createEl(header, {
            cls: 'tasks-group-heading',
        });
        await MarkdownRenderer.renderMarkdown(group.displayName, headerEl, this.filePath, this);
    }

    private addBacklinks(listItem: HTMLElement, task: Task, shortMode: boolean, isFilenameUnique: boolean | undefined) {
        const backLink = listItem.createSpan({ cls: 'tasks-backlink' });

        if (!shortMode) {
            backLink.append(' (');
        }

        const link = backLink.createEl('a');

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
        const vault = this.app.vault;
        link.addEventListener('click', async (ev: MouseEvent) => {
            const result = await getTaskLineAndFile(task, vault);
            if (result) {
                const [line, file] = result;
                const leaf = this.app.workspace.getLeaf(Keymap.isModEvent(ev));
                // When the corresponding task has been found,
                // suppress the default behavior of the mouse click event
                // (which would interfere e.g. if the query is rendered inside a callout).
                ev.preventDefault();
                // Instead of the default behavior, open the file with the required line highlighted.
                await leaf.openFile(file, { eState: { line: line } });
            }
        });

        link.addEventListener('mousedown', async (ev: MouseEvent) => {
            // Open in a new tab on middle-click.
            // This distinction is not available in the 'click' event, so we handle the 'mousedown' event
            // solely for this.
            // (for regular left-click we prefer the 'click' event, and not to just do everything here, because
            // the 'click' event is more generic for touch devices etc.)
            if (ev.button === 1) {
                const result = await getTaskLineAndFile(task, vault);
                if (result) {
                    const [line, file] = result;
                    const leaf = this.app.workspace.getLeaf('tab');
                    ev.preventDefault();
                    await leaf.openFile(file, { eState: { line: line } });
                }
            }
        });

        if (!shortMode) {
            backLink.append(')');
        }
    }

    private addPostponeButton(listItem: HTMLElement, task: Task, shortMode: boolean) {
        const amount = 1;
        const timeUnit = 'day';
        const buttonTooltipText = postponeButtonTitle(task, amount, timeUnit);
        const button = listItem.createEl('a', {
            cls: 'tasks-postpone' + (shortMode ? ' tasks-postpone-short-mode' : ''),
            href: '#',
            title: buttonTooltipText,
        });

        button.addEventListener('click', (ev: MouseEvent) => {
            ev.preventDefault(); // suppress the default click behavior
            PostponeMenu.postponeOnClickCallback(button, task, amount, timeUnit);
        });

        /** Open a context menu on right-click.
         */
        button.addEventListener('contextmenu', async (ev: MouseEvent) => {
            ev.stopPropagation(); // suppress the default context menu
            const menu = new PostponeMenu(button, task);
            menu.showAtPosition({ x: ev.clientX, y: ev.clientY });
        });
    }

    private addTaskCount(content: HTMLDivElement, queryResult: QueryResult) {
        if (!this.query.queryLayoutOptions.hideTaskCount) {
            content.createDiv({
                text: queryResult.totalTasksCountDisplayText(),
                cls: 'tasks-count',
            });
        }
    }

    private isFilenameUnique({ task }: { task: Task }): boolean | undefined {
        // Will match the filename without extension (the file's "basename").
        const filenameMatch = task.path.match(/([^/]*)\..+$/i);
        if (filenameMatch === null) {
            return undefined;
        }

        const filename = filenameMatch[1];
        const allFilesWithSameName = this.app.vault.getMarkdownFiles().filter((file: TFile) => {
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
