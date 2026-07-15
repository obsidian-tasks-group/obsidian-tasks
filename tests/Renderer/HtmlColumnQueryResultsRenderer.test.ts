import moment from 'moment';
import { GlobalQuery } from '../../src/Config/GlobalQuery';
import { State } from '../../src/Obsidian/Cache';
import { getQueryForQueryRenderer } from '../../src/Query/QueryRendererHelper';
import { HtmlColumnQueryResultsRenderer } from '../../src/Renderer/HtmlColumnQueryResultsRenderer';
import { Priority } from '../../src/Task/Priority';
import type { Task } from '../../src/Task/Task';
import { mockApp } from '../__mocks__/obsidian';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { createTestTasksFile } from '../TestingTools/TasksFileHelpers';
import { makeHtmlQueryRendererParameters, mockHTMLRenderer, verifyHtmlFromRenderer } from './RenderingTestHelpers';

window.moment = moment;

beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-13'));
});

afterAll(() => {
    jest.useRealTimers();
});

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
    const priority_columns = 'view columns by priority\nhide backlink\nhide edit button';

    const noTasks: Task[] = [];
    const emptyTask = [new TaskBuilder().build()];

    const withDue = [new TaskBuilder().dueDate('2026-07-13').build()];
    const withDueAndScheduled = [new TaskBuilder().dueDate('2026-06-23').scheduledDate('2025-12-01').build()];

    const twoPriorities = [
        new TaskBuilder().priority(Priority.Highest).build(),
        new TaskBuilder().priority(Priority.Low).build(),
    ];

    it('renders no search results', async () => {
        const { query, renderer } = makeColumnRenderer(due_columns, noTasks);
        await verifyHtmlFromRenderer(renderer, State.Warm, query, noTasks);
    });

    it('renders no due date column', async () => {
        const { query, renderer } = makeColumnRenderer(due_columns, emptyTask);
        await verifyHtmlFromRenderer(renderer, State.Warm, query, emptyTask);
    });

    it('renders due date column', async () => {
        const { query, renderer } = makeColumnRenderer(due_columns, withDue);
        await verifyHtmlFromRenderer(renderer, State.Warm, query, withDue);
    });

    it('renders due date column and scheduled date groups', async () => {
        const { query, renderer } = makeColumnRenderer(due_columns + '\ngroup by scheduled', withDueAndScheduled);
        await verifyHtmlFromRenderer(renderer, State.Warm, query, withDueAndScheduled);
    });

    it('renders two priority columns', async () => {
        const { query, renderer } = makeColumnRenderer(priority_columns, twoPriorities);
        await verifyHtmlFromRenderer(renderer, State.Warm, query, twoPriorities);
    });

    it('renders one column with two headings', async () => {
        const { query, renderer } = makeColumnRenderer(due_columns + '\ngroup by priority', twoPriorities);
        await verifyHtmlFromRenderer(renderer, State.Warm, query, twoPriorities);
    });
});
