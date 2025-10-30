import { MarkdownQueryResultsRenderer } from '../../src/Renderer/MarkdownQueryResultsRenderer';
import { State } from '../../src/Obsidian/Cache';
import type { QueryRendererParameters } from '../../src/Renderer/QueryResultsRenderer';
import { readTasksFromSimulatedFile } from '../Obsidian/SimulatedFile';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { verifyWithFileExtension } from '../TestingTools/ApprovalTestHelpers';
import type { Task } from '../../src/Task/Task';
import { toMarkdown } from '../TestingTools/TestHelpers';

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

async function verifyRenderedTasksMarkdown(source: string, tasks: Task[]) {
    const renderer = makeMarkdownResultsRenderer(source, new TasksFile('query.md'));

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

    const output = `Tasks found by the search:

${toMarkdown(tasks)}

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
    it('should support render', async () => {
        await verifyRenderedTasksMarkdown(
            'show tree',
            readTasksFromSimulatedFile('inheritance_1parent1child1newroot_after_header'),
        );
    });

    it('should support renderToMarkdown', async () => {
        await verifyRenderedTasksMarkdown(
            'show tree',
            readTasksFromSimulatedFile('inheritance_1parent1child1newroot_after_header'),
        );
    });
});
