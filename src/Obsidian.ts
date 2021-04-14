import {
    App,
    EventRef,
    MarkdownPostProcessor,
    MarkdownPostProcessorContext,
    MarkdownView,
    Plugin,
    TAbstractFile,
    TFile,
    Vault,
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

    public get editor(): CodeMirror.Editor {
        return (this.workspace.activeLeaf.view as any).sourceMode
            .cmEditor as CodeMirror.Editor;
    }

    public getMarkdownFilePaths(): string[] {
        return this.vault.getMarkdownFiles().map((file) => file.path);
    }

    public async readLines({ path }: { path: string }): Promise<string[]> {
        const file = this.vault.getAbstractFileByPath(path);
        const fileContent = await this.vault.read(file as TFile);
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
        const fileContent = lines.join('\n');
        return this.vault.modify(file as TFile, fileContent);
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
