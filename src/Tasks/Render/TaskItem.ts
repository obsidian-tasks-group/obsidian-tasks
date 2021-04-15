import stringSimilarity from 'string-similarity';
import { Obsidian } from '../../Obsidian';
import { File } from '../File';
import { Settings } from '../Settings';
import { Status } from '../Status';
import { Task } from '../Task';
import { NodeTypes } from './NodeTypes';

export const CLASS_CHECKBOX = 'tasks-checkbox';

export class TaskItem {
    private readonly file: File;
    private readonly obsidian: Obsidian;

    constructor({ file, obsidian }: { file: File; obsidian: Obsidian }) {
        this.file = file;
        this.obsidian = obsidian;
    }

    public processListItem({
        listItem,
        task,
    }: {
        listItem: Element;
        task: Task;
    }): void {
        listItem.addClass(Settings.CLASS_ITEM);
        listItem.setAttribute(Settings.DATA_PATH, task.path);
        if (task.pageIndex !== undefined) {
            listItem.setAttribute(
                Settings.DATA_PAGE_INDEX,
                task.pageIndex.toString(),
            );
        }

        for (let i = 0; i < listItem.childNodes.length; i = i + 1) {
            const childNode = listItem.childNodes[i];
            if (
                // Prepend to the first text child in the list item.
                childNode.nodeType == NodeTypes.TEXT &&
                childNode.textContent !== null
            ) {
                childNode.textContent = this.removeTagIfPresent(
                    childNode.textContent,
                );

                const checkbox: HTMLInputElement = document.createElement(
                    'INPUT',
                ) as HTMLInputElement;
                checkbox.type = 'checkbox';
                checkbox.addClass(CLASS_CHECKBOX);
                if (task.status !== Status.TODO) {
                    checkbox.checked = true;
                }

                checkbox.addEventListener('click', async (event) => {
                    this.handleCheckboxClick({ event, listItem });
                });

                listItem.prepend(checkbox);
                break; // Break loop as we only need one checkbox.
            }
        }
    }

    private async handleCheckboxClick({
        event,
        listItem,
    }: {
        event: UIEvent;
        listItem: Element;
    }): Promise<void> {
        event.preventDefault();

        const path = listItem.getAttribute(Settings.DATA_PATH);
        if (path === null) {
            return;
        }

        const fileLines = await this.obsidian.readLines({ path });
        if (fileLines === undefined) {
            return;
        }

        let lineNumber: number | undefined;
        // Use the page index if it is available. It is more accurate and
        // should be faster than calculating the string similarity.
        const pageIndex = listItem.getAttribute(Settings.DATA_PAGE_INDEX);
        if (pageIndex) {
            lineNumber = this.getLineNumberBasedOnPageIndex({
                pageIndex,
                fileLines,
            });
        } else {
            lineNumber = this.getMostSimilarLineNumber({
                listItem,
                fileLines,
            });
        }

        if (lineNumber !== undefined) {
            this.file.toggleDone({
                path,
                lineNumber,
            });
        }
    }

    private removeTagIfPresent(text: string): string {
        const existingStatusRegex = new RegExp(
            `^${Settings.TASK_TAG} (.*)`,
            'u',
        );
        const existingStatusMatch = text.match(existingStatusRegex);
        if (existingStatusMatch !== null) {
            text = existingStatusMatch[2];
        }

        return text;
    }

    private getLineNumberBasedOnPageIndex({
        pageIndex,
        fileLines,
    }: {
        pageIndex: string;
        fileLines: string[];
    }): number | undefined {
        let currentIndex = 0;
        for (
            let currentLine = 0;
            currentLine < fileLines.length;
            currentLine = currentLine + 1
        ) {
            if (Settings.REGEX_TASK.test(fileLines[currentLine])) {
                if (currentIndex.toString() === pageIndex) {
                    return currentLine;
                }
                currentIndex = currentIndex + 1;
            }
        }

        return undefined;
    }

    private getMostSimilarLineNumber({
        listItem,
        fileLines,
    }: {
        listItem: Element;
        fileLines: string[];
    }): number | undefined {
        if (listItem.textContent === null) {
            console.error(
                "Tasks: cannot toggle task: li's `textContent` is `null`",
            );

            return undefined;
        }
        const liText = listItem.textContent.split('\n')[0];

        let maxSimilarity = 0;
        let mostSimilarLine: number | undefined = undefined;
        for (
            let currentLine = 0;
            currentLine < fileLines.length;
            currentLine = currentLine + 1
        ) {
            const match = fileLines[currentLine].match(Settings.REGEX_TASK);
            if (match !== null) {
                // The LI only knows the text part after the list identifier
                // and the status.
                const taskText = match[3] + match[4];
                const similarity = stringSimilarity.compareTwoStrings(
                    taskText,
                    liText,
                );
                if (similarity > maxSimilarity) {
                    maxSimilarity = similarity;
                    mostSimilarLine = currentLine;
                }
            }
        }

        return mostSimilarLine;
    }
}
