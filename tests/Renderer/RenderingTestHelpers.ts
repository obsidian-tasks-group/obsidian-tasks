import type { App } from 'obsidian';
import { State } from '../../src/Obsidian/Cache';
import { Query } from '../../src/Query/Query';
import { MarkdownQueryResultsRenderer } from '../../src/Renderer/MarkdownQueryResultsRenderer';
import type { QueryRendererParameters } from '../../src/Renderer/QueryResultsRenderer';
import { TasksFile } from '../../src/Scripting/TasksFile';
import type { Task } from '../../src/Task/Task';

export const mockHTMLRenderer = async (_obsidianApp: App, text: string, element: HTMLSpanElement, _path: string) => {
    // Contrary to the default mockTextRenderer(),
    // instead of the rendered HTMLSpanElement.innerText,
    // we need the plain HTML here like in TaskLineRenderer.renderComponentText(),
    // to ensure that description and tags are retained.
    element.innerHTML = text;
};

export const mockTextRenderer = async (_obsidianApp: App, text: string, element: HTMLSpanElement, _path: string) => {
    element.innerText = text;
};

export function makeQueryRendererParameters(allTasks: Task[]): QueryRendererParameters {
    return {
        allTasks: () => allTasks,
        allMarkdownFiles: () => [],
        backlinksClickHandler: () => Promise.resolve(),
        backlinksMousedownHandler: () => Promise.resolve(),
        editTaskPencilClickHandler: () => {},
    };
}

export function createMarkdownRenderer(source: string) {
    const tasksFile = new TasksFile('query.md');
    const query = new Query(source, tasksFile);
    const renderer = new MarkdownQueryResultsRenderer({
        query: () => query,
        tasksFile: () => tasksFile,
        source: () => source,
    });
    return { renderer, query };
}

export async function renderMarkdown(source: string, tasks: Task[]) {
    const { renderer, query } = createMarkdownRenderer(source);
    const queryResult = query.applyQueryToTasks(tasks);
    await renderer.renderQuery(State.Warm, queryResult);
    return { markdown: '\n' + renderer.markdown, queryResult };
}
