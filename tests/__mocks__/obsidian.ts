import type { App, CachedMetadata, Reference } from 'obsidian';
import type { SimulatedFile } from '../Obsidian/SimulatedFile';
import { MockDataLoader } from '../TestingTools/MockDataLoader';

export {};

/**
 * Since we don't use the app object's method or properties directly,
 * and just treat it as an "opaque object" for markdown rendering, there is
 * not a lot to mock in particular.
 */
export const mockApp = {} as unknown as App;

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
export function setIcon(_parent: HTMLElement, _iconId: IconName): void {}

/**
 * A mock implementation of the Obsidian Modal class.
 * Without this testing the TaskModal throws an error attempting to extend Modal
 */
export class Modal {
    public open(): void {
        // Mocked interface, no-op
    }
    public close(): void {
        // Mocked interface, no-op
    }
    public onOpen(): void {}
    public onClose(): void {}
}
