import moment from 'moment/moment';
import { State } from '../../src/Obsidian/Cache';
import { Query } from '../../src/Query/Query';
import { MarkdownQueryResultsRenderer } from '../../src/Renderer/MarkdownQueryResultsRenderer';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { Priority } from '../../src/Task/Priority';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

window.moment = moment;

describe('MarkdownQueryResultsRenderer tests', () => {
    it('should render single task', async () => {
        const source = 'hide tree';
        const tasksFile = new TasksFile('query.md');
        const query = new Query(source, tasksFile);

        const renderer = new MarkdownQueryResultsRenderer({
            query: () => query,
            tasksFile: () => tasksFile,
            source: () => source,
        });

        const tasks = [new TaskBuilder().description('hello').priority(Priority.Medium).build()];
        await renderer.renderQuery(State.Warm, tasks);

        expect(renderer.markdown).toEqual('- [ ] hello 🔼');
    });
});
