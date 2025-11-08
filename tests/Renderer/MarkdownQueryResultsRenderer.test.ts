import moment from 'moment/moment';
import type { Task } from 'Task/Task';
import { State } from '../../src/Obsidian/Cache';
import { Query } from '../../src/Query/Query';
import { MarkdownQueryResultsRenderer } from '../../src/Renderer/MarkdownQueryResultsRenderer';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { Priority } from '../../src/Task/Priority';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { fromLines } from '../TestingTools/TestHelpers';

window.moment = moment;

function createMarkdownRenderer(source: string) {
    const tasksFile = new TasksFile('query.md');
    const query = new Query(source, tasksFile);
    return new MarkdownQueryResultsRenderer({
        query: () => query,
        tasksFile: () => tasksFile,
        source: () => source,
    });
}

async function testMarkdown(source: string, tasks: Task[], expectedMarkdown: string) {
    const renderer = createMarkdownRenderer(source);
    await renderer.renderQuery(State.Warm, tasks);
    expect(renderer.markdown).toEqual(expectedMarkdown);
}

function readMarkdown(tasksMarkdown: string) {
    const lines = tasksMarkdown.split('\n').filter((line) => line.length > 0);
    const tasks = fromLines({ lines });
    return tasks;
}

describe('MarkdownQueryResultsRenderer tests', () => {
    it('should render single task', async () => {
        await testMarkdown(
            'hide tree',
            [new TaskBuilder().description('hello').priority(Priority.Medium).build()],
            '- [ ] hello 🔼\n',
        );
    });

    it('should render single task twice', async () => {
        const source = 'hide tree';
        const renderer = createMarkdownRenderer(source);

        const task = new TaskBuilder().description('hello').priority(Priority.Medium).build();

        await renderer.renderQuery(State.Warm, [task]);
        const r1 = renderer.markdown;

        await renderer.renderQuery(State.Warm, [task]);
        const r2 = renderer.markdown;

        expect(r1).toEqual(r2);
    });

    it('should render two tasks', async () => {
        await testMarkdown(
            'hide tree\nsort by priority reverse',
            [
                new TaskBuilder().description('hello').priority(Priority.Medium).build(),
                new TaskBuilder().description('bye').priority(Priority.High).build(),
            ],
            '- [ ] hello 🔼\n- [ ] bye ⏫\n',
        );
    });

    it('should write one grouping level', async () => {
        const tasks = readMarkdown(`
- [ ] 4444
- [ ] 333
- [ ] 55555
`);

        await testMarkdown(
            'hide tree\ngroup by function task.description.length',
            tasks,
            `#### 3

- [ ] 333

#### 4

- [ ] 4444

#### 5

- [ ] 55555
`,
        );
    });
});
