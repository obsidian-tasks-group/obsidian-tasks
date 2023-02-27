import { getSettings } from 'Config/Settings';

import type { MarkdownPostProcessorContext, Plugin } from 'obsidian';
import { Task } from './Task';
import { TaskLocation } from './TaskLocation';

export class InlineRenderer {
    constructor({ plugin }: { plugin: Plugin }) {
        plugin.registerMarkdownPostProcessor(this._markdownPostProcessor.bind(this));
    }

    public markdownPostProcessor = this._markdownPostProcessor.bind(this);

    private async _markdownPostProcessor(element: HTMLElement, context: MarkdownPostProcessorContext): Promise<void> {
        const { globalFilter } = getSettings();
        const renderedElements = element.findAll('.task-list-item').filter((taskItem) => {
            const linesText = taskItem.textContent?.split('\n');
            if (linesText === undefined) {
                return false;
            }

            // Only the first line. Can be multiple lines if an LI element contains an UL.
            // Want to match the top level LI independently from its children.
            // There was a false positive, when the LI wasn't a task itself, but contained the
            // global filter in child LIs.
            let firstLineText: string | null = null;

            // The first line is the first line that is not empty. Empty lines can exist when
            // the checklist in markdown includes blank lines (see #313).
            for (let i = 0; i < linesText.length; i = i + 1) {
                if (linesText[i] !== '') {
                    firstLineText = linesText[i];
                    break;
                }
            }

            if (firstLineText === null) {
                return false;
            }

            return firstLineText.includes(globalFilter);
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
        for (let lineNumber = section.lineStart; lineNumber <= section.lineEnd; lineNumber++) {
            const line = fileLines[lineNumber];
            if (line === undefined) {
                // If we end up outside the range of the file,
                // we cannot process this task.
                continue;
            }

            const precedingHeader = null; // We don't need the preceding header for in-line rendering.
            const task = Task.fromLine({
                line,
                taskLocation: new TaskLocation(path, lineNumber, section.lineStart, sectionIndex, precedingHeader),
                fallbackDate: null, // We don't need the fallback date for in-line rendering
            });
            if (task !== null) {
                fileTasks.push(task);
                sectionIndex++;
            }
        }

        // The section index is the nth task within this section.
        for (let sectionIndex = 0; sectionIndex < renderedElements.length; sectionIndex++) {
            const task = fileTasks[sectionIndex];
            const renderedElement = renderedElements[sectionIndex];

            if (task === undefined || renderedElement === undefined) {
                // Assuming match of tasks in file and render preview.
                // If there is a mis-match in the numbers, we still process
                // what we can.
                continue;
            }

            const dataLine: string = renderedElement.getAttr('data-line') ?? '0';
            const listIndex: number = Number.parseInt(dataLine, 10);
            const taskElement = await task.toLi({
                parentUlElement: element,
                listIndex,
            });

            // If the rendered element contains a sub-list or sub-div (e.g. the
            // folding arrow), we need to keep it.
            const renderedChildren = renderedElement.childNodes;
            for (let i = 0; i < renderedChildren.length; i = i + 1) {
                const renderedChild = renderedChildren[i];
                if (renderedChild.nodeName.toLowerCase() === 'div') {
                    taskElement.prepend(renderedChild);
                } else if (renderedChild.nodeName.toLowerCase() === 'ul') {
                    taskElement.append(renderedChild);
                }
            }

            // Re-set the original footnotes.
            // The newly rendered HTML won't have the correct indexes and links
            // from the original document.
            const originalFootnotes = renderedElement.querySelectorAll('[data-footnote-id]');
            const newFootnotes = taskElement.querySelectorAll('[data-footnote-id]');
            if (originalFootnotes.length === newFootnotes.length) {
                for (let i = 0; i < originalFootnotes.length; i++) {
                    newFootnotes[i].replaceWith(originalFootnotes[i]);
                }
            }

            renderedElement.replaceWith(taskElement);
        }
    }
}
