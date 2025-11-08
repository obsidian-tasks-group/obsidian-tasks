import moment from 'moment/moment';
import type { Task } from 'Task/Task';
import { State } from '../../src/Obsidian/Cache';
import { Query } from '../../src/Query/Query';
import { MarkdownQueryResultsRenderer } from '../../src/Renderer/MarkdownQueryResultsRenderer';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { Priority } from '../../src/Task/Priority';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

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

describe('MarkdownQueryResultsRenderer tests', () => {
    it('should render single task', async () => {
        await testMarkdown(
            'hide tree',
            [new TaskBuilder().description('hello').priority(Priority.Medium).build()],
            '- [ ] hello 🔼\n',
        );
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
});
