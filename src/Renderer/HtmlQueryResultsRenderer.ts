import type { App, Component } from 'obsidian';
import type { QueryResultsRendererGetters } from './QueryResultsRenderer';
import type { TextRenderer } from './TaskLineRenderer';

export class HtmlQueryResultsRenderer {
    // Renders the description in TaskLineRenderer:
    protected readonly textRenderer;

    // Renders the group heading in this class:
    protected readonly renderMarkdown;
    protected readonly obsidianComponent: Component | null;
    protected readonly obsidianApp: App;
    public getters: QueryResultsRendererGetters | null = null;

    constructor(
        renderMarkdown: (
            app: App,
            markdown: string,
            el: HTMLElement,
            sourcePath: string,
            component: Component,
        ) => Promise<void>,
        obsidianComponent: Component | null,
        obsidianApp: App,
        textRenderer: TextRenderer,
    ) {
        this.renderMarkdown = renderMarkdown;
        this.obsidianComponent = obsidianComponent;
        this.obsidianApp = obsidianApp;
        this.textRenderer = textRenderer;
    }

    protected setGetters(getters: QueryResultsRendererGetters) {
        this.getters = getters;
    }
}
