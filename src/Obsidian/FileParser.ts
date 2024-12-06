import type { CachedMetadata, ListItemCache, SectionCache } from 'obsidian';
import type { Logger } from '../lib/logging';
import { Task } from '../Task/Task';
import { TasksFile } from '../Scripting/TasksFile';
import { Lazy } from '../lib/Lazy';
import { DateFallback } from '../DateTime/DateFallback';
import { ListItem } from '../Task/ListItem';
import { TaskLocation } from '../Task/TaskLocation';
import { Cache } from './Cache';

export class FileParser {
    private readonly filePath: string;
    private readonly fileContent: string;
    private readonly listItems: ListItemCache[];
    private readonly logger: Logger;
    private readonly fileCache: CachedMetadata;
    private readonly errorReporter: (e: any, filePath: string, listItem: ListItemCache, line: string) => void;

    constructor(
        filePath: string,
        fileContent: string,
        listItems: ListItemCache[],
        logger: Logger,
        fileCache: CachedMetadata,
        errorReporter: (e: any, filePath: string, listItem: ListItemCache, line: string) => void,
    ) {
        this.filePath = filePath;
        this.fileContent = fileContent;
        this.listItems = listItems;
        this.logger = logger;
        this.fileCache = fileCache;
        this.errorReporter = errorReporter;
    }

    public parseFileContent() {
        const thisDotfilePath = this.filePath;
        const thisDotfileContent = this.fileContent;
        const thisDotlistItems = this.listItems;
        const thisDotlogger = this.logger;
        const thisDotfileCache = this.fileCache;
        const thisDoterrorReporter = this.errorReporter;
        return parseFileContent(
            thisDotfilePath,
            thisDotfileContent,
            thisDotlistItems,
            thisDotlogger,
            thisDotfileCache,
            thisDoterrorReporter,
        );
    }
}

export function parseFileContent(
    thisDotfilePath: string,
    thisDotfileContent: string,
    thisDotlistItems: ListItemCache[] | undefined,
    thisDotlogger: Logger,
    thisDotfileCache: CachedMetadata,
    thisDoterrorReporter: (e: any, filePath: string, listItem: ListItemCache, line: string) => void,
) {
    const tasks: Task[] = [];
    if (thisDotlistItems === undefined) {
        // When called via Cache, this function would never be called or files without list items.
        // It is useful for tests to be act gracefully on sample Markdown files with no list items, however.
        return tasks;
    }

    const tasksFile = new TasksFile(thisDotfilePath, thisDotfileCache);
    const fileLines = thisDotfileContent.split('\n');
    const linesInFile = fileLines.length;

    // Lazily store date extracted from filename to avoid parsing more than needed
    // this.logger.debug(`getTasksFromFileContent() reading ${file.path}`);
    const dateFromFileName = new Lazy(() => DateFallback.fromPath(thisDotfilePath));

    // We want to store section information with every task so
    // that we can use that when we post process the markdown
    // rendered lists.
    let currentSection: SectionCache | null = null;
    let sectionIndex = 0;
    const line2ListItem: Map<number, ListItem> = new Map();
    for (const listItem of thisDotlistItems) {
        const lineNumber = listItem.position.start.line;
        if (lineNumber >= linesInFile) {
            /*
                Obsidian CachedMetadata has told us that there is a task on lineNumber, but there are
                not that many lines in the file.

                This was the underlying cause of all the 'Stuck on "Loading Tasks..."' messages,
                as it resulted in the line 'undefined' being parsed.

                Somehow the file had been shortened whilst Obsidian was closed, meaning that
                when Obsidian started up, it got the new file content, but still had the old cached
                data about locations of list items in the file.
             */
            thisDotlogger.debug(
                `${thisDotfilePath} Obsidian gave us a line number ${lineNumber} past the end of the file. ${linesInFile}.`,
            );
            return tasks;
        }
        if (currentSection === null || currentSection.position.end.line < lineNumber) {
            // We went past the current section (or this is the first task).
            // Find the section that is relevant for this task and the following of the same section.
            currentSection = Cache.getSection(lineNumber, thisDotfileCache.sections);
            sectionIndex = 0;
        }

        if (currentSection === null) {
            // Cannot process a task without a section.
            continue;
        }

        const line = fileLines[lineNumber];
        if (line === undefined) {
            thisDotlogger.debug(`${thisDotfilePath}: line ${lineNumber} - ignoring 'undefined' line.`);
            continue;
        }

        const taskLocation = new TaskLocation(
            tasksFile,
            lineNumber,
            currentSection.position.start.line,
            sectionIndex,
            Cache.getPrecedingHeader(lineNumber, thisDotfileCache.headings),
        );
        if (listItem.task !== undefined) {
            let task;
            try {
                task = Task.fromLine({
                    line,
                    taskLocation: taskLocation,
                    fallbackDate: dateFromFileName.value,
                });

                if (task !== null) {
                    // listItem.parent could be negative if the parent is not found (in other words, it is a root task).
                    // That is not a problem, as we never put a negative number in line2ListItem map, so parent will be null.
                    const parentListItem: ListItem | null = line2ListItem.get(listItem.parent) ?? null;
                    if (parentListItem !== null) {
                        task = new Task({
                            ...task,
                            parent: parentListItem,
                        });
                    }

                    line2ListItem.set(lineNumber, task);
                }
            } catch (e) {
                thisDoterrorReporter(e, thisDotfilePath, listItem, line);
                continue;
            }

            if (task !== null) {
                sectionIndex++;
                tasks.push(task);
            }
        } else {
            const lineNumber = listItem.position.start.line;

            const parentListItem: ListItem | null = line2ListItem.get(listItem.parent) ?? null;

            line2ListItem.set(lineNumber, new ListItem(fileLines[lineNumber], parentListItem));
        }
    }

    return tasks;
}
