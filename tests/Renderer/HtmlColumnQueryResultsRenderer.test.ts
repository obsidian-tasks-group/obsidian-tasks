import moment from 'moment';
import { GlobalQuery } from '../../src/Config/GlobalQuery';
import { State } from '../../src/Obsidian/Cache';
import { getQueryForQueryRenderer } from '../../src/Query/QueryRendererHelper';
import { HtmlColumnQueryResultsRenderer } from '../../src/Renderer/HtmlColumnQueryResultsRenderer';
import type { Task } from '../../src/Task/Task';
import { mockApp } from '../__mocks__/obsidian';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { createTestTasksFile } from '../TestingTools/TasksFileHelpers';
import { makeHtmlQueryRendererParameters, mockHTMLRenderer, verifyHtmlFromRenderer } from './RenderingTestHelpers';

window.moment = moment;

function makeColumnRenderer(source: string, allTasks: Task[]) {
    const tasksFile = createTestTasksFile('query.md');
    const query = getQueryForQueryRenderer(source, GlobalQuery.getInstance(), tasksFile);

    const renderer = new HtmlColumnQueryResultsRenderer(
        () => Promise.resolve(),
        null,
        mockApp,
        mockHTMLRenderer,
        makeHtmlQueryRendererParameters(allTasks),
        source,
        tasksFile,
        query,
    );
    return { query, renderer };
}

describe('columns rendering', () => {
    const due_columns = 'view columns by due\nhide backlink\nhide edit button';

    it('renders no due date column', () => {
        const allTasks = [new TaskBuilder().build()];

        const { query, renderer } = makeColumnRenderer(due_columns, allTasks);
        verifyHtmlFromRenderer(renderer, State.Warm, query, allTasks);
    });

    it('renders due date column', () => {
        const allTasks = [new TaskBuilder().dueDate('2026-07-13').build()];

        const { query, renderer } = makeColumnRenderer(due_columns, allTasks);
        verifyHtmlFromRenderer(renderer, State.Warm, query, allTasks);
    });
});
