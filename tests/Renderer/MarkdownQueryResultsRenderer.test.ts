import { MarkdownQueryResultsRenderer } from '../../src/Renderer/MarkdownQueryResultsRenderer';
import { State } from '../../src/Obsidian/Cache';
import type { QueryRendererParameters } from '../../src/Renderer/QueryResultsRenderer';
import { readTasksFromSimulatedFile } from '../Obsidian/SimulatedFile';
import { getTasksFileFromMockData } from '../TestingTools/MockDataHelpers';
import { MockDataLoader } from '../TestingTools/MockDataLoader';
import type { TasksFile } from '../../src/Scripting/TasksFile';
import { verifyWithFileExtension } from '../TestingTools/ApprovalTestHelpers';
import type { Task } from '../../src/Task/Task';
import type { MockDataName } from '../Obsidian/AllCacheSampleData';

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

async function verifyRenderedTasksMarkdown(
    source: string,
    tasksFile: TasksFile,
    tasks: Task[],
    queryRendererParameters: QueryRendererParameters,
    testDataName: MockDataName,
) {
    const renderer = makeMarkdownResultsRenderer(source, tasksFile);

    // Render the query
    const content = document.createElement('div');
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
    verifyWithFileExtension(output, 'md');
}

describe('rendering', () => {
    const source = 'show tree';
    const testDataName = 'inheritance_1parent1child1newroot_after_header';
    const tasksFile = getTasksFileFromMockData(testDataName);
    const tasks = readTasksFromSimulatedFile(testDataName);

    const queryRendererParameters: QueryRendererParameters = {
        allTasks: tasks,
        allMarkdownFiles: [],
        backlinksClickHandler: async () => {},
        backlinksMousedownHandler: async () => {},
        editTaskPencilClickHandler: () => {},
    };

    it('should support render', async () => {
        await verifyRenderedTasksMarkdown(source, tasksFile, tasks, queryRendererParameters, testDataName);
    });

    it('should support renderToMarkdown()', async () => {
        await verifyRenderedTasksMarkdown(source, tasksFile, tasks, queryRendererParameters, testDataName);
    });
});
