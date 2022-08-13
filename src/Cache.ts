import { MetadataCache, TAbstractFile, TFile, Vault } from 'obsidian';
import type { CachedMetadata, EventRef } from 'obsidian';
import type { HeadingCache, ListItemCache, SectionCache } from 'obsidian';
import { Mutex } from 'async-mutex';

import { Task } from './Task';
import type { Events } from './Events';

export enum State {
    Cold = 'Cold',
    Initializing = 'Initializing',
    Warm = 'Warm',
}

export class Cache {
    private readonly metadataCache: MetadataCache;
    private readonly metadataCacheEventReferences: EventRef[];
    private readonly vault: Vault;
    private readonly vaultEventReferences: EventRef[];
    private readonly events: Events;
    private readonly eventsEventReferences: EventRef[];

    private readonly tasksMutex: Mutex;
    private state: State;
    private tasks: Task[];

    /**
     * We cannot know if this class will be instantiated because obsidian started
     * or because the plugin was activated later. This means we have to load the
     * whole vault once after the first metadata cache resolve to ensure that we
     * load the entire vault in case obsidian is starting up. In the case of
     * obsidian starting, the task cache's initial load would end up with 0 tasks,
     * as the metadata cache would still be empty.
     */
    private loadedAfterFirstResolve: boolean;

    constructor({
        metadataCache,
        vault,
        events,
    }: {
        metadataCache: MetadataCache;
        vault: Vault;
        events: Events;
    }) {
        this.metadataCache = metadataCache;
        this.metadataCacheEventReferences = [];
        this.vault = vault;
        this.vaultEventReferences = [];
        this.events = events;
        this.eventsEventReferences = [];

        this.tasksMutex = new Mutex();
        this.state = State.Cold;
        this.tasks = [];

        this.loadedAfterFirstResolve = false;

        this.subscribeToCache();
        this.subscribeToVault();
        this.subscribeToEvents();

        this.loadVault();
    }

    public unload(): void {
        for (const eventReference of this.metadataCacheEventReferences) {
            this.metadataCache.offref(eventReference);
        }

        for (const eventReference of this.vaultEventReferences) {
            this.vault.offref(eventReference);
        }

        for (const eventReference of this.eventsEventReferences) {
            this.events.off(eventReference);
        }
    }

    public getTasks(): Task[] {
        return this.tasks;
    }

    public getState(): State {
        return this.state;
    }

    private notifySubscribers(): void {
        this.events.triggerCacheUpdate({
            tasks: this.tasks,
            state: this.state,
        });
    }

    private subscribeToCache(): void {
        const resolvedEventeReference = this.metadataCache.on(
            'resolved',
            async () => {
                // Resolved fires on every change.
                // We only want to initialize if we haven't already.
                if (!this.loadedAfterFirstResolve) {
                    this.loadedAfterFirstResolve = true;
                    this.loadVault();
                }
            },
        );
        this.metadataCacheEventReferences.push(resolvedEventeReference);

        // Does not fire when starting up obsidian and only works for changes.
        const changedEventReference = this.metadataCache.on(
            'changed',
            (file: TFile) => {
                this.tasksMutex.runExclusive(() => {
                    this.indexFile(file);
                });
            },
        );
        this.metadataCacheEventReferences.push(changedEventReference);
    }

    private subscribeToVault(): void {
        const createdEventReference = this.vault.on(
            'create',
            (file: TAbstractFile) => {
                if (!(file instanceof TFile)) {
                    return;
                }

                this.tasksMutex.runExclusive(() => {
                    this.indexFile(file);
                });
            },
        );
        this.vaultEventReferences.push(createdEventReference);

        const deletedEventReference = this.vault.on(
            'delete',
            (file: TAbstractFile) => {
                if (!(file instanceof TFile)) {
                    return;
                }

                this.tasksMutex.runExclusive(() => {
                    this.tasks = this.tasks.filter((task: Task) => {
                        return task.path !== file.path;
                    });

                    this.notifySubscribers();
                });
            },
        );
        this.vaultEventReferences.push(deletedEventReference);

        const renamedEventReference = this.vault.on(
            'rename',
            (file: TAbstractFile, oldPath: string) => {
                if (!(file instanceof TFile)) {
                    return;
                }

                this.tasksMutex.runExclusive(() => {
                    this.tasks = this.tasks.map((task: Task): Task => {
                        if (task.path === oldPath) {
                            return new Task({ ...task, path: file.path });
                        } else {
                            return task;
                        }
                    });

                    this.notifySubscribers();
                });
            },
        );
        this.vaultEventReferences.push(renamedEventReference);
    }

    private subscribeToEvents(): void {
        const requestReference = this.events.onRequestCacheUpdate((handler) => {
            handler({ tasks: this.tasks, state: this.state });
        });
        this.eventsEventReferences.push(requestReference);
    }

    private loadVault(): Promise<void> {
        return this.tasksMutex.runExclusive(async () => {
            this.state = State.Initializing;
            await Promise.all(
                this.vault.getMarkdownFiles().map((file: TFile) => {
                    return this.indexFile(file);
                }),
            );
            this.state = State.Warm;
            // Notify that the cache is now warm:
            this.notifySubscribers();
        });
    }

    private async indexFile(file: TFile): Promise<void> {
        const fileCache = this.metadataCache.getFileCache(file);
        if (fileCache === null || fileCache === undefined) {
            return;
        }

        const oldTasks = this.tasks.filter((task: Task) => {
            return task.path === file.path;
        });

        const listItems = fileCache.listItems;
        // When there is no list items cache, there are no tasks.
        // Still continue to notify watchers of removal.

        let newTasks: Task[] = [];
        if (listItems !== undefined) {
            // Only read the file and process for tasks if there are list items.
            const fileContent = await this.vault.cachedRead(file);
            newTasks = Cache.getTasksFromFileContent(
                fileContent,
                listItems,
                fileCache,
                file,
            );
        }

        // If there are no changes in any of the tasks, there's
        // nothing to do, so just return.
        if (Task.tasksListsIdentical(oldTasks, newTasks)) {
            // This code kept for now, to allow for debugging during development.
            // It is too verbose to release to users.
            // if (this.getState() == State.Warm) {
            //     console.debug(`Tasks unchanged in ${file.path}`);
            // }
            return;
        }

        if (this.getState() == State.Warm) {
            console.debug(
                `At least one task, its line number or its heading has changed in ${file.path}: triggering a refresh of all active Tasks blocks in Live Preview and Reading mode views.`,
            );
        }

        // Remove all tasks from this file from the cache before
        // adding the ones that are currently in the file.
        this.tasks = this.tasks.filter((task: Task) => {
            return task.path !== file.path;
        });

        this.tasks.push(...newTasks);

        // All updated, inform our subscribers.
        this.notifySubscribers();
    }

    private static getTasksFromFileContent(
        fileContent: string,
        listItems: ListItemCache[],
        fileCache: CachedMetadata,
        file: TFile,
    ): Task[] {
        const tasks: Task[] = [];
        const fileLines = fileContent.split('\n');

        // We want to store section information with every task so
        // that we can use that when we post process the markdown
        // rendered lists.
        let currentSection: SectionCache | null = null;
        let sectionIndex = 0;
        for (const listItem of listItems) {
            if (listItem.task !== undefined) {
                if (
                    currentSection === null ||
                    currentSection.position.end.line <
                        listItem.position.start.line
                ) {
                    // We went past the current section (or this is the first task).
                    // Find the section that is relevant for this task and the following of the same section.
                    currentSection = Cache.getSection(
                        listItem.position.start.line,
                        fileCache.sections,
                    );
                    sectionIndex = 0;
                }

                if (currentSection === null) {
                    // Cannot process a task without a section.
                    continue;
                }

                const line = fileLines[listItem.position.start.line];
                const task = Task.fromLine({
                    line,
                    path: file.path,
                    sectionStart: currentSection.position.start.line,
                    sectionIndex,
                    precedingHeader: Cache.getPrecedingHeader(
                        listItem.position.start.line,
                        fileCache.headings,
                    ),
                });

                if (task !== null) {
                    sectionIndex++;
                    tasks.push(task);
                }
            }
        }

        return tasks;
    }

    private static getSection(
        lineNumberTask: number,
        sections: SectionCache[] | undefined,
    ): SectionCache | null {
        if (sections === undefined) {
            return null;
        }

        for (const section of sections) {
            if (
                section.position.start.line <= lineNumberTask &&
                section.position.end.line >= lineNumberTask
            ) {
                return section;
            }
        }

        return null;
    }

    private static getPrecedingHeader(
        lineNumberTask: number,
        headings: HeadingCache[] | undefined,
    ): string | null {
        if (headings === undefined) {
            return null;
        }

        let precedingHeader: string | null = null;

        for (const heading of headings) {
            if (heading.position.start.line > lineNumberTask) {
                return precedingHeader;
            }
            precedingHeader = heading.heading;
        }
        return precedingHeader;
    }
}
