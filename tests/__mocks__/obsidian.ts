import { jest } from '@jest/globals';
import type { CachedMetadata, Debouncer, App as ObsidianApp, Reference } from 'obsidian';
import type { SimulatedFile } from '../Obsidian/SimulatedFile';
import { MockDataLoader } from '../TestingTools/MockDataLoader';

export {};

type ObsidianElement = HTMLElement & {
    addClass: (className: string) => ObsidianElement;
    addClasses: (classNames: string[]) => ObsidianElement;
    empty: () => ObsidianElement;
    setText: (text: string | DocumentFragment) => ObsidianElement;
};

const elementPrototype = HTMLElement.prototype as ObsidianElement;

if (typeof elementPrototype.addClass !== 'function') {
    elementPrototype.addClass = function (className: string): ObsidianElement {
        this.classList.add(className);
        return this;
    };
}

if (typeof elementPrototype.addClasses !== 'function') {
    elementPrototype.addClasses = function (classNames: string[]): ObsidianElement {
        this.classList.add(...classNames);
        return this;
    };
}

if (typeof elementPrototype.empty !== 'function') {
    elementPrototype.empty = function (): ObsidianElement {
        this.replaceChildren();
        this.textContent = '';
        return this;
    };
}

if (typeof elementPrototype.setText !== 'function') {
    elementPrototype.setText = function (text: string | DocumentFragment): ObsidianElement {
        this.empty();
        if (typeof text === 'string') {
            this.textContent = text;
        } else {
            this.append(text);
        }
        return this;
    };
}

/**
 * Since we don't use the app object's method or properties directly,
 * and just treat it as an "opaque object" for markdown rendering, there is
 * not a lot to mock in particular.
 */
export const mockApp = {} as unknown as ObsidianApp;

export const Platform = {
    isMobile: false,
};

export class Component {
    public containerEl: HTMLElement;

    constructor() {
        this.containerEl = document.createElement('div');
    }

    addChild(_child: Component): void {}
    removeChild(_child: Component): void {}
    registerDomEvent(_el: HTMLElement | Document | Window, _type: string, _callback: (...args: any[]) => any): void {}
    registerEvent(_eventRef: unknown): void {}
    registerInterval(_id: number): void {}
    onload(): void {}
    onunload(): void {}
}

export class Plugin extends Component {
    public app = mockApp;
    addCommand(_command: unknown): void {}
    registerEditorExtension(_extension: unknown): void {}
    registerMarkdownCodeBlockProcessor(_language: string, _handler: unknown): void {}
    registerMarkdownPostProcessor(_handler: unknown): void {}
    addSettingTab(_tab: unknown): void {}
}

export class Modal extends Component {
    public app = mockApp;
    public contentEl = document.createElement('div');
    public modalEl = document.createElement('div');
    public titleEl = document.createElement('div');

    constructor(app: ObsidianApp = mockApp) {
        super();
        this.app = app;
    }

    public open(): void {
        this.onOpen();
    }

    public close(): void {
        this.onClose();
    }

    public onOpen(): void {}
    public onClose(): void {}
}

type MockNoticeInstance = {
    message?: string | DocumentFragment;
    timeout?: number;
    setMessage: (message: string | DocumentFragment) => MockNoticeInstance;
    hide: () => void;
};

const noticeImplementation = function (this: MockNoticeInstance, message: string | DocumentFragment, timeout?: number) {
    this.message = message;
    this.timeout = timeout;
    this.setMessage = (nextMessage: string | DocumentFragment) => {
        this.message = nextMessage;
        return this;
    };
    this.hide = () => {};
};

export const Notice = jest.fn(noticeImplementation as (...args: any[]) => void);

export class TAbstractFile {
    public path = '';
    public name = '';
    public parent: TAbstractFile | null = null;
}

export class TFile extends TAbstractFile {
    public basename = '';
    public extension = 'md';
}

export class Vault {
    public adapter = {
        exists: async () => false,
    };

    getMarkdownFiles(): TFile[] {
        return [];
    }

    getFiles(): TFile[] {
        return [];
    }

    async cachedRead(_file: TFile): Promise<string> {
        return '';
    }

    async read(_file: TFile): Promise<string> {
        return '';
    }

    async modify(_file: TFile, _contents: string): Promise<void> {}
}

export class MetadataCache {
    getFileCache(_file: TFile): CachedMetadata | null {
        return null;
    }

    fileToLinktext(file: TFile, _sourcePath: string, _omitMdExtension?: boolean): string {
        return file.path;
    }

    getFirstLinkpathDest(_linkpath: string, _sourcePath: string): TFile | null {
        return null;
    }
}

export class Workspace {
    getActiveViewOfType<T>(_type: new (...args: any[]) => T): T | null {
        return null;
    }
}

export class App {
    public metadataCache = new MetadataCache();
    public vault = new Vault();
    public workspace = new Workspace();
}

export class View extends Component {}

export class MarkdownView extends View {
    public editor = new Editor();
    public file: TFile | null = null;
}

export class Editor {
    getCursor() {
        return { line: 0, ch: 0 };
    }

    getLine(_line: number): string {
        return '';
    }

    replaceRange(_replacement: string, _from?: unknown, _to?: unknown): void {}
    setCursor(_position: unknown): void {}
}

export class MarkdownRenderChild extends Component {
    constructor(public el: HTMLElement) {
        super();
    }
}

export const MarkdownRenderer = {
    render: async (_app: unknown, _markdown: string, _el: HTMLElement, _path: string, _component?: Component) => {},
    renderMarkdown: async (_markdown: string, _el: HTMLElement, _path: string, _component?: Component) => {},
};

export class EditorSuggest<T> extends Component {
    public context: T | null = null;
}

export const editorInfoField = Symbol('editorInfoField');

export class Keymap {
    static isModEvent(_event: KeyboardEvent | MouseEvent): boolean {
        return false;
    }
}

export class Setting {
    constructor(public settingEl: HTMLElement = document.createElement('div')) {}

    setName(_name: string | DocumentFragment): this {
        return this;
    }

    setDesc(_description: string | DocumentFragment): this {
        return this;
    }

    addText(callback: (component: TextComponent) => unknown): this {
        callback(new TextComponent());
        return this;
    }

    addTextArea(callback: (component: TextAreaComponent) => unknown): this {
        callback(new TextAreaComponent());
        return this;
    }

    addToggle(callback: (component: ToggleComponent) => unknown): this {
        callback(new ToggleComponent());
        return this;
    }

    addDropdown(callback: (component: DropdownComponent) => unknown): this {
        callback(new DropdownComponent());
        return this;
    }

    addButton(callback: (component: ButtonComponent) => unknown): this {
        callback(new ButtonComponent());
        return this;
    }

    addExtraButton(callback: (component: ExtraButtonComponent) => unknown): this {
        callback(new ExtraButtonComponent());
        return this;
    }
}

export class PluginSettingTab {
    public containerEl = document.createElement('div');

    constructor(public app: App, public plugin: Plugin) {}

    display(): void {}
    hide(): void {}
}

class BaseComponent<TElement extends HTMLElement> {
    public inputEl: TElement;

    constructor(factory: () => TElement) {
        this.inputEl = factory();
    }

    setValue(_value: string | boolean): this {
        return this;
    }

    setPlaceholder(_placeholder: string): this {
        return this;
    }

    onChange(_callback: (value: any) => unknown): this {
        return this;
    }
}

export class TextComponent extends BaseComponent<HTMLInputElement> {
    constructor() {
        super(() => document.createElement('input'));
    }
}

export class TextAreaComponent extends BaseComponent<HTMLTextAreaElement> {
    constructor() {
        super(() => document.createElement('textarea'));
    }
}

export class ToggleComponent extends BaseComponent<HTMLInputElement> {
    constructor() {
        super(() => document.createElement('input'));
    }
}

export class DropdownComponent extends BaseComponent<HTMLSelectElement> {
    constructor() {
        super(() => document.createElement('select'));
    }

    addOption(_value: string, _label: string): this {
        return this;
    }
}

export class ButtonComponent extends BaseComponent<HTMLButtonElement> {
    constructor() {
        super(() => document.createElement('button'));
    }

    setButtonText(_text: string): this {
        return this;
    }

    setCta(): this {
        return this;
    }

    onClick(_callback: () => unknown): this {
        return this;
    }
}

export class ExtraButtonComponent extends ButtonComponent {
    setIcon(_icon: string): this {
        return this;
    }

    setTooltip(_tooltip: string): this {
        return this;
    }
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

type IconName = string;

export function setIcon(element: HTMLElement, iconId: IconName): void {
    element.setAttribute('test-icon', iconId);
}

export function setTooltip(element: HTMLElement, text: string): void {
    element.setAttribute('test-tooltip', text);
}

export function getLinkpath(rawLink: string): string {
    return rawLink;
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
