import { type App, Menu, Notice, TFile } from 'obsidian';
import type { Task } from '../../Task/Task';
import { moveTaskToSection } from '../../Obsidian/File';

/**
 * Groups tasks by file path and section header.
 */
interface FileWithSections {
    file: TFile;
    sections: Map<string | null, Task[]>;
    lastModified: number;
}

/**
 * A Menu for moving a task to a different file or section.
 *
 * The menu displays files sorted by last modified time, with sections
 * listed under each file. Uses a flat menu structure with separators.
 *
 * @example
 *     moveButton.addEventListener('click', (ev: MouseEvent) => {
 *         const menu = new MoveTaskMenu(app, task, allTasks);
 *         menu.showAtPosition({ x: ev.clientX, y: ev.clientY });
 *     });
 */
export class MoveTaskMenu extends Menu {
    private readonly app: App;
    private readonly task: Task;
    private readonly allTasks: Task[];

    constructor(app: App, task: Task, allTasks: Task[]) {
        super();
        this.app = app;
        this.task = task;
        this.allTasks = allTasks;

        this.buildMenu();
    }

    private buildMenu(): void {
        const filesWithSections = this.getFilesWithSections();

        if (filesWithSections.length === 0) {
            this.addItem((item) => {
                item.setTitle('No files with tasks found').setDisabled(true);
            });
            return;
        }

        // Limit to top 10 most recently modified files to keep menu manageable
        const filesToShow = filesWithSections.slice(0, 10);

        for (let i = 0; i < filesToShow.length; i++) {
            const fileData = filesToShow[i];
            this.addFileSection(fileData);

            // Add separator between files (but not after the last one)
            if (i < filesToShow.length - 1) {
                this.addSeparator();
            }
        }
    }

    /**
     * Gets all files that contain tasks, grouped by sections, sorted by last modified time.
     */
    private getFilesWithSections(): FileWithSections[] {
        // Group tasks by file path
        const tasksByFile = new Map<string, Task[]>();
        for (const task of this.allTasks) {
            const path = task.path;
            if (!tasksByFile.has(path)) {
                tasksByFile.set(path, []);
            }
            tasksByFile.get(path)!.push(task);
        }

        // Convert to FileWithSections array
        const filesWithSections: FileWithSections[] = [];

        for (const [path, tasks] of tasksByFile) {
            const abstractFile = this.app.vault.getAbstractFileByPath(path);
            if (!(abstractFile instanceof TFile)) {
                continue;
            }

            // Group tasks by section (precedingHeader)
            const sections = new Map<string | null, Task[]>();
            for (const task of tasks) {
                const header = task.precedingHeader;
                if (!sections.has(header)) {
                    sections.set(header, []);
                }
                sections.get(header)!.push(task);
            }

            filesWithSections.push({
                file: abstractFile,
                sections,
                lastModified: abstractFile.stat.mtime,
            });
        }

        // Sort by last modified time (most recent first)
        filesWithSections.sort((a, b) => b.lastModified - a.lastModified);

        return filesWithSections;
    }

    /**
     * Adds menu items for a file and its sections.
     */
    private addFileSection(fileData: FileWithSections): void {
        const isCurrentFile = fileData.file.path === this.task.path;
        const fileName = fileData.file.basename;

        // Add file header as a disabled item
        this.addItem((item) => {
            item.setTitle(`📄 ${fileName}${isCurrentFile ? ' (current)' : ''}`).setDisabled(true);
        });

        // Sort sections: null (no heading) last, others by their first occurrence in the file
        const sortedSections = Array.from(fileData.sections.entries()).sort((a, b) => {
            // null (no heading) goes last
            if (a[0] === null && b[0] !== null) return 1;
            if (a[0] !== null && b[0] === null) return -1;
            // Otherwise sort by the minimum line number of tasks in each section
            const minLineA = Math.min(...a[1].map((t) => t.lineNumber));
            const minLineB = Math.min(...b[1].map((t) => t.lineNumber));
            return minLineA - minLineB;
        });

        // Add section items
        for (const [sectionHeader, tasks] of sortedSections) {
            const isCurrentSection = isCurrentFile && this.task.precedingHeader === sectionHeader;
            const sectionName = sectionHeader ?? '(No heading)';
            const taskCount = tasks.length;

            this.addItem((item) => {
                item.setTitle(`    ${sectionName} (${taskCount})${isCurrentSection ? ' ← here' : ''}`)
                    .setDisabled(isCurrentSection)
                    .onClick(async () => {
                        await this.moveTask(fileData.file, sectionHeader);
                    });
            });
        }

        // Add option to move to end of file
        this.addItem((item) => {
            item.setTitle('    → End of file').onClick(async () => {
                await this.moveTask(fileData.file, null, true);
            });
        });
    }

    /**
     * Moves the task to the specified file and section.
     */
    private async moveTask(
        targetFile: TFile,
        sectionHeader: string | null,
        appendToEnd: boolean = false,
    ): Promise<void> {
        try {
            await moveTaskToSection({
                originalTask: this.task,
                targetFile,
                targetSectionHeader: sectionHeader,
                appendToEnd,
                vault: this.app.vault,
                metadataCache: this.app.metadataCache,
            });
            new Notice(`Task moved to ${targetFile.basename}`, 2000);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            new Notice(`Failed to move task: ${message}`, 5000);
            console.error('Failed to move task:', error);
        }
    }
}

/**
 * Helper function to show the move menu.
 */
export function showMoveMenu(ev: MouseEvent, app: App, task: Task, allTasks: Task[]): void {
    ev.preventDefault();
    ev.stopPropagation();
    const menu = new MoveTaskMenu(app, task, allTasks);
    menu.showAtPosition({ x: ev.clientX, y: ev.clientY });
}
