import { MarkdownQueryResultsRenderer } from '../../src/Renderer/MarkdownQueryResultsRenderer';
import { State } from '../../src/Obsidian/Cache';
import { readTasksFromSimulatedFile } from '../Obsidian/SimulatedFile';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { verifyWithFileExtension } from '../TestingTools/ApprovalTestHelpers';
import type { Task } from '../../src/Task/Task';
import { toMarkdown } from '../TestingTools/TestHelpers';
import { Query } from '../../src/Query/Query';

function makeMarkdownResultsRenderer(source: string, tasksFile: TasksFile) {
    return new MarkdownQueryResultsRenderer(source, tasksFile, new Query(source, tasksFile));
}

async function verifyRenderedTasksMarkdown(source: string, tasks: Task[]) {
    const renderer = makeMarkdownResultsRenderer(source, new TasksFile('query.md'));

    await renderer.renderQuery(State.Warm, tasks);

    // Get the markdown
    const markdown = renderer.getMarkdown();

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
