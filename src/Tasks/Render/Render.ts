import { MarkdownPostProcessorContext } from 'obsidian';

import { Obsidian } from '../../Obsidian';
import { CLASS_ITEM, Task } from '../Task';
import { Cache } from '../Cache';
import { Query } from './Query';
import { Transclusion } from './Transclusion';
import { Checkbox } from './Checkbox';
import { ListItem } from './ListItem';

export class Render {
    private readonly cache: Cache;
    private readonly obsidian: Obsidian;

    public constructor({
        cache,
        obsidian,
    }: {
        cache: Cache;
        obsidian: Obsidian;
    }) {
        this.cache = cache;
        this.obsidian = obsidian;

        this.obsidian.registerMarkdownPostProcessor(
            this.renderCheckBoxes.bind(this),
        );

        this.obsidian.registerCodeBlockPostProcessor(
            this.renderTranscludedTasks.bind(this),
        );
    }

    private renderCheckBoxes(
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

            ListItem.addAttributes({ listItem, task });
            Checkbox.prependTo({ listItem, taskStatus: task.status });
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
                container: element,
                filters: query.filters,
            }),
        );
    }
}
