import { MarkdownQueryResultsRenderer } from '../../src/Renderer/MarkdownQueryResultsRenderer';
import { State } from '../../src/Obsidian/Cache';
import type { QueryRendererParameters } from '../../src/Renderer/QueryResultsRenderer';
import { readTasksFromSimulatedFile } from '../Obsidian/SimulatedFile';
import { getTasksFileFromMockData } from '../TestingTools/MockDataHelpers';
import { MockDataLoader } from '../TestingTools/MockDataLoader';
import type { TasksFile } from '../../src/Scripting/TasksFile';

function makeMarkdownResultsRenderer(source: string, tasksFile: TasksFile) {
    return new MarkdownQueryResultsRenderer(
        'block-language-tasks',
        source,
        tasksFile,
        async () => {}, // renderMarkdown - not used by markdown visitor
        null, // obsidianComponent - not used
        null as any, // obsidianApp - not used
    );
}

describe('MarkdownQueryResultsRenderer', () => {
    const source = 'show tree';
    const testDataName = 'inheritance_1parent1child1newroot_after_header';
    const tasksFile = getTasksFileFromMockData(testDataName);
    const tasks = readTasksFromSimulatedFile(testDataName);

    it('should support render() and provide results as markdown', async () => {
        const renderer = makeMarkdownResultsRenderer(source, tasksFile);

        // Render the query
        const content = document.createElement('div');
        const queryRendererParameters: QueryRendererParameters = {
            allTasks: tasks,
            allMarkdownFiles: [],
            backlinksClickHandler: async () => {},
            backlinksMousedownHandler: async () => {},
            editTaskPencilClickHandler: () => {},
        };
        await renderer.render(State.Warm, tasks, content, queryRendererParameters);

        // Get the markdown
        const markdown = renderer.getMarkdownOutput();

        const output = `Source Markdown note:
${MockDataLoader.get(testDataName).fileContents}

---

Query:
${source}

---

Copied search results, in Markdown format:
${markdown}
`;

        expect(output).toEqual(`Source Markdown note:
# first header

- [ ] #task parent task
    - [ ] #task child task 1

## second header

- [ ] #task root task


---

Query:
show tree

---

Copied search results, in Markdown format:
- [ ] #task parent task
        - [ ] #task child task 1
- [ ] #task root task

`);
    });

    it('should support renderToMarkdown()', async () => {
        const renderer = makeMarkdownResultsRenderer(source, tasksFile);

        // Render the query
        const queryRendererParameters: QueryRendererParameters = {
            allTasks: tasks,
            allMarkdownFiles: [],
            backlinksClickHandler: async () => {},
            backlinksMousedownHandler: async () => {},
            editTaskPencilClickHandler: () => {},
        };
        await renderer.renderToMarkdown(State.Warm, tasks, queryRendererParameters);

        // Get the markdown
        const markdown = renderer.getMarkdownOutput();

        const output = `Source Markdown note:
${MockDataLoader.get(testDataName).fileContents}

---

Query:
${source}

---

Copied search results, in Markdown format:
${markdown}
`;

        expect(output).toEqual(`Source Markdown note:
# first header

- [ ] #task parent task
    - [ ] #task child task 1

## second header

- [ ] #task root task


---

Query:
show tree

---

Copied search results, in Markdown format:
- [ ] #task parent task
        - [ ] #task child task 1
- [ ] #task root task

`);
    });
});
