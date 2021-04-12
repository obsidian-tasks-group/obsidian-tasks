import stringSimilarity from 'string-similarity';
import { Obsidian } from '../Obsidian';
import { File } from './File';
import { CLASS_CHECKBOX } from './Render';
import { DATA_PAGE_INDEX, DATA_PATH, REGEX_TASK } from './Task';

export class Events {
    private readonly file: File;
    private readonly obsidian: Obsidian;

    constructor({ file, obsidian }: { file: File; obsidian: Obsidian }) {
        this.file = file;
        this.obsidian = obsidian;

        this.obsidian.subscribeToClickEvent(
            this.handleCheckBoxClick.bind(this),
        );
    }

    private async handleCheckBoxClick(event: MouseEvent): Promise<void> {
        if ((event.target as any)?.hasClass(CLASS_CHECKBOX)) {
            event.preventDefault();

            const liElement = (event as any)?.path[1];
            if (liElement.nodeName !== 'LI') {
                return;
            }

            const path = liElement.getAttribute(DATA_PATH);

            const fileLines = await this.obsidian.readLines({ path });
            if (fileLines === undefined) {
                return;
            }

            let lineNumber: number | undefined;
            // Use the page index if it is available. It is more accurate and
            // should be faster than calculating the string similarity.
            const pageIndex = liElement.getAttribute(DATA_PAGE_INDEX);
            if (pageIndex) {
                lineNumber = this.getLineNumberBasedOnPageIndex({
                    pageIndex,
                    fileLines,
                });
            } else {
                lineNumber = this.getMostSimilarLineNumber({
                    liElement,
                    fileLines,
                });
            }

            if (lineNumber !== undefined) {
                await this.file.toggleDone({
                    path,
                    lineNumber,
                });
            }
        }
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
            if (REGEX_TASK.test(fileLines[currentLine])) {
                if (currentIndex.toString() === pageIndex) {
                    return currentLine;
                }
                currentIndex = currentIndex + 1;
            }
        }

        return undefined;
    }

    private getMostSimilarLineNumber({
        liElement,
        fileLines,
    }: {
        liElement: Element;
        fileLines: string[];
    }): number | undefined {
        if (liElement.textContent === null) {
            console.error(
                "Tasks: cannot toggle task: li's `textContent` is `null`",
            );

            return undefined;
        }
        const liText = liElement.textContent.split('\n')[0];

        let maxSimilarity = 0;
        let mostSimilarLine: number | undefined = undefined;
        for (
            let currentLine = 0;
            currentLine < fileLines.length;
            currentLine = currentLine + 1
        ) {
            const match = fileLines[currentLine].match(REGEX_TASK);
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
