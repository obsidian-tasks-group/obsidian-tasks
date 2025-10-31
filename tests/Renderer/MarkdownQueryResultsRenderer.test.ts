import { MarkdownQueryResultsRenderer } from '../../src/Renderer/MarkdownQueryResultsRenderer';
import { State } from '../../src/Obsidian/Cache';
import { readTasksFromSimulatedFile } from '../Obsidian/SimulatedFile';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { verifyWithFileExtension } from '../TestingTools/ApprovalTestHelpers';
import type { Task } from '../../src/Task/Task';
import { fromLines, toMarkdown } from '../TestingTools/TestHelpers';
import { Query } from '../../src/Query/Query';

function makeMarkdownResultsRenderer(source: string, tasksFile: TasksFile) {
    return new MarkdownQueryResultsRenderer(source, tasksFile, new Query(source, tasksFile));
}

async function searchTasksAndCopyResult(tasks: Task[], source: string) {
    const renderer = makeMarkdownResultsRenderer(source, new TasksFile('query.md'));
    await renderer.renderQuery(State.Warm, tasks);

    return renderer.getMarkdown();
}

async function searchMarkdownAndCopyResult(tasksMarkdown: string, query: string) {
    const lines = tasksMarkdown.split('\n').filter((line) => line.length > 0);
    const tasks = fromLines({ lines });
    return await searchTasksAndCopyResult(tasks, query);
}

async function verifyRenderedTasksMarkdown(tasks: Task[], source: string) {
    const markdown = await searchTasksAndCopyResult(tasks, source);

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
            readTasksFromSimulatedFile('inheritance_1parent1child1newroot_after_header'),
            'show tree',
        );
    });

    it('should support renderToMarkdown', async () => {
        await verifyRenderedTasksMarkdown(
            readTasksFromSimulatedFile('inheritance_1parent1child1newroot_after_header'),
            'show tree',
        );
    });
});

describe('Copying results', () => {
    it('should copy one grouping level', async () => {
        const tasks = `
- [ ] 4444
- [ ] 333
- [ ] 55555
`;

        const query = 'group by function task.description.length';

        expect(await searchMarkdownAndCopyResult(tasks, query)).toEqual(`
#### 3

- [ ] 333

#### 4

- [ ] 4444

#### 5

- [ ] 55555
`);
    });
});
