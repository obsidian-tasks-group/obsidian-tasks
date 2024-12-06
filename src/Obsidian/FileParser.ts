import type { CachedMetadata, ListItemCache, SectionCache } from 'obsidian';
import type { Logger } from '../lib/logging';
import { Task } from '../Task/Task';
import { TasksFile } from '../Scripting/TasksFile';
import { Lazy } from '../lib/Lazy';
import { DateFallback } from '../DateTime/DateFallback';
import { ListItem } from '../Task/ListItem';
import { TaskLocation } from '../Task/TaskLocation';
import { Cache } from './Cache';

export function getTasksFromFileContent2(
    filePath: string,
    fileContent: string,
    listItems: ListItemCache[] | undefined,
    logger: Logger,
    fileCache: CachedMetadata,
    errorReporter: (e: any, filePath: string, listItem: ListItemCache, line: string) => void,
) {
    const tasks: Task[] = [];
    if (listItems === undefined) {
        // When called via Cache, this function would never be called or files without list items.
        // It is useful for tests to be act gracefully on sample Markdown files with no list items, however.
        return tasks;
    }

    const tasksFile = new TasksFile(filePath, fileCache);
    const fileLines = fileContent.split('\n');
    const linesInFile = fileLines.length;

    // Lazily store date extracted from filename to avoid parsing more than needed
    // this.logger.debug(`getTasksFromFileContent() reading ${file.path}`);
    const dateFromFileName = new Lazy(() => DateFallback.fromPath(filePath));

    // We want to store section information with every task so
    // that we can use that when we post process the markdown
    // rendered lists.
    let currentSection: SectionCache | null = null;
    let sectionIndex = 0;
    const line2ListItem: Map<number, ListItem> = new Map();
    for (const listItem of listItems) {
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
            logger.debug(
                `${filePath} Obsidian gave us a line number ${lineNumber} past the end of the file. ${linesInFile}.`,
            );
            return tasks;
        }
        if (currentSection === null || currentSection.position.end.line < lineNumber) {
            // We went past the current section (or this is the first task).
            // Find the section that is relevant for this task and the following of the same section.
            currentSection = Cache.getSection(lineNumber, fileCache.sections);
            sectionIndex = 0;
        }

        if (currentSection === null) {
            // Cannot process a task without a section.
            continue;
        }

        const line = fileLines[lineNumber];
        if (line === undefined) {
            logger.debug(`${filePath}: line ${lineNumber} - ignoring 'undefined' line.`);
            continue;
        }

        if (listItem.task !== undefined) {
            let task;
            try {
                task = Task.fromLine({
                    line,
                    taskLocation: new TaskLocation(
                        tasksFile,
                        lineNumber,
                        currentSection.position.start.line,
                        sectionIndex,
                        Cache.getPrecedingHeader(lineNumber, fileCache.headings),
                    ),
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
                errorReporter(e, filePath, listItem, line);
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
