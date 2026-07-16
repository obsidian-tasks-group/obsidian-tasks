import moment from 'moment/moment';
import { GlobalFilter } from '../../src/Config/GlobalFilter';
import { GlobalQuery } from '../../src/Config/GlobalQuery';
import { resetSettings, updateSettings } from '../../src/Config/Settings';
import { State } from '../../src/Obsidian/Cache';
import { getQueryForQueryRenderer } from '../../src/Query/QueryRendererHelper';
import { HtmlQueryResultsRenderer } from '../../src/Renderer/HtmlQueryResultsRenderer';
import type { TasksFile } from '../../src/Scripting/TasksFile';
import type { Task } from '../../src/Task/Task';
import { mockApp } from '../__mocks__/obsidian';
import { readTasksFromSimulatedFile } from '../Obsidian/SimulatedFile';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { createTestTasksFile } from '../TestingTools/TasksFileHelpers';
import {
    makeHtmlQueryRendererParameters,
    mockHTMLRenderer,
    renderTasks,
    verifyHtmlFromRenderer,
    verifyRenderedTasks,
} from './RenderingTestHelpers';

window.moment = moment;

function makeHtmlRenderer(source: string, tasksFile: TasksFile, allTasks: Task[]) {
    const query = getQueryForQueryRenderer(source, GlobalQuery.getInstance(), tasksFile);

    const renderer = new HtmlQueryResultsRenderer(
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

async function verifyRenderedHtml(
    allTasks: Task[],
    source: string,
    state: State = State.Warm,
): Promise<HTMLDivElement> {
    const tasksFile = createTestTasksFile('query.md');
    const { query, renderer } = makeHtmlRenderer(source, tasksFile, allTasks);
    return await verifyHtmlFromRenderer(renderer, state, query, allTasks);
}

type RenderedTaskBacklink = {
    description: string;
    nestingLevel: number;
    backlinkText: string | null;
};

function renderedTaskNestingLevel(li: Element) {
    let nestingLevel = 0;
    let parentListItem = li.parentElement?.closest('li');

    while (parentListItem !== null && parentListItem !== undefined) {
        nestingLevel += 1;
        parentListItem = parentListItem.parentElement?.closest('li');
    }

    return nestingLevel;
}

function renderedTaskBacklinks(container: HTMLElement) {
    return Array.from(container.querySelectorAll('li.task-list-item')).map((li) => ({
        description: li.querySelector(':scope > .tasks-list-text .task-description')?.textContent?.trim() ?? '',
        nestingLevel: renderedTaskNestingLevel(li),
        backlinkText: li.querySelector(':scope > .task-extras > .tasks-backlink')?.textContent?.trim() ?? null,
    }));
}

function expectRenderedTaskBacklinks(container: HTMLElement, expected: RenderedTaskBacklink[]) {
    expect(renderedTaskBacklinks(container)).toEqual(expected);
}

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-07-05'));
});

afterEach(() => {
    jest.useRealTimers();
    GlobalFilter.getInstance().reset();
    GlobalQuery.getInstance().reset();
    resetSettings();
});

describe('HtmlQueryResultsRenderer tests', () => {
    it('loading message', async () => {
        const allTasks = [TaskBuilder.createFullyPopulatedTask()];
        await verifyRenderedHtml(allTasks, 'show urgency', State.Initializing);
    });

    it('error message', async () => {
        const allTasks = [TaskBuilder.createFullyPopulatedTask()];
        await verifyRenderedHtml(allTasks, 'apple sauce');
    });

    it('error message with angle brackets', async () => {
        const allTasks = [TaskBuilder.createFullyPopulatedTask()];
        await verifyRenderedHtml(allTasks, 'price<10 & value>5');
    });

    it('error message with ampersand and quotes', async () => {
        const allTasks = [TaskBuilder.createFullyPopulatedTask()];
        await verifyRenderedHtml(allTasks, 'this & that "test"');
    });

    it('explain', async () => {
        GlobalQuery.getInstance().set('hide toolbar');
        const allTasks = [TaskBuilder.createFullyPopulatedTask()];
        await verifyRenderedHtml(allTasks, 'scheduled 1970-01-01\nexplain');
    });

    it('task count', async () => {
        const allTasks = readTasksFromSimulatedFile('inheritance_1parent1child');
        const query = `
hide toolbar
hide backlinks
hide edit button
`;
        await verifyRenderedHtml(allTasks, query);
    });

    it('task count - limit exceeded', async () => {
        const allTasks = readTasksFromSimulatedFile('inheritance_1parent1child');
        const query = `
hide toolbar
hide backlinks
hide edit button

limit 1
`;
        // In the built plugin, the task count shows '1 task` - see #3724
        // In this approved file, the task count is correctly '1 of 2 tasks'.
        // This suggests the error may be outside HtmlQueryResultsRenderer
        await verifyRenderedHtml(allTasks, query);
    });

    it('fully populated task - hidden fields', async () => {
        const allTasks = [TaskBuilder.createFullyPopulatedTask()];
        await verifyRenderedHtml(allTasks, 'hide scheduled date\nhide priority');
    });

    const showTree = 'show tree\n';
    const hideTree = 'hide tree\n';

    it('parent-child items hidden', async () => {
        const allTasks = readTasksFromSimulatedFile('inheritance_rendering_sample');
        await verifyRenderedHtml(allTasks, hideTree + 'sort by function task.lineNumber');
    });

    it('parent-child items', async () => {
        const allTasks = readTasksFromSimulatedFile('inheritance_rendering_sample');
        await verifyRenderedHtml(allTasks, showTree + 'sort by function task.lineNumber');
    });

    it('parent-child items reverse sorted', async () => {
        const allTasks = readTasksFromSimulatedFile('inheritance_rendering_sample');
        await verifyRenderedHtml(allTasks, showTree + 'sort by function reverse task.lineNumber');
    });

    it('should render tasks without their parents', async () => {
        // example chosen to match subtasks whose parents do not match the query
        const allTasks = readTasksFromSimulatedFile('inheritance_task_2listitem_3task');
        await verifyRenderedHtml(allTasks, showTree + 'description includes grandchild');
    });

    it('should render non task check box when global filter is enabled', async () => {
        GlobalFilter.getInstance().set('#task');
        const allTasks = readTasksFromSimulatedFile('inheritance_non_task_child');
        await verifyRenderedHtml(allTasks, showTree);
    });

    it('should render four group headings', async () => {
        const allTasks = readTasksFromSimulatedFile('inheritance_task_2listitem_3task');
        await verifyRenderedHtml(
            allTasks,
            `
group by function task.description.length
group by function 'level2'
group by function 'level3'
group by function 'level4'
`,
        );
    });

    it('should allow a task to be in multiple groups', async () => {
        const allTasks = [TaskBuilder.createFullyPopulatedTask()];
        await verifyRenderedHtml(allTasks, "group by function ['heading a', 'heading b']");
    });

    it('should indent nested tasks', async () => {
        const allTasks = readTasksFromSimulatedFile(
            'inheritance_1parent2children2grandchildren1sibling_start_with_heading',
        );
        await verifyRenderedHtml(allTasks, 'show tree');
    });

    describe('nested backlinks', () => {
        const allTasks = () =>
            readTasksFromSimulatedFile('inheritance_1parent2children2grandchildren1sibling_start_with_heading');
        const sortByLineNumber = 'sort by function task.lineNumber\n';

        it('show tree and hide nested backlink', async () => {
            // Top-level tasks (parent and sibling) keep their full backlink,
            // and nested tasks have their backlink hidden.
            const container = await verifyRenderedHtml(
                allTasks(),
                showTree + sortByLineNumber + 'hide nested backlink',
            );

            const fullBacklinkText =
                '(inheritance_1parent2children2grandchildren1sibling_start_with_heading > Test heading)';
            expectRenderedTaskBacklinks(container, [
                {
                    description: '#task parent task',
                    nestingLevel: 0,
                    backlinkText: fullBacklinkText,
                },
                {
                    description: '#task child task 1',
                    nestingLevel: 1,
                    backlinkText: null,
                },
                {
                    description: '#task grandchild 1',
                    nestingLevel: 2,
                    backlinkText: null,
                },
                {
                    description: '#task child task 2',
                    nestingLevel: 1,
                    backlinkText: null,
                },
                {
                    description: '#task grandchild 2',
                    nestingLevel: 2,
                    backlinkText: null,
                },
                {
                    description: '#task sibling',
                    nestingLevel: 0,
                    backlinkText: fullBacklinkText,
                },
            ]);
        });

        it('show tree and show nested backlink', async () => {
            // 'show nested backlink' is the default: all tasks show their backlink,
            // exactly as if the instruction was absent. This must never change.
            const container = await verifyRenderedHtml(
                allTasks(),
                showTree + sortByLineNumber + 'show nested backlink',
            );

            const fullBacklinkText =
                '(inheritance_1parent2children2grandchildren1sibling_start_with_heading > Test heading)';

            expectRenderedTaskBacklinks(container, [
                { description: '#task parent task', nestingLevel: 0, backlinkText: fullBacklinkText },
                { description: '#task child task 1', nestingLevel: 1, backlinkText: fullBacklinkText },
                { description: '#task grandchild 1', nestingLevel: 2, backlinkText: fullBacklinkText },
                { description: '#task child task 2', nestingLevel: 1, backlinkText: fullBacklinkText },
                { description: '#task grandchild 2', nestingLevel: 2, backlinkText: fullBacklinkText },
                { description: '#task sibling', nestingLevel: 0, backlinkText: fullBacklinkText },
            ]);
        });

        it('hide tree and hide nested backlink - flat is a no-op', async () => {
            // Without 'show tree' there are no nested tasks, so 'hide nested backlink'
            // changes nothing: all tasks keep their full backlink. This must never change.
            const container = await verifyRenderedHtml(
                allTasks(),
                hideTree + sortByLineNumber + 'hide nested backlink',
            );

            const filenameAndHeadingAsBacklink =
                '(inheritance_1parent2children2grandchildren1sibling_start_with_heading > Test heading)';
            expect(renderedTaskBacklinks(container)).toEqual([
                {
                    description: '#task parent task',
                    nestingLevel: 0,
                    backlinkText: filenameAndHeadingAsBacklink,
                },
                {
                    description: '#task child task 1',
                    nestingLevel: 0,
                    backlinkText: filenameAndHeadingAsBacklink,
                },
                {
                    description: '#task grandchild 1',
                    nestingLevel: 0,
                    backlinkText: filenameAndHeadingAsBacklink,
                },
                {
                    description: '#task child task 2',
                    nestingLevel: 0,
                    backlinkText: filenameAndHeadingAsBacklink,
                },
                {
                    description: '#task grandchild 2',
                    nestingLevel: 0,
                    backlinkText: filenameAndHeadingAsBacklink,
                },
                {
                    description: '#task sibling',
                    nestingLevel: 0,
                    backlinkText: filenameAndHeadingAsBacklink,
                },
            ]);
        });

        it('show tree, hide backlink and show nested backlink - hide backlink is stronger', async () => {
            // 'hide backlink' hides all backlinks, and 'show nested backlink' (the default)
            // cannot re-show them: 'show tree + hide backlink' queries written before
            // 'nested backlink' existed must keep hiding all backlinks. This must never change.
            await verifyRenderedHtml(allTasks(), showTree + sortByLineNumber + 'hide backlink\nshow nested backlink');
        });

        it('show tree, hide backlink and hide nested backlink', async () => {
            // Both instructions hide backlinks, so no backlinks are shown anywhere.
            // This must never change.
            await verifyRenderedHtml(allTasks(), showTree + sortByLineNumber + 'hide backlink\nhide nested backlink');
        });

        it('show tree, short mode and hide nested backlink', async () => {
            // Top-level tasks keep their short-mode 🔗 backlink,
            // and nested tasks have their backlink hidden.
            await verifyRenderedHtml(allTasks(), showTree + sortByLineNumber + 'short mode\nhide nested backlink');
        });

        it('should hide backlinks on nested tasks with "hide nested backlink"', async () => {
            const source = showTree + sortByLineNumber + 'hide nested backlink';
            const { renderer, query } = makeHtmlRenderer(source, createTestTasksFile('query.md'), allTasks());
            const container = await renderTasks(State.Warm, renderer, allTasks(), query);

            const backlinkOf = (li: Element) => li.querySelector(':scope > .task-extras > .tasks-backlink');
            const listItems = Array.from(container.querySelectorAll('li'));
            const topLevelItems = listItems.filter((li) => li.parentElement?.closest('li') === null);
            const nestedItems = listItems.filter((li) => !topLevelItems.includes(li));

            // Top-level tasks (parent and sibling) keep their backlink:
            expect(topLevelItems).toHaveLength(2);
            topLevelItems.forEach((li) => expect(backlinkOf(li)).not.toBeNull());

            // Nested tasks (children and grandchildren) have their backlink hidden:
            expect(nestedItems).toHaveLength(4);
            nestedItems.forEach((li) => expect(backlinkOf(li)).toBeNull());
        });
    });

    it('should render grandchildren once under the parent', async () => {
        const allTasks = readTasksFromSimulatedFile('inheritance_1parent2children2grandchildren1sibling');
        await verifyRenderedHtml(
            allTasks,
            `
show tree
sort by function task.lineNumber
(description includes grandchild) OR (description includes parent)
        `,
        );
    });

    it('should render grandchildren once and on the same level as parent', async () => {
        const allTasks = readTasksFromSimulatedFile('inheritance_1parent2children2grandchildren1sibling');
        await verifyRenderedHtml(
            allTasks,
            `
show tree
sort by function reverse task.lineNumber
(description includes grandchild) OR (description includes parent)
        `,
        );
    });
});

describe('Reusing HtmlQueryResultsRenderer', () => {
    const tasksFile = createTestTasksFile('anywhere.md');

    it('should render the same thing twice - tree', async () => {
        const allTasks = readTasksFromSimulatedFile(
            'inheritance_1parent2children2grandchildren1sibling_start_with_heading',
        );
        const source = 'show tree';
        const { renderer, query } = makeHtmlRenderer(source, tasksFile, allTasks);

        const container = await renderTasks(State.Warm, renderer, allTasks, query);
        verifyRenderedTasks(container, allTasks);

        const rerenderedContainer = await renderTasks(State.Warm, renderer, allTasks, query);
        verifyRenderedTasks(rerenderedContainer, allTasks);
    });

    it('should render the same thing twice - flat', async () => {
        const allTasks = readTasksFromSimulatedFile(
            'inheritance_1parent2children2grandchildren1sibling_start_with_heading',
        );
        const source = 'hide tree';
        const { renderer, query } = makeHtmlRenderer(source, tasksFile, allTasks);

        const container = await renderTasks(State.Warm, renderer, allTasks, query);
        verifyRenderedTasks(container, allTasks);

        const rerenderedContainer = await renderTasks(State.Warm, renderer, allTasks, query);
        verifyRenderedTasks(rerenderedContainer, allTasks);
    });
});

describe('HtmlQueryResultsRenderer - task count location setting', () => {
    const tasksFile = createTestTasksFile('query.md');
    const source = 'hide toolbar\nhide backlinks\nhide edit button';
    const allTasks = readTasksFromSimulatedFile('inheritance_1parent1child');

    async function renderAndGetTaskCount(source: string, tasksFile: TasksFile, allTasks: Task[]) {
        const { query, renderer } = makeHtmlRenderer(source, tasksFile, allTasks);
        const container = await renderTasks(State.Warm, renderer, allTasks, query);

        const taskCount = container.querySelector('.task-count');
        const taskList = container.querySelector('.plugin-tasks-query-result');
        const children = Array.from(container.children);
        const taskListIndex = children.indexOf(taskList as Element);
        const taskCountIndex = children.indexOf(taskCount as Element);
        return { taskListIndex, taskCountIndex };
    }

    it('should render task count at bottom by default', async () => {
        const { taskListIndex, taskCountIndex } = await renderAndGetTaskCount(source, tasksFile, allTasks);

        expect(taskCountIndex).toBeGreaterThan(taskListIndex);
    });

    it('should render task count at top when setting is top', async () => {
        updateSettings({ searchResults: { taskCountLocation: 'top' } });

        const { taskListIndex, taskCountIndex } = await renderAndGetTaskCount(source, tasksFile, allTasks);

        expect(taskCountIndex).toBeLessThan(taskListIndex);
    });

    it('should render task count at bottom when setting is bottom', async () => {
        updateSettings({ searchResults: { taskCountLocation: 'bottom' } });

        const { taskListIndex, taskCountIndex } = await renderAndGetTaskCount(source, tasksFile, allTasks);

        expect(taskCountIndex).toBeGreaterThan(taskListIndex);
    });
});

describe('HtmlQueryResultsRenderer - internal heading links', () => {
    let tasksByHeading: Record<string, Task>;

    beforeAll(() => {
        const allTasks = readTasksFromSimulatedFile('internal_heading_links');

        tasksByHeading = allTasks.reduce((acc, task) => {
            const heading = task.taskLocation.precedingHeader ?? '';

            // For now, the test design only supports one task per heading, so make it an error
            // if there are multiple tasks in this heading:
            if (acc[heading]) {
                throw new Error(`Multiple tasks found under the heading: "${heading}".
The test design only supports one task per heading currently, so this is an error.

Edit "${task.path}" to move one of these lines to a separate heading:
"${acc[heading].originalMarkdown}"
"${task.originalMarkdown}"

And then rerun the command "Templater: Insert _meta/templates/convert_test_data_markdown_to_js.md".

For more info: https://publish.obsidian.md/tasks-contributing/Testing/Using+Obsidian+API+in+tests
`);
            }

            acc[heading] = task;
            return acc;
        }, {} as Record<string, Task>);
    });

    async function renderTask(task: Task, queryFilePath: string = 'query.md') {
        const allTasks = [task];
        const { renderer, query } = makeHtmlRenderer('', createTestTasksFile(queryFilePath), allTasks);
        const container = document.createElement('div');

        renderer.content = container;
        await renderer.renderQuery(State.Warm, query.applyQueryToTasks(allTasks));

        return container.querySelector('.task-description')?.innerHTML ?? '';
    }

    it('should not modify description when rendering in same file', async () => {
        const description = await renderTask(
            tasksByHeading['Basic Internal Links'],
            'Test Data/internal_heading_links.md',
        );
        expect(description).toMatchInlineSnapshot('"<span>#task Task with<br>[[#Basic Internal Links]]</span>"');
    });

    it('should convert internal heading links when rendering in different file', async () => {
        const description = await renderTask(tasksByHeading['Basic Internal Links'], 'query.md');
        expect(description).toMatchInlineSnapshot(
            '"<span>#task Task with<br>[[Test Data/internal_heading_links.md#Basic Internal Links|Basic Internal Links]]</span>"',
        );
    });

    it('should handle multiple internal heading links in one description', async () => {
        const description = await renderTask(tasksByHeading['Multiple Links In One Task'], 'query.md');
        expect(description).toMatchInlineSnapshot(
            '"<span>#task Task with<br>[[Test Data/internal_heading_links.md#Multiple Links In One Task|Multiple Links In One Task]] and<br>[[Test Data/internal_heading_links.md#Simple Headers|Simple Headers]]</span>"',
        );
    });

    it('should not modify regular file links', async () => {
        const description = await renderTask(tasksByHeading['External File Links'], 'query.md');
        expect(description).toMatchInlineSnapshot('"<span>#task Task with<br>[[Other File]]</span>"');
    });

    it('should handle header links with mixed link types', async () => {
        const description = await renderTask(tasksByHeading['Mixed Link Types'], 'query.md');
        expect(description).toMatchInlineSnapshot(
            '"<span>#task Task with<br>[[Other File]] and<br>[[Test Data/internal_heading_links.md#Mixed Link Types|Mixed Link Types]]</span>"',
        );
    });

    it('should handle header links with file references', async () => {
        const description = await renderTask(tasksByHeading['Header Links With File Reference'], 'query.md');
        expect(description).toMatchInlineSnapshot(
            '"<span>#task<br>[[Test Data/internal_heading_links.md#Header Links With File Reference|Header Links With File Reference]] then<br>[[Other File#Some Header]] and<br>[[Test Data/internal_heading_links.md#Another Header|Another Header]]</span>"',
        );
    });

    it('should handle header links with special characters', async () => {
        const description = await renderTask(tasksByHeading['Headers-With_Special Characters'], 'query.md');
        expect(description).toMatchInlineSnapshot(
            '"<span>#task Task with<br>[[Test Data/internal_heading_links.md#Headers-With_Special Characters|Headers-With_Special Characters]]</span>"',
        );
    });

    it('should handle links with aliases', async () => {
        const description = await renderTask(tasksByHeading['Aliased Links'], 'query.md');
        expect(description).toMatchInlineSnapshot(
            '"<span>#task Task with<br>[[Test Data/internal_heading_links.md#Aliased Links|I am an alias]]</span>"',
        );
    });

    it('should not modify formatted text that looks like links in code blocks', async () => {
        const description = await renderTask(tasksByHeading['Links In Code Blocks'], 'query.md');
        expect(description).toMatchInlineSnapshot(
            '"<span>#task Task with `[[#Links In Code Blocks]]` code block</span>"',
        );
    });

    it('should not modify escaped links', async () => {
        const description = await renderTask(tasksByHeading['Escaped Links'], 'query.md');
        expect(description).toMatchInlineSnapshot(
            '"<span>#task Task with \\[\\[#Escaped Links\\]\\] escaped link</span>"',
        );
    });
});
