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
    it('renders no due date column', () => {
        const source = 'view columns by due\npreset hide_everything';
        const allTasks = [new TaskBuilder().build()];

        const { query, renderer } = makeColumnRenderer(source, allTasks);
        verifyHtmlFromRenderer(renderer, State.Warm, query, allTasks);
    });
});
