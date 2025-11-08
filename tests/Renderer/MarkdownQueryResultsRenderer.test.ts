import moment from 'moment/moment';
import type { Task } from 'Task/Task';
import { State } from '../../src/Obsidian/Cache';
import { Query } from '../../src/Query/Query';
import { MarkdownQueryResultsRenderer } from '../../src/Renderer/MarkdownQueryResultsRenderer';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { Priority } from '../../src/Task/Priority';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

window.moment = moment;

async function testMarkdown(source: string, tasks: Task[], expectedMarkdown: string) {
    const tasksFile = new TasksFile('query.md');

    const query = new Query(source, tasksFile);

    const renderer = new MarkdownQueryResultsRenderer({
        query: () => query,
        tasksFile: () => tasksFile,
        source: () => source,
    });

    await renderer.renderQuery(State.Warm, tasks);

    expect(renderer.markdown).toEqual(expectedMarkdown);
}

describe('MarkdownQueryResultsRenderer tests', () => {
    it('should render single task', async () => {
        await testMarkdown(
            'hide tree',
            [new TaskBuilder().description('hello').priority(Priority.Medium).build()],
            '- [ ] hello 🔼',
        );
    });
});
