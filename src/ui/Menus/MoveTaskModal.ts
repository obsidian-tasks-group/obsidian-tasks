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
    /** Display text for the option */
    displayText: string;
    /** The full path for filtering */
    searchText: string;
    /** Number of tasks in this section */
    taskCount: number;
    /** Whether this is the current location of the task */
    isCurrent: boolean;
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
        const destinations: MoveDestination[] = [];
        const settings = getSettings();
        const excludedPaths = settings.moveTaskExcludedPaths || [];
        const globalFilter = GlobalFilter.getInstance();

        // Group tasks by file path, filtering by global filter
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

        // Build file data with sections
        interface FileData {
            file: TFile;
            sections: Map<string | null, Task[]>;
            lastModified: number;
        }

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

        // Sort by last modified (most recent first)
        filesData.sort((a, b) => b.lastModified - a.lastModified);

        // Build disambiguated paths - use full paths for display
        const pathMap = this.buildDisambiguatedPaths(filesData.map((f) => f.file));

        // Build destinations
        for (const fileData of filesData) {
            const isCurrentFile = fileData.file.path === this.task.path;
            const disambiguatedPath = pathMap.get(fileData.file.path) || fileData.file.path;

            // Sort sections by line number
            const sortedSections = Array.from(fileData.sections.entries()).sort((a, b) => {
                if (a[0] === null && b[0] !== null) return 1;
                if (a[0] !== null && b[0] === null) return -1;
                const minLineA = Math.min(...a[1].map((t) => t.lineNumber));
                const minLineB = Math.min(...b[1].map((t) => t.lineNumber));
                return minLineA - minLineB;
            });

            // Add section destinations
            for (const [sectionHeader, tasks] of sortedSections) {
                const isCurrentSection = isCurrentFile && this.task.precedingHeader === sectionHeader;
                const sectionName = sectionHeader ?? '(No heading)';

                destinations.push({
                    file: fileData.file,
                    sectionHeader,
                    appendToEnd: false,
                    displayText: `${disambiguatedPath} → ${sectionName} (${tasks.length})`,
                    searchText: `${fileData.file.path} ${sectionName}`,
                    taskCount: tasks.length,
                    isCurrent: isCurrentSection,
                });
            }

            // Add "end of file" option
            destinations.push({
                file: fileData.file,
                sectionHeader: null,
                appendToEnd: true,
                displayText: `${disambiguatedPath} → End of file`,
                searchText: `${fileData.file.path} end of file`,
                taskCount: 0,
                isCurrent: false,
            });
        }

        return destinations;
    }

    /**
     * Check if a path should be excluded based on the excluded paths setting.
     */
    private isPathExcluded(filePath: string, excludedPaths: string[]): boolean {
        for (const excludedPath of excludedPaths) {
            if (!excludedPath) continue;
            // Normalize the excluded path (remove leading/trailing slashes)
            const normalizedExcluded = excludedPath.replace(/^\/+|\/+$/g, '');
            if (filePath.startsWith(normalizedExcluded + '/') || filePath === normalizedExcluded) {
                return true;
            }
        }
        return false;
    }

    /**
     * Build a map of file paths to their disambiguated display names.
     * Shows the minimum path needed to uniquely identify each file.
     */
    private buildDisambiguatedPaths(files: TFile[]): Map<string, string> {
        const pathMap = new Map<string, string>();

        // Group files by basename (without extension)
        const byBasename = new Map<string, TFile[]>();
        for (const file of files) {
            const basename = file.basename;
            if (!byBasename.has(basename)) {
                byBasename.set(basename, []);
            }
            byBasename.get(basename)!.push(file);
        }

        // For each file, determine the minimum path needed
        for (const file of files) {
            const filesWithSameName = byBasename.get(file.basename)!;

            if (filesWithSameName.length === 1) {
                // Unique basename, just use the filename
                pathMap.set(file.path, file.basename);
            } else {
                // Need to disambiguate - find minimum unique path
                const disambiguated = this.getMinimalUniquePath(file, filesWithSameName);
                pathMap.set(file.path, disambiguated);
            }
        }

        return pathMap;
    }

    /**
     * Get the minimal path that uniquely identifies this file among files with the same basename.
     * Returns format like "folder/filename" or "parent/folder/filename" as needed.
     */
    private getMinimalUniquePath(file: TFile, filesWithSameName: TFile[]): string {
        // Remove the .md extension for the path parts
        const fullPath = file.path.replace(/\.md$/, '');
        const pathParts = fullPath.split('/');

        // Get the paths of other files with the same name (without .md)
        const otherPaths = filesWithSameName
            .filter((f) => f.path !== file.path)
            .map((f) => f.path.replace(/\.md$/, ''));

        // Start with just the filename and add parent folders until unique
        for (let numParts = 1; numParts <= pathParts.length; numParts++) {
            const candidatePath = pathParts.slice(-numParts).join('/');

            // Check if this candidate is unique among files with the same name
            const isUnique = !otherPaths.some((otherPath) => {
                const otherParts = otherPath.split('/');
                const otherCandidate = otherParts.slice(-numParts).join('/');
                return otherCandidate === candidatePath;
            });

            if (isUnique) {
                return candidatePath;
            }
        }

        // Fallback to full path without extension
        return fullPath;
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
     * Render a suggestion item.
     */
    renderSuggestion(destination: MoveDestination, el: HTMLElement): void {
        el.addClass('move-task-suggestion');

        if (destination.isCurrent) {
            el.addClass('is-current');
            el.createEl('span', { text: destination.displayText + ' ← current', cls: 'suggestion-content' });
        } else {
            el.createEl('span', { text: destination.displayText, cls: 'suggestion-content' });
        }
    }

    /**
     * Handle selection of a destination.
     */
    async onChooseSuggestion(destination: MoveDestination, _evt: MouseEvent | KeyboardEvent): Promise<void> {
        if (destination.isCurrent) {
            new Notice('Task is already in this location', 2000);
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
            new Notice(`Task moved to ${destination.file.basename}`, 2000);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            new Notice(`Failed to move task: ${message}`, 5000);
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
