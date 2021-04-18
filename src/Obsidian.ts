import {
    App,
    Editor,
    EventRef,
    MarkdownPostProcessor,
    MarkdownPostProcessorContext,
    MarkdownView,
    Plugin,
    TAbstractFile,
    TFile,
    Vault,
    View,
    Workspace,
} from 'obsidian';

export class Obsidian {
    private readonly plugin: Plugin;
    private readonly eventReferences: EventRef[] = [];

    constructor({ plugin }: { plugin: Plugin }) {
        this.plugin = plugin;
    }

    public unload(): void {
        for (const eventRef of this.eventReferences) {
            this.vault.offref(eventRef);
        }
    }

    private get app(): App {
        return this.plugin.app;
    }

    private get vault(): Vault {
        return this.app.vault;
    }

    private get workspace(): Workspace {
        return this.app.workspace;
    }

    public get activeFilePath(): string | undefined {
        return (this.workspace.activeLeaf.view as any)?.file?.path;
    }

    public get activeMarkdownView(): MarkdownView | undefined {
        if (this.workspace.activeLeaf === undefined) {
            return undefined;
        }

        const activeLeaf = this.workspace.activeLeaf;
        if (!(activeLeaf.view instanceof MarkdownView)) {
            return undefined;
        }

        return activeLeaf.view;
    }

    public get editor(): Editor | undefined {
        const view: View = this.workspace.activeLeaf.view;
        if (view instanceof MarkdownView) {
            return view.editor;
        } else {
            return undefined;
        }
    }

    public getMarkdownFilePaths(): string[] {
        return this.vault.getMarkdownFiles().map((file) => file.path);
    }

    public async readLines({
        path,
    }: {
        path: string;
    }): Promise<string[] | undefined> {
        const file = this.vault.getAbstractFileByPath(path);
        if (!(file instanceof TFile)) {
            return undefined;
        }

        const fileContent = await this.vault.cachedRead(file);
        const fileLines = fileContent.split('\n');

        return fileLines;
    }

    public writeLines({
        path,
        lines,
    }: {
        path: string;
        lines: string[];
    }): Promise<void> {
        const file = this.vault.getAbstractFileByPath(path);
        if (!(file instanceof TFile)) {
            console.error('Tasks: trying to write non-file:', path);
            return Promise.resolve();
        }

        const fileContent = lines.join('\n');
        return this.vault.modify(file, fileContent);
    }

    public addCommand(command: {
        id: string;
        name: string;
        checkCallback: (checking: boolean) => void | boolean;
    }) {
        this.plugin.addCommand(command);
    }

    public subscribeToLayoutReadyEvent(func: () => void): void {
        this.workspace.onLayoutReady(func);
    }

    public subscribeToCreation(func: (path: string) => Promise<void>) {
        const eventRef = this.vault.on('create', (file: TAbstractFile) => {
            func(file.path);
        });

        this.eventReferences.push(eventRef);
    }

    public subscribeToModification(func: (path: string) => Promise<void>) {
        const eventRef = this.vault.on('modify', (file: TAbstractFile) => {
            func(file.path);
        });

        this.eventReferences.push(eventRef);
    }

    public subscribeToDeletion(func: (path: string) => Promise<void>) {
        const eventRef = this.vault.on('delete', (file: TAbstractFile) => {
            func(file.path);
        });

        this.eventReferences.push(eventRef);
    }

    public subscribeToRenaming(
        func: (oldPath: string, newPath: string) => Promise<void>,
    ) {
        const eventRef = this.vault.on(
            'rename',
            (file: TAbstractFile, oldPath: string) => {
                func(oldPath, file.path);
            },
        );

        this.eventReferences.push(eventRef);
    }

    public registerMarkdownPostProcessor(handler: MarkdownPostProcessor): void {
        this.plugin.registerMarkdownPostProcessor(handler);
    }

    public registerCodeBlockPostProcessor(
        handler: (
            source: string,
            el: HTMLElement,
            ctx: MarkdownPostProcessorContext,
        ) => Promise<any> | void,
    ): void {
        this.plugin.registerMarkdownCodeBlockProcessor('tasks', handler);
    }
}
