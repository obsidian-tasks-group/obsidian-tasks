import { MarkdownQueryResultsRenderer } from '../../src/Renderer/MarkdownQueryResultsRenderer';
import { State } from '../../src/Obsidian/Cache';
import type { QueryRendererParameters } from '../../src/Renderer/QueryResultsRenderer';
import { readTasksFromSimulatedFile } from '../Obsidian/SimulatedFile';
import { getTasksFileFromMockData } from '../TestingTools/MockDataHelpers';
import { MockDataLoader } from '../TestingTools/MockDataLoader';

describe('MarkdownQueryResultsRenderer', () => {
    it('should support render() and provide results as markdown', async () => {
        const source = 'show tree';
        const testDataName = 'inheritance_1parent1child1newroot_after_header';

        const tasksFile = getTasksFileFromMockData(testDataName);

        const renderer = new MarkdownQueryResultsRenderer(
            'block-language-tasks',
            source,
            tasksFile,
            async () => {}, // renderMarkdown - not used by markdown visitor
            null, // obsidianComponent - not used
            null as any, // obsidianApp - not used
        );

        const tasks = readTasksFromSimulatedFile(testDataName);

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
});
