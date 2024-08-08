import { MarkdownRenderChild, MarkdownRenderer, TFile } from 'obsidian';
import { GlobalQuery } from '../Config/GlobalQuery';
import type { IQuery } from '../IQuery';
import { getQueryForQueryRenderer } from '../lib/QueryRendererHelper';
import type { GroupDisplayHeading } from '../Query/Group/GroupDisplayHeading';
import type { QueryResult } from '../Query/QueryResult';
import { postponeButtonTitle } from '../Scripting/Postponer';
import type { TasksFile } from '../Scripting/TasksFile';
import type { Task } from '../Task/Task';
import { PostponeMenu } from '../ui/Menus/PostponeMenu';
import { createAndAppendElement } from './TaskLineRenderer';

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

    protected async addGroupHeading(content: HTMLDivElement, group: GroupDisplayHeading) {
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

    protected addBacklinks(
        listItem: HTMLElement,
        task: Task,
        shortMode: boolean,
        isFilenameUnique: boolean | undefined,
        clickHandler: (ev: MouseEvent, task: Task) => Promise<void>,
        mousedownHandler: (ev: MouseEvent, task: Task) => Promise<void>,
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
            await clickHandler(ev, task);
        });

        link.addEventListener('mousedown', async (ev: MouseEvent) => {
            await mousedownHandler(ev, task);
        });

        if (!shortMode) {
            backLink.append(')');
        }
    }

    protected addPostponeButton(listItem: HTMLElement, task: Task, shortMode: boolean) {
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

    protected isFilenameUnique({ task }: { task: Task }, allMarkdownFiles: TFile[]): boolean | undefined {
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

    protected getGroupingAttribute() {
        const groupingRules: string[] = [];
        for (const group of this.query.grouping) {
            groupingRules.push(group.property);
        }
        return groupingRules.join(',');
    }
}
