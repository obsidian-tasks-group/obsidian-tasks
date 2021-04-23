import {
    EventRef,
    MetadataCache,
    SectionCache,
    TAbstractFile,
    TFile,
    Vault,
} from 'obsidian';
import { Mutex } from 'async-mutex';

import { mergeLineRangeIntoTaskLine } from './File';
import { Task } from './Task';

export enum State {
    Cold = 'Cold',
    Initializing = 'Initializing',
    Warm = 'Warm',
}

export class Cache {
    private readonly metadataCache: MetadataCache;
    private readonly vault: Vault;
    private readonly eventReferences: EventRef[];

    private readonly tasksMutex: Mutex;
    private state: State;
    private tasks: Task[];

    private readonly subscribedHandlers: { [number: number]: () => void };
    private registeredNextId: number;

    constructor({
        metadataCache,
        vault,
    }: {
        metadataCache: MetadataCache;
        vault: Vault;
    }) {
        this.metadataCache = metadataCache;
        this.vault = vault;
        this.eventReferences = [];

        this.tasksMutex = new Mutex();
        this.state = State.Cold;
        this.tasks = [];

        this.subscribedHandlers = {};
        this.registeredNextId = 0;

        this.subscribeToCache();
    }

    public unload(): void {
        for (const eventReference of this.eventReferences) {
            this.metadataCache.offref(eventReference);
        }
    }

    public getTasks(): Task[] {
        return this.tasks;
    }

    public getState(): State {
        return this.state;
    }

    public subscribe(handler: () => void | Promise<void>): number {
        const id = this.registeredNextId;
        this.registeredNextId++;

        this.subscribedHandlers[id] = handler;

        return id;
    }

    public unsubscribe({ id }: { id: number }): boolean {
        if (this.subscribedHandlers[id]) {
            delete this.subscribedHandlers[id];
            return true;
        }

        return false;
    }

    private notifySubscribers(): void {
        for (const subscribedHandler of Object.values(
            this.subscribedHandlers,
        )) {
            subscribedHandler();
        }
    }

    private subscribeToCache() {
        // Resolved fires on every change. We only want to initialize if we haven't started already.
        const resolvedEventeReference = this.metadataCache.on(
            'resolved',
            async () => {
                if (this.state === State.Cold) {
                    this.tasksMutex.runExclusive(async () => {
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
            },
        );
        this.eventReferences.push(resolvedEventeReference);

        // Does not fire when starting up obsidian and only works for changes.
        const changedEventReference = this.metadataCache.on(
            'changed',
            (file: TFile) => {
                this.tasksMutex.runExclusive(() => {
                    this.indexFile(file);
                });
            },
        );
        this.eventReferences.push(changedEventReference);

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
        this.eventReferences.push(createdEventReference);

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
                });
            },
        );
        this.eventReferences.push(deletedEventReference);

        const renamedEventReference = this.vault.on(
            'rename',
            (file: TAbstractFile, oldPath: string) => {
                if (!(file instanceof TFile)) {
                    return;
                }

                this.tasks = this.tasks.map(
                    (task: Task): Task => {
                        if (task.path === oldPath) {
                            return new Task({ ...task, path: file.path });
                        } else {
                            return task;
                        }
                    },
                );
            },
        );
        this.eventReferences.push(renamedEventReference);
    }

    private async indexFile(file: TFile): Promise<void> {
        const fileCache = this.metadataCache.getFileCache(file);
        if (fileCache === null || fileCache === undefined) {
            return;
        }

        const listItems = fileCache?.listItems;
        if (listItems === undefined) {
            return;
        }

        const fileContent = await this.vault.cachedRead(file);
        const fileLines = fileContent.split('\n');

        // Remove all tasks from this file from the cache before
        // adding the ones that are currently in the file.
        this.tasks = this.tasks.filter((task: Task) => {
            return task.path !== file.path;
        });

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
                    currentSection = this.getSection({
                        lineNumberTask: listItem.position.start.line,
                        sections: fileCache.sections,
                    });
                    sectionIndex = 0;
                }

                if (currentSection === null) {
                    // Cannot process a task without a section.
                    continue;
                }

                const line = mergeLineRangeIntoTaskLine({
                    fileLines,
                    position: listItem.position,
                });
                const task = Task.fromLine({
                    line,
                    path: file.path,
                    sectionStart: currentSection.position.start.line,
                    sectionIndex,
                    precedingHeader: this.getPrecedingHeader({
                        lineNumberTask: listItem.position.start.line,
                        sections: fileCache.sections,
                        fileLines,
                    }),
                });

                if (task !== null) {
                    sectionIndex++;
                    this.tasks.push(task);
                }
            }
        }

        // All updated, inform our subscribers.
        this.notifySubscribers();
    }

    private getSection({
        lineNumberTask,
        sections,
    }: {
        lineNumberTask: number;
        sections: SectionCache[] | undefined;
    }): SectionCache | null {
        if (sections === undefined) {
            return null;
        }

        for (const section of sections) {
            if (
                section.type === 'list' &&
                section.position.start.line <= lineNumberTask &&
                section.position.end.line >= lineNumberTask
            ) {
                return section;
            }
        }

        return null;
    }

    private getPrecedingHeader({
        lineNumberTask,
        sections,
        fileLines,
    }: {
        lineNumberTask: number;
        sections: SectionCache[] | undefined;
        fileLines: string[];
    }): string | null {
        if (sections === undefined) {
            return null;
        }

        let precedingHeaderSection: SectionCache | undefined;
        for (const section of sections) {
            if (section.type === 'heading') {
                if (section.position.start.line > lineNumberTask) {
                    // Break out of the loop as the last header was the preceding one.
                    break;
                }
                precedingHeaderSection = section;
            }
        }
        if (precedingHeaderSection === undefined) {
            return null;
        }

        const lineNumberPrecedingHeader =
            precedingHeaderSection.position.start.line;

        const linePrecedingHeader = fileLines[lineNumberPrecedingHeader];

        const headerRegex = /^#+ +(.*)/u;
        const headerMatch = linePrecedingHeader.match(headerRegex);
        if (headerMatch === null) {
            return null;
        } else {
            return headerMatch[1];
        }
    }
}
