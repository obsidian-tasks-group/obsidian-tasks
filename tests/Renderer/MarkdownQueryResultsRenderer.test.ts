import moment from 'moment/moment';
import type { Task } from 'Task/Task';
import { State } from '../../src/Obsidian/Cache';
import { Query } from '../../src/Query/Query';
import { MarkdownQueryResultsRenderer } from '../../src/Renderer/MarkdownQueryResultsRenderer';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { Priority } from '../../src/Task/Priority';
import { readTasksFromSimulatedFile } from '../Obsidian/SimulatedFile';
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

async function renderMarkdown(source: string, tasks: Task[]) {
    const renderer = createMarkdownRenderer(source);
    await renderer.renderQuery(State.Warm, tasks);
    return '\n' + renderer.markdown;
}

function readMarkdown(tasksMarkdown: string) {
    const lines = tasksMarkdown.split('\n').filter((line) => line.length > 0);
    return fromLines({ lines });
}

describe('MarkdownQueryResultsRenderer tests', () => {
    it('should render single task', async () => {
        const markdown = await renderMarkdown('hide tree', [
            new TaskBuilder().description('hello').priority(Priority.Medium).build(),
        ]);
        expect(markdown).toMatchInlineSnapshot(`
            "
            - [ ] hello 🔼
            "
        `);
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
        const markdown = await renderMarkdown('hide tree\nsort by priority reverse', [
            new TaskBuilder().description('hello').priority(Priority.Medium).build(),
            new TaskBuilder().description('bye').priority(Priority.High).build(),
        ]);
        expect(markdown).toMatchInlineSnapshot(`
            "
            - [ ] hello 🔼
            - [ ] bye ⏫
            "
        `);
    });

    it('should write one grouping level', async () => {
        const tasks = readMarkdown(`
- [ ] 4444
- [ ] 333
- [ ] 55555
`);

        const markdown = await renderMarkdown('hide tree\ngroup by function task.description.length', tasks);
        expect(markdown).toMatchInlineSnapshot(`
            "
            #### 3

            - [ ] 333

            #### 4

            - [ ] 4444

            #### 5

            - [ ] 55555
            "
        `);
    });

    it('should write four grouping levels', async () => {
        const tasks = readMarkdown(`
- [ ] 1 ⏳ 2025-10-29
- [ ] 2 ⏬
- [ ] 3 ⏫ ⏳ 2025-10-30
- [ ] 4 ⏳ 2025-10-29
- [ ] 5 #something
- [ ] 6 🆔 id6
`);

        const markdown = await renderMarkdown(
            `
group by function task.tags.join(',')
group by priority
group by scheduled
group by id
`,
            tasks,
        );
        expect(markdown).toMatchInlineSnapshot(`
            "
            ##### %%1%%High priority

            ###### 2025-10-30 Thursday

            - [ ] 3 ⏫ ⏳ 2025-10-30

            ##### %%3%%Normal priority

            ###### 2025-10-29 Wednesday

            - [ ] 1 ⏳ 2025-10-29
            - [ ] 4 ⏳ 2025-10-29

            ###### No scheduled date

            ###### id6

            - [ ] 6 🆔 id6

            ##### %%5%%Lowest priority

            ###### No scheduled date

            - [ ] 2 ⏬

            #### #something

            ##### %%3%%Normal priority

            ###### No scheduled date

            - [ ] 5 #something
            "
        `);
    });

    it('should remove indentation for nested tasks', async () => {
        const tasks = readTasksFromSimulatedFile('inheritance_2roots_listitem_listitem_task');

        const markdown = await renderMarkdown('', tasks);
        expect(markdown).toMatchInlineSnapshot(`
            "
            - [ ] grandchild task 1
            - [ ] grandchild task 2
            "
        `);
    });

    it('should indent nested tasks', async () => {
        const tasks = readTasksFromSimulatedFile(
            'inheritance_1parent2children2grandchildren1sibling_start_with_heading',
        );

        const markdown = await renderMarkdown('show tree', tasks);
        expect(markdown).toMatchInlineSnapshot(`
            "
            - [ ] #task parent task
                - [ ] #task child task 1
                    - [ ] #task grandchild 1
                - [ ] #task child task 2
                    - [ ] #task grandchild 2
            - [ ] #task sibling
            "
`);
    });

    it('should use hyphen as list marker', async () => {
        const tasks = readTasksFromSimulatedFile('mixed_list_markers');

        const markdown = await renderMarkdown('', tasks);

        expect(markdown).toMatchInlineSnapshot(`
            "
            - [ ] hyphen
            - [ ] asterisk
            - [ ] plus
            - [ ] numbered task
            "
        `);
    });

    it('should remove callout prefixes', async () => {
        const tasks = readTasksFromSimulatedFile('callout_labelled');

        const markdown = await renderMarkdown('', tasks);

        expect(markdown).toMatchInlineSnapshot(`
            "
            - [ ] #task Task in 'callout_labelled'
            - [ ] #task Task indented in 'callout_labelled'
            "
        `);
    });
});
