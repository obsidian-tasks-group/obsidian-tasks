import { MarkdownPostProcessorContext, Plugin } from 'obsidian';
import { getSettings } from 'Settings';

import { Task } from './Task';

export class InlineRenderer {
    constructor({ plugin }: { plugin: Plugin }) {
        plugin.registerMarkdownPostProcessor(
            this.markdownPostProcessor.bind(this),
        );
    }

    private async markdownPostProcessor(
        element: HTMLElement,
        context: MarkdownPostProcessorContext,
    ): Promise<void> {
        const { globalFilter } = getSettings();
        const renderedElements = element
            .findAll('.task-list-item')
            .filter((taskItem) => {
                // Only the first line. Can be multiple lines if an LI element contains an UL.
                // Want to match the top level LI independently from its children.
                // There was a false positive, when the LI wasn't a task itself, but contained the
                // global filter in child LIs.
                const firstLineText = taskItem.textContent?.split('\n')[0];
                return firstLineText?.includes(globalFilter);
            });
        if (renderedElements.length === 0) {
            // No tasks means nothing to do.
            return;
        }

        const path = context.sourcePath;
        const section = context.getSectionInfo(element);

        if (section === null) {
            // We cannot process the render without the section info.
            return;
        }

        const fileLines = section.text.split('\n');

        let sectionIndex = 0;
        const fileTasks: Task[] = [];
        for (
            let lineNumber = section.lineStart;
            lineNumber <= section.lineEnd;
            lineNumber++
        ) {
            const line = fileLines[lineNumber];
            if (line === undefined) {
                // If we end up outside the range of the file,
                // we cannot process this task.
                continue;
            }

            const task = Task.fromLine({
                line,
                path,
                sectionStart: section.lineStart,
                sectionIndex,
                precedingHeader: null, // We don't need the preceding header for in-line rendering.
            });
            if (task !== null) {
                fileTasks.push(task);
                sectionIndex++;
            }
        }

        // The section index is the nth task within this section.
        for (
            let sectionIndex = 0;
            sectionIndex < renderedElements.length;
            sectionIndex++
        ) {
            const task = fileTasks[sectionIndex];
            const renderedElement = renderedElements[sectionIndex];

            if (task === undefined || renderedElement === undefined) {
                // Assuming match of tasks in file and render preview.
                // If there is a mis-match in the numbers, we still process
                // what we can.
                continue;
            }

            const dataLine: string =
                renderedElement.getAttr('data-line') ?? '0';
            const listIndex: number = Number.parseInt(dataLine, 10);
            const cachedElement = await task.toLi({
                parentUlElement: element,
                listIndex,
            });

            // If the rendered element contains a sub-list, we need to keep it.
            renderedElement.findAll('ul').map((renderedSubUl) => {
                cachedElement.appendChild(renderedSubUl);
            });
            renderedElement.replaceWith(cachedElement);
        }
    }
}
