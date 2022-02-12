import {
    App,
    EventRef,
    MarkdownPostProcessorContext,
    MarkdownRenderChild,
    Plugin,
    TFile,
} from 'obsidian';

import { State } from './Cache';
import { replaceTaskWithTasks } from './File';
import { Query } from './Query';
import { Sort } from './Sort';
import { TaskModal } from './TaskModal';
import type { Events } from './Events';
import type { Task } from './Task';

export class QueryRenderer {
    private readonly app: App;
    private readonly events: Events;

    constructor({ plugin, events }: { plugin: Plugin; events: Events }) {
        this.app = plugin.app;
        this.events = events;

        plugin.registerMarkdownCodeBlockProcessor(
            'tasks',
            this._addQueryRenderChild.bind(this),
        );
    }

    public addQueryRenderChild = this._addQueryRenderChild.bind(this);

    private async _addQueryRenderChild(
        source: string,
        element: HTMLElement,
        context: MarkdownPostProcessorContext,
    ) {
        context.addChild(
            new QueryRenderChild({
                app: this.app,
                events: this.events,
                container: element,
                source,
            }),
        );
    }
}

class QueryRenderChild extends MarkdownRenderChild {
    private readonly app: App;
    private readonly events: Events;
    private readonly source: string;
    private query: Query;

    private renderEventRef: EventRef | undefined;
    private queryReloadTimeout: NodeJS.Timeout | undefined;

    constructor({
        app,
        events,
        container,
        source,
    }: {
        app: App;
        events: Events;
        container: HTMLElement;
        source: string;
    }) {
        super(container);

        this.app = app;
        this.events = events;
        this.source = source;

        this.query = new Query({ source });
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
            this.query = new Query({ source: this.source });
            // Process the current cache state:
            this.events.triggerRequestCacheUpdate(this.render.bind(this));
            this.reloadQueryAtMidnight();
        }, millisecondsToMidnight + 1000); // Add buffer to be sure to run after midnight.
    }

    private async render({ tasks, state }: { tasks: Task[]; state: State }) {
        const content = this.containerEl.createEl('div');
        if (state === State.Warm && this.query.error === undefined) {
            const { taskList, tasksCount } = await this.createTasksList({
                tasks,
                content,
            });
            content.appendChild(taskList);
            if (!this.query.layoutOptions.hideTaskCount) {
                content.createDiv({
                    text: `${tasksCount} task${tasksCount !== 1 ? 's' : ''}`,
                    cls: 'tasks-count',
                });
            }
        } else if (this.query.error !== undefined) {
            content.setText(`Tasks query: ${this.query.error}`);
        } else {
            content.setText('Loading Tasks ...');
        }

        this.containerEl.firstChild?.replaceWith(content);
    }

    private async createTasksList({
        tasks,
        content,
    }: {
        tasks: Task[];
        content: HTMLDivElement;
    }): Promise<{ taskList: HTMLUListElement; tasksCount: number }> {
        this.query.filters.forEach((filter) => {
            tasks = tasks.filter(filter);
        });

        const tasksSortedLimited = Sort.by(this.query, tasks).slice(
            0,
            this.query.limit,
        );
        const tasksCount = tasksSortedLimited.length;

        const taskList = content.createEl('ul');
        taskList.addClasses([
            'contains-task-list',
            'plugin-tasks-query-result',
        ]);
        for (let i = 0; i < tasksCount; i++) {
            const task = tasksSortedLimited[i];

            let filePath: string | undefined;
            const filePathMatch = task.path.match(/^(.+)\.md$/);
            if (filePathMatch !== null) {
                filePath = filePathMatch[1];
            }

            const listItem = await task.toLi({
                parentUlElement: taskList,
                listIndex: i,
                layoutOptions: this.query.layoutOptions,
            });

            // Remove all footnotes. They don't re-appear in another document.
            const footnotes = listItem.querySelectorAll('[data-footnote-id]');
            footnotes.forEach((footnote) => footnote.remove());

            const postInfo = listItem.createSpan();

            if (
                !this.query.layoutOptions.hideBacklinks &&
                filePath !== undefined
            ) {
                this.addBacklinks(
                    postInfo,
                    task,
                    this.query.layoutOptions.shortMode,
                );
            }

            if (!this.query.layoutOptions.hideEditButton) {
                this.addEditButton(postInfo, task);
            }

            taskList.appendChild(listItem);
        }

        return { taskList, tasksCount };
    }

    private addEditButton(postInfo: HTMLSpanElement, task: Task) {
        const editTaskPencil = postInfo.createEl('a', {
            cls: 'tasks-edit',
        });
        editTaskPencil.onClickEvent((event: MouseEvent) => {
            event.preventDefault();

            const onSubmit = (updatedTasks: Task[]): void => {
                replaceTaskWithTasks({
                    originalTask: task,
                    newTasks: updatedTasks,
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

    private addBacklinks(
        postInfo: HTMLSpanElement,
        task: Task,
        shortMode: boolean,
    ) {
        postInfo.addClass('tasks-backlink');
        if (!shortMode) {
            postInfo.append(' (');
        }
        const link = postInfo.createEl('a');

        link.href = task.path;
        link.setAttribute('data-href', task.path);
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
          // Set link text to either file name (if unique in the vault) or file path.
          let linkText = filePath;
          const fileNameMatch = filePath.match(/[^/]*$/i);
          // @ts-ignore fileNameMatch[0] is never null, because the pattern matches always.
          const fileName = fileNameMatch[0];
          // Check if other files exist in the vault with a same name.
          const filesWithSameName = this.app.vault
              .getMarkdownFiles()
              .filter((file: TFile) => {
                  if (file.basename === fileName) {
                      // Found a file with the same name (it might actually be the same file, but we'll take that into account later.)
                      return true;
                  }
              });
          if (filesWithSameName.length == 1) {
              // Only one file has the name fileName, so the name is unique.
              // Use fileName as link text instead of the full path. This only affects the displayed text - link target is always set to the full path.
              linkText = fileName;
          }
        }

        if (task.precedingHeader !== null) {
            link.href = link.href + '#' + task.precedingHeader;
            link.setAttribute(
                'data-href',
                link.getAttribute('data-href') + '#' + task.precedingHeader,
            );
        }

        link.setText(linkText);
        if (!shortMode) {
            postInfo.append(')');
        }
    }
}
