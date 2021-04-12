import { Obsidian } from 'Obsidian';
import { Task } from './Task';

export class File {
    private readonly obsidian: Obsidian;

    constructor({ obsidian }: { obsidian: Obsidian }) {
        this.obsidian = obsidian;
    }

    public async toggleDone({
        path,
        lineNumber,
    }: {
        path: string;
        lineNumber: number;
    }) {
        const fileLines = await this.obsidian.readLines({ path });
        const line = fileLines[lineNumber];
        fileLines[lineNumber] = this.toggleLine({
            line,
            path,
            lineNumber,
        });

        await this.obsidian.writeLines({ path, lines: fileLines });
    }

    private toggleLine({
        line,
        path,
        lineNumber,
    }: {
        line: string;
        path: string;
        lineNumber: number;
    }): string {
        const task = Task.fromLine({
            line,
            path,
            lineNumber,
            pageIndex: undefined,
            precedingHeader: undefined,
        });
        if (task === undefined) {
            return line;
        }

        const toggledTask = task.toggle();

        return toggledTask.toFileString();
    }
}
