import { MarkdownPostProcessorContext, Plugin } from 'obsidian';

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
        const renderedTasks = element.findAll('.task-list-item');
        if (renderedTasks.length === 0) {
            // No tasks means nothing to do.
            return;
        }

        const path = context.sourcePath;
        const section = context.getSectionInfo(element);

        if (section === null) {
            // Should render once the section is available.
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
                // File may not have caught up with editor.
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
            sectionIndex < renderedTasks.length;
            sectionIndex++
        ) {
            const task = fileTasks[sectionIndex];
            const renderedElement = renderedTasks[sectionIndex];

            if (task === undefined || renderedElement === undefined) {
                // Assuming match of tasks in file and render preview.
                // If there is a mis-match in the numbers, we still process
                // what we can.
                continue;
            }

            const cachedElement = await task.toLi({ parentUlElement: element });
            renderedElement.replaceWith(cachedElement);
        }
    }
}
