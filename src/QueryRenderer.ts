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
        const query = new Query({ source });

        context.addChild(
            new QueryRenderChild({
                cache: this.cache,
                container: element,
                query,
            }),
        );
    }
}

class QueryRenderChild extends MarkdownRenderChild {
    private readonly cache: Cache;
    private readonly query: Query;

    private cacheCallbackId: number | undefined;

    constructor({
        cache,
        container,
        query,
    }: {
        cache: Cache;
        container: HTMLElement;
        query: Query;
    }) {
        super(container);

        this.cache = cache;
        this.query = query;
    }

    onload() {
        this.render();
        this.cacheCallbackId = this.cache.subscribe(this.render.bind(this));
    }

    onunload() {
        if (this.cacheCallbackId !== undefined) {
            this.cache.unsubscribe({ id: this.cacheCallbackId });
        }
    }

    private async render() {
        const content = this.containerEl.createEl('div');
        if (this.cache.getState() === State.Warm) {
            const { taskList, tasksCount } = await this.createTasksList(
                content,
            );
            content.appendChild(taskList);
            content.createDiv({
                text: `${tasksCount} task${tasksCount !== 1 ? 's' : ''}`,
                cls: 'tasks-count',
            });
        } else {
            content.innerHTML = 'Loading Tasks ...';
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

        const tasksSortedLimited = Sort.byDateThenPath(tasks).slice(
            0,
            this.query.limit,
        );
        const tasksCount = tasksSortedLimited.length;

        const taskList = content.createEl('ul');
        taskList.addClass('contains-task-list');
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

                link.innerHTML = `&nbsp;(${fileName}`;
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
                        link.innerHTML =
                            link.innerHTML + ' > ' + task.precedingHeader;
                    }
                }
                link.innerHTML = link.innerHTML + ')';

                listItem.appendChild(link);
            }

            taskList.appendChild(listItem);
        }

        return { taskList, tasksCount };
    }
}
