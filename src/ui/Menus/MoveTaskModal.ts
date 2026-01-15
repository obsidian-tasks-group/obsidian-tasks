import { type App, Notice, SuggestModal, TFile } from 'obsidian';
import type { Task } from '../../Task/Task';
import { moveTaskToSection } from '../../Obsidian/File';
import { getSettings } from '../../Config/Settings';
import { GlobalFilter } from '../../Config/GlobalFilter';

/**
 * Represents a destination option in the move task modal.
 */
interface MoveDestination {
    /** The target file */
    file: TFile;
    /** The section header (null for "no heading" or end of file) */
    sectionHeader: string | null;
    /** If true, append to the end of the file */
    appendToEnd: boolean;
    /** The folder path (without filename) */
    folderPath: string;
    /** The filename without extension */
    fileName: string;
    /** Section display name */
    sectionDisplay: string;
    /** The full path for filtering */
    searchText: string;
    /** Number of tasks in this section */
    taskCount: number;
    /** Whether this is the current location of the task */
    isCurrent: boolean;
}

/**
 * File data with sections for building destinations.
 */
interface FileData {
    file: TFile;
    sections: Map<string | null, Task[]>;
    lastModified: number;
}

/**
 * A modal for selecting a destination to move a task to.
 *
 * Uses Obsidian's SuggestModal for fuzzy filtering support.
 * Shows files sorted by last modified time with disambiguated paths.
 */
export class MoveTaskModal extends SuggestModal<MoveDestination> {
    private readonly task: Task;
    private readonly allTasks: Task[];
    private readonly destinations: MoveDestination[];
    private readonly editorCursorLine?: number;

    constructor(app: App, task: Task, allTasks: Task[], editorCursorLine?: number) {
        super(app);
        this.task = task;
        this.allTasks = allTasks;
        this.editorCursorLine = editorCursorLine;
        this.destinations = this.buildDestinations();

        this.setPlaceholder('Type to filter files and sections...');
        this.setInstructions([
            { command: '↑↓', purpose: 'to navigate' },
            { command: '↵', purpose: 'to select' },
            { command: 'esc', purpose: 'to dismiss' },
        ]);
    }

    /**
     * Build the list of all possible destinations.
     * Only includes files/sections with tasks that match the global filter.
     */
    private buildDestinations(): MoveDestination[] {
        const settings = getSettings();
        const excludedPaths = settings.moveTaskExcludedPaths || [];

        // Group tasks by file path, filtering by global filter
        const tasksByFile = this.groupTasksByFile(excludedPaths);

        // Build file data with sections
        const filesData = this.buildFilesData(tasksByFile);

        // Sort by last modified (most recent first)
        filesData.sort((a, b) => b.lastModified - a.lastModified);

        // Build destinations from files data
        return this.buildDestinationsFromFilesData(filesData);
    }

    /**
     * Groups tasks by file path, excluding paths and filtering by global filter.
     */
    private groupTasksByFile(excludedPaths: string[]): Map<string, Task[]> {
        const globalFilter = GlobalFilter.getInstance();
        const tasksByFile = new Map<string, Task[]>();

        for (const task of this.allTasks) {
            const path = task.path;

            // Check if path is excluded
            if (this.isPathExcluded(path, excludedPaths)) {
                continue;
            }

            // Check if task matches global filter (same logic as Tasks plugin uses)
            if (!globalFilter.isEmpty() && !globalFilter.includedIn(task.originalMarkdown)) {
                continue;
            }

            if (!tasksByFile.has(path)) {
                tasksByFile.set(path, []);
            }
            tasksByFile.get(path)!.push(task);
        }

        return tasksByFile;
    }

    /**
     * Builds file data with sections from grouped tasks.
     */
    private buildFilesData(tasksByFile: Map<string, Task[]>): FileData[] {
        const filesData: FileData[] = [];

        for (const [path, tasks] of tasksByFile) {
            const abstractFile = this.app.vault.getAbstractFileByPath(path);
            if (!(abstractFile instanceof TFile)) {
                continue;
            }

            // Group tasks by section
            const sections = new Map<string | null, Task[]>();
            for (const task of tasks) {
                const header = task.precedingHeader;
                if (!sections.has(header)) {
                    sections.set(header, []);
                }
                sections.get(header)!.push(task);
            }

            filesData.push({
                file: abstractFile,
                sections,
                lastModified: abstractFile.stat.mtime,
            });
        }

        return filesData;
    }

    /**
     * Builds destination entries from files data.
     */
    private buildDestinationsFromFilesData(filesData: FileData[]): MoveDestination[] {
        const destinations: MoveDestination[] = [];

        for (const fileData of filesData) {
            const isCurrentFile = fileData.file.path === this.task.path;
            const fullPath = fileData.file.path;
            const lastSlash = fullPath.lastIndexOf('/');
            const folderPath = lastSlash >= 0 ? fullPath.substring(0, lastSlash) : '';
            const fileName = fileData.file.basename;

            // Sort sections by line number
            const sortedSections = this.sortSectionsByLineNumber(fileData.sections);

            // Add section destinations
            for (const [sectionHeader, tasks] of sortedSections) {
                const isCurrentSection = isCurrentFile && this.task.precedingHeader === sectionHeader;
                destinations.push(
                    this.createSectionDestination(fileData.file, sectionHeader, folderPath, fileName, fullPath, tasks.length, isCurrentSection),
                );
            }

            // Add "end of file" option
            destinations.push(this.createEndOfFileDestination(fileData.file, folderPath, fileName, fullPath));
        }

        return destinations;
    }

    /**
     * Sorts sections by line number.
     */
    private sortSectionsByLineNumber(sections: Map<string | null, Task[]>): Array<[string | null, Task[]]> {
        return Array.from(sections.entries()).sort((a, b) => {
            if (a[0] === null && b[0] !== null) return 1;
            if (a[0] !== null && b[0] === null) return -1;
            const minLineA = Math.min(...a[1].map((t) => t.lineNumber));
            const minLineB = Math.min(...b[1].map((t) => t.lineNumber));
            return minLineA - minLineB;
        });
    }

    /**
     * Creates a destination entry for a section.
     */
    private createSectionDestination(
        file: TFile,
        sectionHeader: string | null,
        folderPath: string,
        fileName: string,
        fullPath: string,
        taskCount: number,
        isCurrent: boolean,
    ): MoveDestination {
        const sectionDisplay = sectionHeader ?? '(no heading)';
        return {
            file,
            sectionHeader,
            appendToEnd: false,
            folderPath,
            fileName,
            sectionDisplay,
            searchText: `${fullPath} ${sectionDisplay}`,
            taskCount,
            isCurrent,
        };
    }

    /**
     * Creates a destination entry for end of file.
     */
    private createEndOfFileDestination(file: TFile, folderPath: string, fileName: string, fullPath: string): MoveDestination {
        return {
            file,
            sectionHeader: null,
            appendToEnd: true,
            folderPath,
            fileName,
            sectionDisplay: '(end of file)',
            searchText: `${fullPath} end of file`,
            taskCount: 0,
            isCurrent: false,
        };
    }

    /**
     * Check if a path should be excluded based on the excluded paths setting.
     */
    private isPathExcluded(filePath: string, excludedPaths: string[]): boolean {
        for (const excludedPath of excludedPaths) {
            if (!excludedPath) continue;
            // Normalize the excluded path (remove leading/trailing slashes)
            // Using string methods instead of regex to avoid ReDoS vulnerability
            const normalizedExcluded = this.trimSlashes(excludedPath);
            if (filePath.startsWith(normalizedExcluded + '/') || filePath === normalizedExcluded) {
                return true;
            }
        }
        return false;
    }

    /**
     * Removes leading and trailing slashes from a path string.
     */
    private trimSlashes(path: string): string {
        let start = 0;
        let end = path.length;

        while (start < end && path[start] === '/') {
            start++;
        }
        while (end > start && path[end - 1] === '/') {
            end--;
        }

        return path.slice(start, end);
    }

    /**
     * Get suggestions based on the query.
     */
    getSuggestions(query: string): MoveDestination[] {
        const lowerQuery = query.toLowerCase();

        if (!lowerQuery) {
            return this.destinations;
        }

        // Filter destinations by query
        return this.destinations.filter((dest) => {
            return dest.searchText.toLowerCase().includes(lowerQuery);
        });
    }

    /**
     * Render a suggestion item with clear visual hierarchy:
     * - Folder path (dimmer, smaller)
     * - Filename (prominent)
     * - Section (italic, with task count)
     */
    renderSuggestion(destination: MoveDestination, el: HTMLElement): void {
        el.addClass('move-task-suggestion');

        if (destination.isCurrent) {
            el.addClass('is-current');
        }

        // Create the main container
        const container = el.createDiv({ cls: 'move-task-destination' });

        // File info line
        const fileRow = container.createDiv({ cls: 'move-task-file-row' });

        // Folder path (dimmer)
        if (destination.folderPath) {
            fileRow.createSpan({
                text: destination.folderPath + '/',
                cls: 'move-task-folder',
            });
        }

        // Filename (prominent)
        fileRow.createSpan({
            text: destination.fileName,
            cls: 'move-task-filename',
        });

        // Section line
        const sectionRow = container.createDiv({ cls: 'move-task-section-row' });

        // Arrow and section name (italic)
        sectionRow.createSpan({
            text: '→ ',
            cls: 'move-task-arrow',
        });

        const sectionText =
            destination.taskCount > 0
                ? `${destination.sectionDisplay} (${destination.taskCount})`
                : destination.sectionDisplay;

        sectionRow.createSpan({
            text: sectionText,
            cls: 'move-task-section',
        });

        // Current indicator
        if (destination.isCurrent) {
            sectionRow.createSpan({
                text: ' ← current',
                cls: 'move-task-current',
            });
        }
    }

    /**
     * Handle selection of a destination.
     */
    async onChooseSuggestion(destination: MoveDestination, _evt: MouseEvent | KeyboardEvent): Promise<void> {
        if (destination.isCurrent) {
            // Notice constructor displays the notification as a side effect
            void new Notice('Task is already in this location', 2000);
            return;
        }

        try {
            await moveTaskToSection({
                originalTask: this.task,
                targetFile: destination.file,
                targetSectionHeader: destination.sectionHeader,
                appendToEnd: destination.appendToEnd,
                vault: this.app.vault,
                metadataCache: this.app.metadataCache,
                editorCursorLine: this.editorCursorLine,
            });
            // Notice constructor displays the notification as a side effect
            void new Notice(`Task moved to ${destination.file.basename}`, 2000);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            // Notice constructor displays the notification as a side effect
            void new Notice(`Failed to move task: ${message}`, 5000);
            console.error('Failed to move task:', error);
        }
    }
}

/**
 * Helper function to open the move task modal.
 * @param app - The Obsidian app instance
 * @param task - The task to move
 * @param allTasks - All tasks in the vault (for building destination list)
 * @param editorCursorLine - Optional cursor line for reliable deletion when moving from editor
 */
export function openMoveTaskModal(app: App, task: Task, allTasks: Task[], editorCursorLine?: number): void {
    new MoveTaskModal(app, task, allTasks, editorCursorLine).open();
}
