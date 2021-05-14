import {
    MarkdownPostProcessorContext,
    MarkdownRenderChild,
    Plugin,
} from 'obsidian';

import { Cache, State } from './Cache';
import { Sort } from './Sort';
import { Query } from './Query';

export class QueryRenderer {
    private readonly cache: Cache;

    constructor({ plugin, cache }: { plugin: Plugin; cache: Cache }) {
        this.cache = cache;

        plugin.registerMarkdownCodeBlockProcessor(
            'tasks',
            this.addQueryRenderChild.bind(this),
        );
    }

    private async addQueryRenderChild(
        source: string,
        element: HTMLElement,
        context: MarkdownPostProcessorContext,
    ) {
        context.addChild(
            new QueryRenderChild({
                cache: this.cache,
                container: element,
                source,
            }),
        );
    }
}

class QueryRenderChild extends MarkdownRenderChild {
    private readonly cache: Cache;
    private readonly source: string;
    private query: Query;

    private cacheCallbackId: number | undefined;
    private queryReloadTimeout: NodeJS.Timeout | undefined;

    constructor({
        cache,
        container,
        source,
    }: {
        cache: Cache;
        container: HTMLElement;
        source: string;
    }) {
        super(container);

        this.cache = cache;
        this.source = source;

        this.query = new Query({ source });
    }

    onload() {
        this.render();
        this.cacheCallbackId = this.cache.subscribe(this.render.bind(this));

        this.reloadQueryAtMidnight();
    }

    onunload() {
        if (this.cacheCallbackId !== undefined) {
            this.cache.unsubscribe({ id: this.cacheCallbackId });
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
            this.render();
            this.reloadQueryAtMidnight();
        }, millisecondsToMidnight + 1000); // Add buffer to be sure to run after midnight.
    }

    private async render() {
        const content = this.containerEl.createEl('div');
        if (
            this.cache.getState() === State.Warm &&
            this.query.error === undefined
        ) {
            const { taskList, tasksCount } = await this.createTasksList(
                content,
            );
            content.appendChild(taskList);
            content.createDiv({
                text: `${tasksCount} task${tasksCount !== 1 ? 's' : ''}`,
                cls: 'tasks-count',
            });
        } else if (this.query.error !== undefined) {
            content.setText(`Tasks query: ${this.query.error}`);
        } else {
            content.setText('Loading Tasks ...');
        }

        this.containerEl.firstChild?.replaceWith(content);
    }

    private async createTasksList(
        content: HTMLDivElement,
    ): Promise<{ taskList: HTMLUListElement; tasksCount: number }> {
        let tasks = this.cache.getTasks();
        this.query.filters.forEach((filter) => {
            tasks = tasks.filter(filter);
        });

        const tasksSortedLimited = Sort.byStatusThenDateThenPath(tasks).slice(
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

            let fileName: string | undefined;
            const fileNameMatch = task.path.match(/([^/]+)\.md$/);
            if (fileNameMatch !== null) {
                fileName = fileNameMatch[1];
            }

            const listItem = await task.toLi({
                parentUlElement: taskList,
                listIndex: i,
            });

            if (fileName !== undefined) {
                const link = listItem.createEl('a');
                link.href = fileName;
                link.setAttribute('data-href', fileName);
                link.rel = 'noopener';
                link.target = '_blank';
                link.addClass('internal-link');

                let linkText = ` (${fileName}`;
                if (task.precedingHeader !== null) {
                    link.href = link.href + '#' + task.precedingHeader;
                    link.setAttribute(
                        'data-href',
                        link.getAttribute('data-href') +
                            '#' +
                            task.precedingHeader,
                    );

                    // Otherwise, this wouldn't provide additinoal information and only take up space.
                    if (task.precedingHeader !== fileName) {
                        linkText = linkText + ' > ' + task.precedingHeader;
                    }
                }
                linkText = linkText + ')';

                link.setText(linkText);
                listItem.appendChild(link);
            }

            taskList.appendChild(listItem);
        }

        return { taskList, tasksCount };
    }
}
