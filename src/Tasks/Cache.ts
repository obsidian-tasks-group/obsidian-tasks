import { Mutex } from 'async-mutex';
import { Obsidian } from '../Obsidian';
import { REGEX_TASK, Task } from './Task';

export class Cache {
    private readonly obsidian: Obsidian;
    private readonly mutex: Mutex;

    private readonly subscribedHandlers: { [number: number]: () => void };
    private registeredMaxId: number = 0;

    private tasks: Task[];

    constructor({ obsidian }: { obsidian: Obsidian }) {
        this.obsidian = obsidian;
        this.mutex = new Mutex();
        this.subscribedHandlers = [];

        this.tasks = [];
        this.obsidian.subscribeToLayoutReadyEvent(() => {
            this.init();
        });
        this.obsidian.subscribeToModification(async (path: string) => {
            await this.mutex.runExclusive(async () => {
                this.tasks = this.tasks.filter(
                    (task: Task) => task.path !== path,
                );
                await this.updateFiles({ paths: [path] });
            });
        });
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

    private async init(): Promise<void> {
        await this.mutex.runExclusive(async () => {
            const paths = this.obsidian.getMarkdownFilePaths();
            this.tasks = [];
            this.updateFiles({ paths });
        });
    }

    private async updateFiles({ paths }: { paths: string[] }) {
        const headerRegex = /^#+ (.*)/;
        let precedingHeader: string | undefined = undefined;

        for (const path of paths) {
            const lines = await this.obsidian.readLines({ path });
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

        for (const subscribedHandler of Object.values(
            this.subscribedHandlers,
        )) {
            subscribedHandler();
        }
    }
}
