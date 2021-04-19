import { Mutex } from 'async-mutex';
import { Obsidian } from '../Obsidian';
import { REGEX_TASK, Task } from './Task';

export class Cache {
    private readonly obsidian: Obsidian;
    private readonly mutex: Mutex;

    private readonly subscribedHandlers: { [number: number]: () => void };
    private registeredMaxId: number = 0;

    private tasks: Task[];
    /** The cache is warm when the initialization phase is done. */
    private warm: boolean;

    constructor({ obsidian }: { obsidian: Obsidian }) {
        this.obsidian = obsidian;
        this.mutex = new Mutex();
        this.subscribedHandlers = [];

        this.tasks = [];
        this.warm = false;

        this.obsidian.subscribeToLayoutReadyEvent(() => {
            this.init();
        });

        this.subscribeToFileEvents();
    }

    /** Returns false if the cache is still initializing. */
    public get isWarm(): boolean {
        return this.warm;
    }

    public getTasks(): Task[] {
        return this.tasks;
    }

    public register({ handler }: { handler: () => void }): number {
        const id = this.registeredMaxId;
        this.registeredMaxId = this.registeredMaxId + 1;

        this.subscribedHandlers[id] = handler;

        return id;
    }

    public unregister({ id }: { id: number }): boolean {
        if (this.subscribedHandlers[id]) {
            delete this.subscribedHandlers[id];
            return true;
        }

        return false;
    }

    private subscribeToFileEvents(): void {
        this.obsidian.subscribeToCreation(async (path: string) => {
            await this.mutex.runExclusive(async () => {
                await this.updateFiles({ paths: [path] });
            });
        });

        this.obsidian.subscribeToModification(async (path: string) => {
            await this.mutex.runExclusive(async () => {
                this.tasks = this.tasks.filter(
                    (task: Task) => task.path !== path,
                );
                await this.updateFiles({ paths: [path] });
            });
        });

        this.obsidian.subscribeToDeletion(async (path: string) => {
            await this.mutex.runExclusive(async () => {
                this.tasks = this.tasks.filter(
                    (task: Task) => task.path !== path,
                );
                this.notifySubscribers();
            });
        });

        this.obsidian.subscribeToRenaming(
            async (oldPath: string, newPath: string) => {
                await this.mutex.runExclusive(async () => {
                    this.tasks = this.tasks.map(
                        (task: Task): Task => {
                            if (task.path === oldPath) {
                                return new Task({ ...task, path: newPath });
                            } else {
                                return task;
                            }
                        },
                    );

                    this.notifySubscribers();
                });
            },
        );
    }

    private async init(): Promise<void> {
        await this.mutex.runExclusive(async () => {
            this.warm = false;
            this.tasks = [];

            const paths = this.obsidian.getMarkdownFilePaths();
            await this.updateFiles({ paths });

            this.warm = true;
            // Need to notify again that the cache is now warm:
            this.notifySubscribers();
        });
    }

    private async updateFiles({ paths }: { paths: string[] }): Promise<void> {
        const headerRegex = /^#+ (.*)/;

        for (const path of paths) {
            let precedingHeader: string | undefined = undefined;
            const lines = await this.obsidian.readLines({ path });
            // If there are no lines, we don't need to parse.
            // Could be a directory, for example.
            if (lines === undefined) {
                continue;
            }

            let pageIndex = 0;
            for (
                let lineNumber = 0;
                lineNumber < lines.length;
                lineNumber = lineNumber + 1
            ) {
                const line = lines[lineNumber];
                const headerMatch = line.match(headerRegex);
                if (headerMatch !== null) {
                    precedingHeader = headerMatch[1];

                    // A header cannot be a task:
                    continue;
                }

                if (REGEX_TASK.test(line)) {
                    const task = Task.fromLine({
                        line,
                        path,
                        pageIndex,
                        lineNumber,
                        precedingHeader,
                    });
                    if (task !== undefined) {
                        this.tasks.push(task);
                        pageIndex = pageIndex + 1;
                    }
                }
            }
        }

        this.notifySubscribers();
    }

    private notifySubscribers(): void {
        for (const subscribedHandler of Object.values(
            this.subscribedHandlers,
        )) {
            subscribedHandler();
        }
    }
}
