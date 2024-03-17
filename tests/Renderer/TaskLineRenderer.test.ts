/**
 * @jest-environment jsdom
 */
import moment from 'moment';

import { DebugSettings } from '../../src/Config/DebugSettings';
import { GlobalFilter } from '../../src/Config/GlobalFilter';
import { resetSettings, updateSettings } from '../../src/Config/Settings';
import { QueryLayoutOptions } from '../../src/Layout/QueryLayoutOptions';
import { TaskLayoutComponent, TaskLayoutOptions, taskLayoutComponents } from '../../src/Layout/TaskLayoutOptions';
import { DateParser } from '../../src/Query/DateParser';
import type { TextRenderer } from '../../src/Renderer/TaskLineRenderer';
import { TaskLineRenderer } from '../../src/Renderer/TaskLineRenderer';
import type { Task } from '../../src/Task/Task';
import { TaskRegularExpressions } from '../../src/Task/TaskRegularExpressions';
import { verifyWithFileExtension } from '../TestingTools/ApprovalTestHelpers';
import { prettifyHTML } from '../TestingTools/HTMLHelpers';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { fromLine } from '../TestingTools/TestHelpers';

jest.mock('obsidian');
window.moment = moment;

/**
 * Renders a task for test purposes and returns the rendered ListItem.
 *
 * @param task to be rendered
 *
 * @param taskLayoutOptions for the task rendering. Skip for default options. See {@link TaskLayoutOptions}.
 *
 * @param testRenderer imitates Obsidian rendering. Skip for the default {@link mockTextRenderer}.
 *
 * @param queryLayoutOptions for the task rendering. Skip for default options. See {@link QueryLayoutOptions}.
 */
async function renderListItem(
    task: Task,
    taskLayoutOptions?: TaskLayoutOptions,
    queryLayoutOptions?: QueryLayoutOptions,
    testRenderer?: TextRenderer,
) {
    const taskLineRenderer = new TaskLineRenderer({
        textRenderer: testRenderer ?? mockTextRenderer,
        obsidianComponent: null,
        parentUlElement: document.createElement('div'),
        taskLayoutOptions: taskLayoutOptions ?? new TaskLayoutOptions(),
        queryLayoutOptions: queryLayoutOptions ?? new QueryLayoutOptions(),
    });
    return await taskLineRenderer.renderTaskLine(task, 0);
}

const mockTextRenderer = async (text: string, element: HTMLSpanElement, _path: string) => {
    element.innerText = text;
};

const mockHTMLRenderer = async (text: string, element: HTMLSpanElement, _path: string) => {
    // Contrary to the default mockTextRenderer(),
    // instead of the rendered HTMLSpanElement.innerText,
    // we need the plain HTML here like in TaskLineRenderer.renderComponentText(),
    // to ensure that description and tags are retained.
    element.innerHTML = text;
};

function getTextSpan(listItem: HTMLElement) {
    return listItem.children[1] as HTMLSpanElement;
}

function getDescriptionText(listItem: HTMLElement) {
    const textSpan = getTextSpan(listItem);
    return (textSpan.children[0].children[0] as HTMLElement).innerText;
}

/**
 * Returns an array with the components of a List Item as strings.
 */
function getListItemComponents(listItem: HTMLElement): string[] {
    const components: string[] = [getDescriptionText(listItem)];

    const textSpan = getTextSpan(listItem);
    for (const innerSpan of Array.from(textSpan.children)) {
        if (innerSpan.textContent) {
            components.push(innerSpan.textContent);
        }
    }
    return components;
}

afterEach(() => {
    GlobalFilter.getInstance().reset();
    GlobalFilter.getInstance().setRemoveGlobalFilter(false);
    resetSettings();
});

describe('task line rendering - HTML', () => {
    it('should render only one List Item for the UL and return it with renderTaskLine()', async () => {
        const ulElement = document.createElement('ul');
        const taskLineRenderer = new TaskLineRenderer({
            textRenderer: mockTextRenderer,
            obsidianComponent: null,
            parentUlElement: ulElement,
            taskLayoutOptions: new TaskLayoutOptions(),
            queryLayoutOptions: new QueryLayoutOptions(),
        });
        const listItem = await taskLineRenderer.renderTaskLine(new TaskBuilder().build(), 0);

        // Just one element
        expect(ulElement.children.length).toEqual(1);

        // It is the rendered one
        expect(ulElement.children[0]).toEqual(listItem);

        // And it is a ListItem
        expect(listItem.nodeName).toEqual('LI');
    });

    it('creates the correct span structure for a basic task inside a List Item', async () => {
        const taskLine = '- [ ] This is a simple task';
        const task = fromLine({
            line: taskLine,
        });
        const listItem = await renderListItem(task);

        // Check that it has two children: a checkbox and a text span
        expect(listItem.children.length).toEqual(2);

        const checkbox = listItem.children[0];
        expect(checkbox.nodeName).toEqual('INPUT');
        expect(checkbox.classList.contains('task-list-item-checkbox')).toBeTruthy();

        const textSpan = listItem.children[1];
        expect(textSpan.nodeName).toEqual('SPAN');
        expect(textSpan.classList.contains('tasks-list-text')).toBeTruthy();

        // Check that the text span contains a single description span
        expect(textSpan.children.length).toEqual(1);
        const descriptionSpan = textSpan.children[0];
        expect(descriptionSpan.nodeName).toEqual('SPAN');
        expect(descriptionSpan.className).toEqual('task-description');

        // Check that the description span contains an internal span (see taskToHtml for an explanation why it's there)
        expect(descriptionSpan.children.length).toEqual(1);
        const internalDescriptionSpan = descriptionSpan.children[0];
        expect(internalDescriptionSpan.nodeName).toEqual('SPAN');

        // Check that eventually the correct text was rendered
        expect((internalDescriptionSpan as HTMLSpanElement).innerText).toEqual('This is a simple task');
    });
});

describe('task line rendering - global filter', () => {
    const getDescriptionTest = async (taskLine: string) => {
        const task = fromLine({
            line: taskLine,
        });
        const listItem = await renderListItem(task);
        return getDescriptionText(listItem);
    };

    it('should render Global Filter when the Remove Global Filter is off', async () => {
        GlobalFilter.getInstance().setRemoveGlobalFilter(false);
        GlobalFilter.getInstance().set('#global');

        const taskLine = '- [ ] This is a simple task with a #global filter';
        const descriptionWithFilter = await getDescriptionTest(taskLine);

        expect(descriptionWithFilter).toEqual('This is a simple task with a #global filter');
    });

    it('should not render Global Filter when the Remove Global Filter is on', async () => {
        GlobalFilter.getInstance().setRemoveGlobalFilter(true);
        GlobalFilter.getInstance().set('#global');

        const taskLine = '- [ ] #global/subtag-shall-stay This is a simple task with a #global filter';
        const descriptionWithoutFilter = await getDescriptionTest(taskLine);

        expect(descriptionWithoutFilter).toEqual('#global/subtag-shall-stay This is a simple task with a filter');
    });
});

describe('task line rendering - layout options', () => {
    const testLayoutOptions = async (expectedComponents: string[], shownComponents: TaskLayoutComponent[]) => {
        const task = TaskBuilder.createFullyPopulatedTask();
        const taskLayoutOptions = new TaskLayoutOptions();

        // Hide every layout component:
        taskLayoutComponents.forEach((component) => {
            taskLayoutOptions.hide(component);
        });

        // Re-enable description
        taskLayoutOptions.setVisibility(TaskLayoutComponent.Description, true);

        // Re-enable the requested components:
        shownComponents.forEach((hiddenComponent) => {
            taskLayoutOptions.setVisibility(hiddenComponent, true);
        });

        const listItem = await renderListItem(task, taskLayoutOptions);
        const renderedComponents = getListItemComponents(listItem);
        expect(renderedComponents).toEqual(expectedComponents);
    };

    it('renders correctly with the default layout options', async () => {
        await testLayoutOptions(
            [
                'Do exercises #todo #health',
                ' 🆔 abcdef',
                ' ⛔ 123456,abc123',
                ' 🔼',
                ' 🔁 every day when done',
                ' ➕ 2023-07-01',
                ' 🛫 2023-07-02',
                ' ⏳ 2023-07-03',
                ' 📅 2023-07-04',
                ' ❌ 2023-07-06',
                ' ✅ 2023-07-05',
                ' ^dcf64c',
            ],
            taskLayoutComponents,
        );
    });

    it('renders a done task correctly with the default layout', async () => {
        await testLayoutOptions(
            [
                'Do exercises #todo #health',
                ' 🆔 abcdef',
                ' ⛔ 123456,abc123',
                ' 🔼',
                ' 🔁 every day when done',
                ' ➕ 2023-07-01',
                ' 🛫 2023-07-02',
                ' ⏳ 2023-07-03',
                ' 📅 2023-07-04',
                ' ❌ 2023-07-06',
                ' ✅ 2023-07-05',
                ' ^dcf64c',
            ],
            taskLayoutComponents,
        );
    });

    // NEW_TASK_FIELD_EDIT_REQUIRED

    it('renders with priority', async () => {
        await testLayoutOptions(['Do exercises #todo #health', ' 🔼'], [TaskLayoutComponent.Priority]);
    });

    it('renders with recurrence rule', async () => {
        await testLayoutOptions(
            ['Do exercises #todo #health', ' 🔁 every day when done'],
            [TaskLayoutComponent.RecurrenceRule],
        );
    });

    it('renders with created date', async () => {
        await testLayoutOptions(['Do exercises #todo #health', ' ➕ 2023-07-01'], [TaskLayoutComponent.CreatedDate]);
    });

    it('renders with start date', async () => {
        await testLayoutOptions(['Do exercises #todo #health', ' 🛫 2023-07-02'], [TaskLayoutComponent.StartDate]);
    });

    it('renders with scheduled date', async () => {
        await testLayoutOptions(['Do exercises #todo #health', ' ⏳ 2023-07-03'], [TaskLayoutComponent.ScheduledDate]);
    });

    it('renders with due date', async () => {
        await testLayoutOptions(['Do exercises #todo #health', ' 📅 2023-07-04'], [TaskLayoutComponent.DueDate]);
    });

    it('renders with done date', async () => {
        await testLayoutOptions(['Do exercises #todo #health', ' ✅ 2023-07-05'], [TaskLayoutComponent.DoneDate]);
    });

    it('renders with cancelled date', async () => {
        await testLayoutOptions(['Do exercises #todo #health', ' ❌ 2023-07-06'], [TaskLayoutComponent.CancelledDate]);
    });

    it('renders with id', async () => {
        await testLayoutOptions(['Do exercises #todo #health', ' 🆔 abcdef'], [TaskLayoutComponent.Id]);
    });

    it('renders with depends on', async () => {
        await testLayoutOptions(['Do exercises #todo #health', ' ⛔ 123456,abc123'], [TaskLayoutComponent.DependsOn]);
    });
});

describe('task line rendering - errors in task fields', () => {
    const testLayoutOptionsFromLine = async (taskLine: string, expectedComponents: string[]) => {
        const task = fromLine({
            line: taskLine,
        });
        const listItem = await renderListItem(task);
        const renderedComponents = getListItemComponents(listItem);
        expect(renderedComponents).toEqual(expectedComponents);
    };

    it('writes a placeholder message if a date is invalid', async () => {
        await testLayoutOptionsFromLine('- [ ] Task with invalid due date 📅 2023-13-02', [
            'Task with invalid due date',
            ' 📅 Invalid date',
        ]);
    });

    it('standardise the recurrence rule, even if the rule is invalid', async () => {
        await testLayoutOptionsFromLine('- [ ] Task with invalid recurrence rule 🔁 every month on the 32nd', [
            'Task with invalid recurrence rule',
            ' 🔁 every month on the 32th',
        ]);
    });
});

describe('task line rendering - debug info rendering', () => {
    it('renders debug info if requested', async () => {
        // Disable sort instructions
        updateSettings({ debugSettings: new DebugSettings(false, true) });
        const task = fromLine({
            line: '- [ ] Task with debug info',
            path: 'a/b/c.d',
            precedingHeader: 'Previous Heading',
        });
        const listItem = await renderListItem(task);
        const renderedDescription = getDescriptionText(listItem);
        expect(renderedDescription).toEqual(
            "Task with debug info<br>🐛 <b>0</b> . 0 . 0 . '<code>- [ ] Task with debug info</code>'<br>'<code>a/b/c.d</code>' > '<code>Previous Heading</code>'<br>",
        );
    });
});

describe('task line rendering - classes and data attributes', () => {
    const testComponentClasses = async (taskLine: string, mainClass: string, attributes: string) => {
        const task = fromLine({
            line: taskLine,
        });
        const listItem = await renderListItem(task);

        expect(listItem).toHaveAChildSpanWithClassAndDataAttributes(mainClass, attributes);
    };

    // NEW_TASK_FIELD_EDIT_REQUIRED

    it('should render priority component with its class and data attribute', async () => {
        await testComponentClasses(
            '- [ ] Full task ⏫ ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            'task-priority',
            'taskPriority: high',
        );
        await testComponentClasses(
            '- [ ] Full task 🔼 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            'task-priority',
            'taskPriority: medium',
        );
        await testComponentClasses(
            '- [ ] Full task 🔽 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            'task-priority',
            'taskPriority: low',
        );
    });

    it('renders dependency fields with their correct classes', async () => {
        await testComponentClasses('- [ ] Minimal task 🆔 g7317o', 'task-id', '');
        await testComponentClasses('- [ ] Minimal task ⛔ ya44g5,hry475', 'task-dependsOn', '');
    });

    it('should render recurrence component with its class and data attribute', async () => {
        await testComponentClasses(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            'task-recurring',
            '',
        );
    });

    it('should render date component with its class and data attribute with "today" value', async () => {
        const today = DateParser.parseDate('today').format(TaskRegularExpressions.dateFormat);
        // This test ensures that all date fields are handled correctly.
        await testComponentClasses(`- [ ] Full task ⏫ ➕ ${today}`, 'task-created', 'taskCreated: today');
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${today}`, 'task-due', 'taskDue: today');
        await testComponentClasses(`- [ ] Full task ⏫ ⏳ ${today}`, 'task-scheduled', 'taskScheduled: today');
        await testComponentClasses(`- [ ] Full task ⏫ 🛫 ${today}`, 'task-start', 'taskStart: today');
        await testComponentClasses(`- [x] Done task ✅ ${today}`, 'task-done', 'taskDone: today');
        await testComponentClasses(`- [-] Canc task ❌ ${today}`, 'task-cancelled', 'taskCancelled: today');
    });

    // Now that we know that 'today' is correctly added to all date fields, the remaining tests
    // only need to test a single date field.
    it('should render date component with its class and data attribute with "future-1d" value', async () => {
        const future = DateParser.parseDate('tomorrow').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${future}`, 'task-due', 'taskDue: future-1d');
    });

    it('should render date component with its class and data attribute with "future-7d" value', async () => {
        const future = DateParser.parseDate('in 7 days').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${future}`, 'task-due', 'taskDue: future-7d');
    });

    it('should render date component with its class and data attribute with "past-1d" value', async () => {
        const past = DateParser.parseDate('yesterday').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${past}`, 'task-due', 'taskDue: past-1d');
    });

    it('should render date component with its class and data attribute with "past-7d" value', async () => {
        const past = DateParser.parseDate('7 days ago').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${past}`, 'task-due', 'taskDue: past-7d');
    });

    it('should render date component with its class and data attribute with "future-far"', async () => {
        const future = DateParser.parseDate('in 8 days').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${future}`, 'task-due', 'taskDue: future-far');
    });

    it('should render date component with its class and data attribute with "past-far" values', async () => {
        const past = DateParser.parseDate('8 days ago').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${past}`, 'task-due', 'taskDue: past-far');
    });

    it('should not add data attributes for invalid dates', async () => {
        await testComponentClasses('- [ ] task with invalid due date 📅 2023-02-29', 'task-due', '');
    });

    it.each([
        ['task-priority', 'taskPriority: medium', 'priority'],
        ['task-createdDate', 'taskCreated: past-far', 'createdDate'],
        ['task-dueDate', 'taskDue: past-far', 'dueDate'],
        ['task-scheduledDate', 'taskScheduled: past-far', 'scheduledDate'],
        ['task-startDate', 'taskStart: past-far', 'startDate'],
        ['task-doneDate', 'taskDone: past-far', 'doneDate'],
        ['task-cancelledDate', 'taskCancelled: past-far', 'cancelledDate'],
    ])(
        'should not render "%s" class but should set "%s" data attributes to the list item',
        async (expectedAbsentClass: string, expectedDateAttributes: string, hiddenComponent: string) => {
            const task = TaskBuilder.createFullyPopulatedTask();
            const options = new TaskLayoutOptions();
            options.hide(hiddenComponent as TaskLayoutComponent);
            const listItem = await renderListItem(task, options);

            expect(listItem).not.toHaveAChildSpanWithClass(expectedAbsentClass);
            expect(listItem).toHaveAmongDataAttributes(expectedDateAttributes);
        },
    );

    /*
     * In this test we try to imitate Obsidian's Markdown renderer more thoroughly than other tests,
     * so we can verify that the rendering code adds the correct tag classes inside the rendered
     * Markdown.
     * Note that this test, just like the code that it tests, assumed a specific rendered structure
     * by Obsidian, which is not guaranteed by the API.
     */
    it('adds tag attributes inside the description span', async () => {
        const taskLine = '- [ ] Class with <a class="tag">#someTag</a>';
        const task = fromLine({
            line: taskLine,
        });
        const listItem = await renderListItem(
            task,
            new TaskLayoutOptions(),
            new QueryLayoutOptions(),
            mockHTMLRenderer,
        );

        const textSpan = getTextSpan(listItem);
        const descriptionSpan = textSpan.children[0].children[0] as HTMLElement;
        expect(descriptionSpan.textContent).toEqual('Class with #someTag');
        const tagSpan = descriptionSpan.children[0] as HTMLSpanElement;
        expect(tagSpan.textContent).toEqual('#someTag');
        expect(tagSpan.classList[0]).toEqual('tag');
        expect(tagSpan.dataset.tagName).toEqual('#someTag');
    });

    it('sanitizes tag names when put into data attributes', async () => {
        const taskLine = '- [ ] Class with <a class="tag">#illegal"data&attribute</a>';
        const task = fromLine({
            line: taskLine,
        });
        const listItem = await renderListItem(
            task,
            new TaskLayoutOptions(),
            new QueryLayoutOptions(),
            mockHTMLRenderer,
        );

        const textSpan = getTextSpan(listItem);
        const descriptionSpan = textSpan.children[0].children[0] as HTMLElement;
        expect(descriptionSpan.textContent).toEqual('Class with #illegal"data&attribute');
        const tagSpan = descriptionSpan.children[0] as HTMLSpanElement;
        expect(tagSpan.textContent).toEqual('#illegal"data&attribute');
        expect(tagSpan.classList[0]).toEqual('tag');
        expect(tagSpan.dataset.tagName).toEqual('#illegal-data-attribute');
    });

    const testLiAttributes = async (taskLine: string, attributes: string[]) => {
        const task = fromLine({
            line: taskLine,
        });
        const listItem = await renderListItem(task);
        for (const attribute of attributes) {
            expect(listItem).toHaveAmongDataAttributes(attribute);
        }
    };

    it('creates data attributes for custom statuses', async () => {
        await testLiAttributes('- [ ] An incomplete task', ['task: ', 'taskStatusName: Todo', 'taskStatusType: TODO']);
        await testLiAttributes('- [x] A complete task', ['task: x', 'taskStatusName: Done', 'taskStatusType: DONE']);
        await testLiAttributes('- [/] In-progress task', [
            'task: /',
            'taskStatusName: In Progress',
            'taskStatusType: IN_PROGRESS',
        ]);
        await testLiAttributes('- [-] In-progress task', [
            'task: -',
            'taskStatusName: Cancelled',
            'taskStatusType: CANCELLED',
        ]);
    });

    it('marks nonexistent task priority as "normal" priority', async () => {
        await testLiAttributes('- [ ] Full task 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day', [
            'taskPriority: normal',
        ]);
    });
});

describe('Visualise HTML', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-07-05'));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    async function renderAndVerifyHTML(
        task: Task,
        {
            taskLayoutOptions,
            queryLayoutOptions,
        }: {
            taskLayoutOptions: TaskLayoutOptions;
            queryLayoutOptions: QueryLayoutOptions;
        },
    ) {
        const listItem = await renderListItem(task, taskLayoutOptions, queryLayoutOptions, mockHTMLRenderer);

        const taskAsMarkdown = `<!--
${task.toFileLineString()}
-->\n\n`;
        const prettyHTML = prettifyHTML(listItem.outerHTML);

        verifyWithFileExtension(taskAsMarkdown + prettyHTML, 'html');
    }

    const fullTask = TaskBuilder.createFullyPopulatedTask();
    const minimalTask = fromLine({ line: '- [-] empty' });

    function layoutOptionsFullMode() {
        return {
            taskLayoutOptions: new TaskLayoutOptions(), // makes the assumption that all the field are shown by default
            queryLayoutOptions: new QueryLayoutOptions(),
        };
    }

    function layoutOptionsShortMode() {
        const queryLayoutOptions = new QueryLayoutOptions();
        queryLayoutOptions.shortMode = true;

        return {
            taskLayoutOptions: new TaskLayoutOptions(),
            queryLayoutOptions,
        };
    }

    it('Full task - full mode', async () => {
        await renderAndVerifyHTML(fullTask, layoutOptionsFullMode());
    });

    it('Full task - short mode', async () => {
        await renderAndVerifyHTML(fullTask, layoutOptionsShortMode());
    });

    it('Minimal task - full mode', async () => {
        await renderAndVerifyHTML(minimalTask, layoutOptionsFullMode());
    });

    it('Minimal task - short mode', async () => {
        await renderAndVerifyHTML(minimalTask, layoutOptionsShortMode());
    });
});
