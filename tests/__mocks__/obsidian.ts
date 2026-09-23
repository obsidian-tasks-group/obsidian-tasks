import type { App, CachedMetadata, Debouncer, Reference, TFile, Vault } from 'obsidian';
import type { SimulatedFile } from '../Obsidian/SimulatedFile';
import { MockDataLoader } from '../TestingTools/MockDataLoader';

export {};

/**
 * Since we don't use the app object's method or properties directly,
 * and just treat it as an "opaque object" for markdown rendering, there is
 * not a lot to mock in particular.
 */
export const mockApp = {} as unknown as App;

/**
 * Creates a minimal Obsidian TFile for tests that only need file metadata.
 *
 * @param path - Vault-relative path to the file.
 */
export function createTFile(path: string): TFile {
    const name = path.split('/').pop() ?? path;
    const extension = name.includes('.') ? (name.split('.').pop() ?? '') : '';
    const basename = extension === '' ? name : name.slice(0, -(extension.length + 1));

    return {
        vault: {} as Vault,
        path,
        name,
        parent: null,
        stat: { ctime: 0, mtime: 0, size: 0 },
        basename,
        extension,
    };
}

export class MenuItem {
    public title: string | DocumentFragment = '';
    public callback: (evt: MouseEvent | KeyboardEvent) => any;
    public checked = false;

    constructor() {
        this.callback = (_evt: MouseEvent | KeyboardEvent) => console.log('callback not defined');
    }

    public setTitle(title: string | DocumentFragment): this {
        this.title = title;
        return this;
    }

    public onClick(callback: (evt: MouseEvent | KeyboardEvent) => any): this {
        this.callback = callback;
        return this;
    }
    public setChecked(checked: boolean | null): this {
        this.checked = checked ? checked : false;
        return this;
    }
}

export class Menu {
    public items: MenuItem[] = [];

    /**
     * Adds a menu item. Only works when menu is not shown yet.
     * @public
     */
    addItem(cb: (item: MenuItem) => any): this {
        const item = new MenuItem();
        cb(item);
        this.items.push(item);
        return this;
    }

    /**
     * Adds a separator. Only works when menu is not shown yet.
     */
    addSeparator(): this {
        const getMenuItemCallback = (item: MenuItem) => {
            item.setTitle('---');
        };
        return this.addItem(getMenuItemCallback);
    }
}

export class Notice {
    /**
     * @public
     */
    constructor(_message: string | DocumentFragment, _timeout?: number) {}

    /**
     * Change the message of this notice.
     * @public
     */
    setMessage(_message: string | DocumentFragment): this {
        return this;
    }

    /**
     * @public
     */
    hide(): void {}
}

export class PluginSettingTab {
    public containerEl: HTMLElement;
    public app: App;
    public plugin: unknown;

    constructor(app: App, plugin: unknown) {
        this.app = app;
        this.plugin = plugin;
        this.containerEl = document.createElement('div');
    }

    public update(): void {}
    public refreshDomState(): void {}
}

export function sanitizeHTMLToDom(html: string): DocumentFragment {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content.cloneNode(true) as DocumentFragment;
}

export function requireApiVersion(_version: string): boolean {
    return true;
}

interface SearchResult {
    score: number;
    matches: number[][];
}

/**
 * An implementation detail of our fake {@link prepareSimpleSearch} - see below.
 *
 * See https://docs.obsidian.md/Reference/TypeScript+API/prepareSimpleSearch
 * @param searchTerm
 * @param phrase
 */
function caseInsensitiveSubstringSearch(searchTerm: string, phrase: string): SearchResult | null {
    // Don't try and search for empty strings or just spaces:
    if (!searchTerm.trim()) {
        return null;
    }

    // Support multi-word search terms:
    const searchTerms = searchTerm.split(/\s+/);
    let matches: number[][] = [];

    for (const term of searchTerms) {
        const regex = new RegExp(term, 'gi');
        let match;
        let termFound = false;
        while ((match = regex.exec(phrase)) !== null) {
            matches.push([match.index, match.index + match[0].length]);
            termFound = true;
        }

        // We require all search terms to be found.
        if (!termFound) {
            return null;
        }
    }

    // Sort matches by start index and then by end index
    matches = matches.sort((a, b) => {
        if (a[0] === b[0]) {
            return a[1] - b[1];
        }
        return a[0] - b[0];
    });

    return matches.length > 0
        ? {
              score: 0, // this fake implementation does not support calculating scores.
              matches: matches,
          }
        : null;
}

/**
 * Fake implementation of Obsidian's `getAllTags()`.
 *
 * See https://docs.obsidian.md/Reference/TypeScript+API/getAllTags
 *
 * @param cachedMetadata - the CachedMetadata instance from a SimulatedFile that has
 *                         already been loaded via MockDataLoader.get().
 * @throws Error if no matching CachedMetadata is found in the MockDataLoader cache.
 */
export function getAllTags(cachedMetadata: CachedMetadata): string[] {
    const simulatedFile = MockDataLoader.findCachedMetaData(cachedMetadata);
    return simulatedFile.getAllTags;
}

/**
 * Fake implementation of Obsidian's `parseFrontMatterTags()`.
 *
 * See https://docs.obsidian.md/Reference/TypeScript+API/parseFrontMatterTags
 *
 * @example
 * This works:
 * ```typescript
 *     const tags = parseFrontMatterTags(tasksFile.cachedMetadata.frontmatter);
 * ```
 *
 * @example
 * This does not work:
 * ```typescript
 *     const tags = parseFrontMatterTags(tasksFile.frontmatter);
 * ```
 *
 * @param frontmatter - the raw CachedMetadata.frontmatter instance from a SimulatedFile that has
 *                      already been loaded via MockDataLoader.get().
 * @throws Error if no matching frontmatter is found in the MockDataLoader cache,
 *               or a `tasksFile.frontmatter` was supplied.
 */
export function parseFrontMatterTags(frontmatter: any | null): string[] | null {
    const simulatedFile = MockDataLoader.findFrontmatter(frontmatter);
    return simulatedFile.parseFrontMatterTags;
}

/**
 * Fake implementation of calling Obsidian's `getLinkpath()` and `app.metadataCache.getFirstLinkpathDest()`
 * This reads saved the {@link SimulatedFile} JSON files.
 *
 * See https://docs.obsidian.md/Reference/TypeScript+API/getLinkpath
 * See https://docs.obsidian.md/Reference/TypeScript+API/MetadataCache/getFirstLinkpathDest
 *
 * @param rawLink
 * @param sourcePath - the path to a Markdown file in the test vault whose SimulatedFile has already
 *                     been loaded via MockDataLoader.get(). For example, 'Test Data/callout.md'
 *
 * @example
 * ```typescript
 *     beforeAll(() => {
 *         LinkResolver.getInstance().setGetFirstLinkpathDestFn((rawLink: Reference, sourcePath: string) => {
 *             return getFirstLinkpathDest(rawLink, sourcePath);
 *         });
 *     });
 * ```
 */
export function getFirstLinkpathDest(rawLink: Reference, sourcePath: string): string | null {
    const simulatedFile = MockDataLoader.findDataFromMarkdownPath(sourcePath);
    return getFirstLinkpathDestFromData(simulatedFile, rawLink);
}

export function getFirstLinkpathDestFromData(data: SimulatedFile, rawLink: Reference) {
    if (!(rawLink.link in data.resolveLinkToPath)) {
        console.log(`Cannot find resolved path for ${rawLink.link} in ${data.filePath} in mock getFirstLinkpathDest()`);
    }
    return data.resolveLinkToPath[rawLink.link];
}

/**
 * A fake implementation of prepareSimpleSearch(),
 * so we can write tests of code that calls that function.
 * Note that the returned score is always 0.
 *
 * See https://docs.obsidian.md/Reference/TypeScript+API/prepareSimpleSearch
 * @param query - the search term
 */
export function prepareSimpleSearch(query: string): (text: string) => SearchResult | null {
    return function (text: string): SearchResult | null {
        return caseInsensitiveSubstringSearch(query, text);
    };
}

/**
 * Fake implementation of Obsidian's prepareFuzzySearch(),
 * so we can write tests of code that calls that function.
 *
 * TODO Augment this to return an actual SearchResult, with the matching character positions.
 *
 * See https://docs.obsidian.md/Reference/TypeScript+API/prepareFuzzySearch
 * @param query - the search term
 */
export function prepareFuzzySearch(query: string) {
    return function (text: string) {
        const normalizedQuery = query.toLowerCase();
        const normalizedText = text.toLowerCase();
        const matches = [...normalizedQuery].every((character) => normalizedText.includes(character));
        return matches ? { score: normalizedQuery.length / normalizedText.length } : null;
    };
}

type IconName = string;

export function setIcon(element: HTMLElement, iconId: IconName): void {
    element.setAttribute('test-icon', iconId);
}

export function setTooltip(element: HTMLElement, text: string): void {
    element.setAttribute('test-tooltip', text);
}

export function debounce<T extends unknown[], V>(
    cb: (...args: [...T]) => V,
    _timeout?: number,
    _resetTimer?: boolean,
): Debouncer<T, V> {
    const debouncer = ((..._args: T) => debouncer) as Debouncer<T, V>;
    debouncer.cancel = () => debouncer;
    debouncer.run = () => {
        return cb(...([] as any));
    };
    return debouncer;
}

export function getLanguage() {
    return 'en';
}

// Records the last modal opened by a test so approval tests can inspect
// modal title/body text triggered by declarative settings callbacks.
export const lastModalState: {
    title: string | null;
    html: string | null;
    opened: boolean;
} = {
    title: null,
    html: null,
    opened: false,
};

export function resetLastModalState(): void {
    lastModalState.title = null;
    lastModalState.html = null;
    lastModalState.opened = false;
}

// Minimal Modal mock for tests that inspect modal text produced by UI callbacks.
export class Modal {
    public contentEl: HTMLDivElement;
    public modalEl: HTMLDivElement;
    public titleEl: HTMLDivElement;

    constructor(_app?: App) {
        this.contentEl = document.createElement('div');
        this.modalEl = document.createElement('div');
        this.titleEl = document.createElement('div');
    }

    public setTitle(title: string): this {
        this.titleEl.textContent = title;
        lastModalState.title = title;
        return this;
    }

    public open(): void {
        lastModalState.opened = true;
        lastModalState.html = this.contentEl.innerHTML;
    }

    public close(): void {
        // Mocked interface, no-op
    }

    public onOpen(): void {}
    public onClose(): void {}
}

export class Component {
    public load(): void {}
    public unload(): void {}
}

export class MarkdownRenderer {
    public static render(_app: App, markdown: string, el: HTMLElement): Promise<void> {
        el.textContent = markdown;
        return Promise.resolve();
    }
}

export abstract class SuggestModal<T> extends Modal {
    constructor(public readonly app: App) {
        super();
    }

    public setPlaceholder(_placeholder: string): void {}

    public abstract getSuggestions(query: string): T[] | Promise<T[]>;
    public abstract renderSuggestion(value: T, el: HTMLElement): void;
    public abstract onChooseSuggestion(item: T, evt: MouseEvent | KeyboardEvent): void;
}

// Minimal ButtonComponent mock: only the methods currently needed by modal-building code.
export class ButtonComponent {
    public buttonEl: HTMLButtonElement;

    constructor(containerEl: HTMLElement) {
        this.buttonEl = document.createElement('button');
        containerEl.appendChild(this.buttonEl);
    }

    public setButtonText(text: string): this {
        this.buttonEl.textContent = text;
        return this;
    }

    public setClass(className: string): this {
        this.buttonEl.classList.add(className);
        return this;
    }

    public onClick(_callback: () => void): this {
        return this;
    }
}

export const recordedLegacySettings: Array<Record<string, unknown>> = [];

export function resetRecordedLegacySettings(): void {
    recordedLegacySettings.length = 0;
}

export class Setting {
    public settingEl = document.createElement('div');
    public infoEl = document.createElement('div');
    public controlEl = document.createElement('div');

    private readonly record: Record<string, unknown>;

    constructor(containerEl: HTMLElement) {
        this.settingEl.appendChild(this.infoEl);
        this.settingEl.appendChild(this.controlEl);
        containerEl.appendChild(this.settingEl);

        this.record = { controls: [] };
        recordedLegacySettings.push(this.record);
    }

    public setName(name: string): this {
        this.record.name = name;
        return this;
    }

    public setDesc(desc: string | DocumentFragment): this {
        if (desc instanceof DocumentFragment) {
            const div = document.createElement('div');
            div.appendChild(desc.cloneNode(true));
            this.record.desc = div.innerHTML;
        } else {
            this.record.desc = desc;
        }
        return this;
    }

    public setHeading(): this {
        this.record.heading = true;
        return this;
    }

    public addText(_callback: (text: unknown) => void): this {
        (this.record.controls as string[]).push('text');
        return this;
    }

    public addTextArea(_callback: (text: unknown) => void): this {
        (this.record.controls as string[]).push('textArea');
        return this;
    }

    public addToggle(_callback: (toggle: unknown) => void): this {
        (this.record.controls as string[]).push('toggle');
        return this;
    }

    public addDropdown(_callback: (dropdown: unknown) => void): this {
        (this.record.controls as string[]).push('dropdown');
        return this;
    }

    public setVisibility(_visible: boolean): this {
        return this;
    }

    public addButton(callback: (button: unknown) => void): this {
        const control: Record<string, unknown> = { type: 'button' };

        if (!this.record.controls) {
            this.record.controls = [];
        }
        (this.record.controls as Array<Record<string, unknown>>).push(control);

        const fakeButton = {
            setButtonText: (text: string) => {
                control.text = text;
                return fakeButton;
            },
            onClick: (_callback: () => void) => {
                control.onClick = '[Function]';
                return fakeButton;
            },
            setCta: () => {
                control.cta = true;
                return fakeButton;
            },
            setWarning: () => {
                control.warning = true;
                return fakeButton;
            },
            setTooltip: (tooltip: string) => {
                control.tooltip = tooltip;
                return fakeButton;
            },
        };

        callback(fakeButton);
        return this;
    }

    public addExtraButton(callback: (extra: unknown) => void): this {
        const control: Record<string, unknown> = { type: 'extraButton' };

        (this.record.controls as Array<Record<string, unknown>>).push(control);

        const fakeExtraButton = {
            extraSettingsEl: document.createElement('div'),
            setIcon: (icon: string) => {
                control.icon = icon;
                return fakeExtraButton;
            },
            setTooltip: (tooltip: string) => {
                control.tooltip = tooltip;
                return fakeExtraButton;
            },
            onClick: (_callback: () => void) => {
                control.onClick = '[Function]';
                return fakeExtraButton;
            },
        };

        callback(fakeExtraButton);
        return this;
    }

    public addSlider(_callback: (slider: unknown) => void): this {
        (this.record.controls as string[]).push('slider');
        return this;
    }
}
