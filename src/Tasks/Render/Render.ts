import { MarkdownPostProcessorContext } from 'obsidian';

import { Obsidian } from '../../Obsidian';
import { CLASS_ITEM, Task } from '../Task';
import { Cache } from '../Cache';
import { Query } from './Query';
import { Transclusion } from './Transclusion';
import { TaskItem } from './TaskItem';

export class Render {
    private readonly cache: Cache;
    private readonly taskItem: TaskItem;
    private readonly obsidian: Obsidian;

    public constructor({
        cache,
        taskItem,
        obsidian,
    }: {
        cache: Cache;
        taskItem: TaskItem;
        obsidian: Obsidian;
    }) {
        this.cache = cache;
        this.taskItem = taskItem;
        this.obsidian = obsidian;

        this.obsidian.registerMarkdownPostProcessor(
            this.renderInLineTasks.bind(this),
        );

        this.obsidian.registerCodeBlockPostProcessor(
            this.renderTranscludedTasks.bind(this),
        );
    }

    private renderInLineTasks(
        element: HTMLElement,
        context: MarkdownPostProcessorContext,
    ) {
        const path = context.sourcePath;
        Object.values(element.querySelectorAll('LI')).forEach((listItem) => {
            if (listItem.hasClass(CLASS_ITEM)) {
                // has already been processed
                return;
            }

            const task = Task.fromLi({
                element: listItem,
                path,
            });

            if (task === undefined) {
                // Do not process LIs that are not a task.
                return;
            }

            this.taskItem.processListItem({ listItem, task });
        });
    }

    private async renderTranscludedTasks(
        source: string,
        element: HTMLElement,
        context: MarkdownPostProcessorContext,
    ) {
        const query = new Query({ source });

        context.addChild(
            new Transclusion({
                cache: this.cache,
                taskItem: this.taskItem,
                container: element,
                filters: query.filters,
            }),
        );
    }
}
