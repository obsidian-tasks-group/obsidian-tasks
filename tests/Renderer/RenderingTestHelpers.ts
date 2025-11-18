import type { App } from 'obsidian';
import type { QueryRendererParameters } from '../../src/Renderer/QueryResultsRenderer';
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
