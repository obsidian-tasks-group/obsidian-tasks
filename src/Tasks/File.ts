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
    }): Promise<void> {
        const lines = await this.obsidian.readLines({ path });
        if (lines === undefined) {
            return;
        }

        const line = lines[lineNumber];
        lines[lineNumber] = this.toggleLine({
            line,
            path,
            lineNumber,
        });

        await this.obsidian.writeLines({ path, lines });
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
