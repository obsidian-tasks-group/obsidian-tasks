import { MarkdownRenderChild } from 'obsidian';
import { Task } from '../Task';
import { Cache } from '../Cache';
import { Sort } from './Sort';
import { ListItem } from './ListItem';

export class Transclusion extends MarkdownRenderChild {
    private readonly cache: Cache;
    private readonly container: HTMLElement;
    private readonly filters: ((task: Task) => boolean)[];

    // private cacheCallbackId: number | undefined;

    constructor({
        cache,
        container,
        filters,
    }: {
        cache: Cache;
        container: HTMLElement;
        filters: ((task: Task) => boolean)[];
    }) {
        super();

        this.cache = cache;
        this.container = container;
        this.filters = filters;
    }

    onload() {
        this.render();
        // this.cacheCallbackId =
        this.cache.register({
            handler: this.render.bind(this),
        });
    }

    // onunload() {
    //     // TODO: this is not working, it is always immediately unloading
    //     // https://github.com/schemar/obsidian-tasks/issues/14
    //     if (this.cacheCallbackId !== undefined) {
    //         this.cache.unregister(this.cacheCallbackId);
    //     }
    // }

    public async render() {
        const allTaskLists = this.container.createEl('div');
        let tasks = this.cache.getTasks();
        for (const filter of this.filters) {
            tasks = tasks.filter(filter);
        }

        const taskList = allTaskLists.createEl('ul');
        for (const task of Sort.byDateThenPath(tasks)) {
            let fileName: string | undefined;
            const fileNameMatch = task.path.match(/([^/]+)\.md$/);
            if (fileNameMatch !== null) {
                fileName = fileNameMatch[1];
            }

            const listItem = await ListItem.fromTask({
                task,
                parentComponent: this,
            });
            if (fileName !== undefined) {
                const link = listItem.createEl('a');
                link.href = fileName;
                link.setAttribute('data-href', fileName);
                link.rel = 'noopener';
                link.target = '_blank';
                link.addClass('internal-link');

                link.innerHTML = `&nbsp;(${fileName}`;
                if (task.precedingHeader !== undefined) {
                    link.href = link.href + '#' + task.precedingHeader;
                    link.setAttribute(
                        'data-href',
                        link.getAttribute('data-href') +
                            '#' +
                            task.precedingHeader,
                    );
                    link.innerHTML =
                        link.innerHTML + ' > ' + task.precedingHeader;
                }
                link.innerHTML = link.innerHTML + ')';

                listItem.appendChild(link);
            }

            taskList.appendChild(listItem);
        }

        allTaskLists.appendChild(taskList);

        this.container.firstChild?.replaceWith(allTaskLists);
    }
}
