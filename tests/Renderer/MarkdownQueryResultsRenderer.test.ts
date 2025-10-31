/**
 * @jest-environment jsdom
 */
import moment from 'moment/moment';

import { MarkdownQueryResultsRenderer } from '../../src/Renderer/MarkdownQueryResultsRenderer';
import { State } from '../../src/Obsidian/Cache';
import { readTasksFromSimulatedFile } from '../Obsidian/SimulatedFile';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { verifyWithFileExtension } from '../TestingTools/ApprovalTestHelpers';
import type { Task } from '../../src/Task/Task';
import { fromLines, toMarkdown } from '../TestingTools/TestHelpers';
import { Query } from '../../src/Query/Query';

window.moment = moment;

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

    it.failing('should copy four grouping levels', async () => {
        const tasks = `
- [ ] 1 ⏳ 2025-10-29
- [ ] 2 ⏬
- [ ] 3 ⏫ ⏳ 2025-10-30
- [ ] 4 ⏳ 2025-10-29
- [ ] 5 #something
- [ ] 6 🆔 id6
`;

        const query = `
group by function task.tags.join(',')
group by priority
group by scheduled
group by id
`;

        expect(await searchMarkdownAndCopyResult(tasks, query)).toEqual(`
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
`);
    });

    it('should remove indentation for nested tasks', async () => {
        const tasks = readTasksFromSimulatedFile('inheritance_2roots_listitem_listitem_task');

        const query = '';

        expect(await searchTasksAndCopyResult(tasks, query)).toEqual(`
- [ ] grandchild task 1
- [ ] grandchild task 2
`);
    });

    it.failing('should indent nested tasks', async () => {
        const tasks = readTasksFromSimulatedFile(
            'inheritance_1parent2children2grandchildren1sibling_start_with_heading',
        );

        const query = '';

        expect(await searchTasksAndCopyResult(tasks, query)).toEqual(`
- [ ] #task parent task
    - [ ] #task child task 1
        - [ ] #task grandchild 1
    - [ ] #task child task 2
        - [ ] #task grandchild 2
- [ ] #task sibling
`);
    });

    it.failing('should use hyphen as list marker', async () => {
        const tasks = readTasksFromSimulatedFile('mixed_list_markers');

        const query = '';

        expect(await searchTasksAndCopyResult(tasks, query)).toEqual(`
- [ ] hyphen
- [ ] asterisk
- [ ] plus
- [ ] numbered task
`);
    });

    it('should remove callout prefixes', async () => {
        const tasks = readTasksFromSimulatedFile('callout_labelled');

        const query = '';

        expect(await searchTasksAndCopyResult(tasks, query)).toEqual(`
- [ ] #task Task in 'callout_labelled'
- [ ] #task Task indented in 'callout_labelled'
`);
    });
});
