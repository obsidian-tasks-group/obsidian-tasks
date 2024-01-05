/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { DebugSettings } from '../src/Config/DebugSettings';
import { GlobalFilter } from '../src/Config/GlobalFilter';
import { resetSettings, updateSettings } from '../src/Config/Settings';
import { DateParser } from '../src/Query/DateParser';
import { QueryLayoutOptions } from '../src/QueryLayoutOptions';
import type { Task } from '../src/Task';
import { TaskRegularExpressions } from '../src/Task';
import { TaskLayoutOptions } from '../src/TaskLayout';
import type { TextRenderer } from '../src/TaskLineRenderer';
import { TaskLineRenderer } from '../src/TaskLineRenderer';
import { fromLine } from './TestHelpers';
import { verifyWithFileExtension } from './TestingTools/ApprovalTestHelpers';
import { TaskBuilder } from './TestingTools/TaskBuilder';

jest.mock('obsidian');
window.moment = moment;

/**
 * Renders a task for test purposes and returns the rendered ListItem.
 *
 * @param task to be rendered
 *
 * @param layoutOptions for the task rendering. Skip for default options. See {@link TaskLayoutOptions}.
 *
 * @param testRenderer imitates Obsidian rendering. Skip for the default {@link mockTextRenderer}.
 *
 * @param queryLayoutOptions for the task rendering. Skip for default options. See {@link QueryLayoutOptions}.
 */
async function renderListItem(
    task: Task,
    layoutOptions?: TaskLayoutOptions,
    queryLayoutOptions?: QueryLayoutOptions,
    testRenderer?: TextRenderer,
) {
    const taskLineRenderer = new TaskLineRenderer({
        textRenderer: testRenderer ?? mockTextRenderer,
        obsidianComponent: null,
        parentUlElement: document.createElement('div'),
        taskLayoutOptions: layoutOptions ?? new TaskLayoutOptions(),
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
    const testLayoutOptions = async (expectedComponents: string[], layoutOptions: Partial<TaskLayoutOptions>) => {
        const task = TaskBuilder.createFullyPopulatedTask();
        const fullLayoutOptions = { ...new TaskLayoutOptions(), ...layoutOptions };
        const listItem = await renderListItem(task, fullLayoutOptions);
        const renderedComponents = getListItemComponents(listItem);
        expect(renderedComponents).toEqual(expectedComponents);
    };

    it('renders correctly with the default layout options', async () => {
        await testLayoutOptions(
            [
                'Do exercises #todo #health',
                ' 🔼',
                ' 🔁 every day when done',
                ' ➕ 2023-07-01',
                ' 🛫 2023-07-02',
                ' ⏳ 2023-07-03',
                ' 📅 2023-07-04',
                ' ❌ 2023-07-06',
                ' ✅ 2023-07-05',
                ' ⛔️ 123456,abc123',
                ' 🆔 abcdef',
                ' ^dcf64c',
            ],
            {},
        );
    });

    it('renders without priority', async () => {
        await testLayoutOptions(
            [
                'Do exercises #todo #health',
                ' 🔁 every day when done',
                ' ➕ 2023-07-01',
                ' 🛫 2023-07-02',
                ' ⏳ 2023-07-03',
                ' 📅 2023-07-04',
                ' ❌ 2023-07-06',
                ' ✅ 2023-07-05',
                ' ⛔️ 123456,abc123',
                ' 🆔 abcdef',
                ' ^dcf64c',
            ],
            { hidePriority: true },
        );
    });

    it('renders without recurrence rule', async () => {
        await testLayoutOptions(
            [
                'Do exercises #todo #health',
                ' 🔼',
                ' ➕ 2023-07-01',
                ' 🛫 2023-07-02',
                ' ⏳ 2023-07-03',
                ' 📅 2023-07-04',
                ' ❌ 2023-07-06',
                ' ✅ 2023-07-05',
                ' ⛔️ 123456,abc123',
                ' 🆔 abcdef',
                ' ^dcf64c',
            ],
            { hideRecurrenceRule: true },
        );
    });

    it('renders without created date', async () => {
        await testLayoutOptions(
            [
                'Do exercises #todo #health',
                ' 🔼',
                ' 🔁 every day when done',
                ' 🛫 2023-07-02',
                ' ⏳ 2023-07-03',
                ' 📅 2023-07-04',
                ' ❌ 2023-07-06',
                ' ✅ 2023-07-05',
                ' ⛔️ 123456,abc123',
                ' 🆔 abcdef',
                ' ^dcf64c',
            ],
            { hideCreatedDate: true },
        );
    });

    it('renders without start date', async () => {
        await testLayoutOptions(
            [
                'Do exercises #todo #health',
                ' 🔼',
                ' 🔁 every day when done',
                ' ➕ 2023-07-01',
                ' ⏳ 2023-07-03',
                ' 📅 2023-07-04',
                ' ❌ 2023-07-06',
                ' ✅ 2023-07-05',
                ' ⛔️ 123456,abc123',
                ' 🆔 abcdef',
                ' ^dcf64c',
            ],
            { hideStartDate: true },
        );
    });

    it('renders without scheduled date', async () => {
        await testLayoutOptions(
            [
                'Do exercises #todo #health',
                ' 🔼',
                ' 🔁 every day when done',
                ' ➕ 2023-07-01',
                ' 🛫 2023-07-02',
                ' 📅 2023-07-04',
                ' ❌ 2023-07-06',
                ' ✅ 2023-07-05',
                ' ⛔️ 123456,abc123',
                ' 🆔 abcdef',
                ' ^dcf64c',
            ],
            { hideScheduledDate: true },
        );
    });

    it('renders without due date', async () => {
        await testLayoutOptions(
            [
                'Do exercises #todo #health',
                ' 🔼',
                ' 🔁 every day when done',
                ' ➕ 2023-07-01',
                ' 🛫 2023-07-02',
                ' ⏳ 2023-07-03',
                ' ❌ 2023-07-06',
                ' ✅ 2023-07-05',
                ' ⛔️ 123456,abc123',
                ' 🆔 abcdef',
                ' ^dcf64c',
            ],
            { hideDueDate: true },
        );
    });

    it('renders a done task correctly with the default layout', async () => {
        await testLayoutOptions(
            [
                'Do exercises #todo #health',
                ' 🔼',
                ' 🔁 every day when done',
                ' ➕ 2023-07-01',
                ' 🛫 2023-07-02',
                ' ⏳ 2023-07-03',
                ' 📅 2023-07-04',
                ' ❌ 2023-07-06',
                ' ✅ 2023-07-05',
                ' ⛔️ 123456,abc123',
                ' 🆔 abcdef',
                ' ^dcf64c',
            ],
            {},
        );
    });

    it('renders without done date', async () => {
        await testLayoutOptions(
            [
                'Do exercises #todo #health',
                ' 🔼',
                ' 🔁 every day when done',
                ' ➕ 2023-07-01',
                ' 🛫 2023-07-02',
                ' ⏳ 2023-07-03',
                ' 📅 2023-07-04',
                ' ❌ 2023-07-06',
                ' ⛔️ 123456,abc123',
                ' 🆔 abcdef',
                ' ^dcf64c',
            ],
            { hideDoneDate: true },
        );
    });

    it('renders without cancelled date', async () => {
        await testLayoutOptions(
            [
                'Do exercises #todo #health',
                ' 🔼',
                ' 🔁 every day when done',
                ' ➕ 2023-07-01',
                ' 🛫 2023-07-02',
                ' ⏳ 2023-07-03',
                ' 📅 2023-07-04',
                ' ✅ 2023-07-05',
                ' ⛔️ 123456,abc123',
                ' 🆔 abcdef',
                ' ^dcf64c',
            ],
            { hideCancelledDate: true },
        );
    });

    it('renders without id', async () => {
        await testLayoutOptions(
            [
                'Do exercises #todo #health',
                ' 🔼',
                ' 🔁 every day when done',
                ' ➕ 2023-07-01',
                ' 🛫 2023-07-02',
                ' ⏳ 2023-07-03',
                ' 📅 2023-07-04',
                ' ❌ 2023-07-06',
                ' ✅ 2023-07-05',
                ' ⛔️ 123456,abc123',
                ' ^dcf64c',
            ],
            { hideId: true },
        );
    });

    it('renders without depends on', async () => {
        await testLayoutOptions(
            [
                'Do exercises #todo #health',
                ' 🔼',
                ' 🔁 every day when done',
                ' ➕ 2023-07-01',
                ' 🛫 2023-07-02',
                ' ⏳ 2023-07-03',
                ' 📅 2023-07-04',
                ' ❌ 2023-07-06',
                ' ✅ 2023-07-05',
                ' 🆔 abcdef',
                ' ^dcf64c',
            ],
            { hideBlockedBy: true },
        );
    });

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
    const testComponentClasses = async (
        taskLine: string,
        layoutOptions: Partial<TaskLayoutOptions>,
        mainClass: string,
        attributes: string,
    ) => {
        const task = fromLine({
            line: taskLine,
        });
        const fullLayoutOptions = { ...new TaskLayoutOptions(), ...layoutOptions };
        const listItem = await renderListItem(task, fullLayoutOptions);

        expect(listItem).toHaveAChildSpanWithClassAndDataAttributes(mainClass, attributes);
    };

    it('should render priority component with its class and data attribute', async () => {
        await testComponentClasses(
            '- [ ] Full task ⏫ ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            {},
            'task-priority',
            'taskPriority: high',
        );
        await testComponentClasses(
            '- [ ] Full task 🔼 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            {},
            'task-priority',
            'taskPriority: medium',
        );
        await testComponentClasses(
            '- [ ] Full task 🔽 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            {},
            'task-priority',
            'taskPriority: low',
        );
    });

    it('renders dependency fields with their correct classes', async () => {
        await testComponentClasses('- [ ] Minimal task 🆔 g7317o', {}, 'task-id', '');
        await testComponentClasses('- [ ] Minimal task ⛔️ ya44g5,hry475', {}, 'task-blockedBy', '');
    });

    it('should render recurrence component with its class and data attribute', async () => {
        await testComponentClasses(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            {},
            'task-recurring',
            '',
        );
    });

    it('should render date component with its class and data attribute with "today" value', async () => {
        const today = DateParser.parseDate('today').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ ➕ ${today}`, {}, 'task-created', 'taskCreated: today');
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${today}`, {}, 'task-due', 'taskDue: today');
        await testComponentClasses(`- [ ] Full task ⏫ ⏳ ${today}`, {}, 'task-scheduled', 'taskScheduled: today');
        await testComponentClasses(`- [ ] Full task ⏫ 🛫 ${today}`, {}, 'task-start', 'taskStart: today');
        await testComponentClasses(`- [x] Done task ✅ ${today}`, {}, 'task-done', 'taskDone: today');
        await testComponentClasses(`- [-] Canc task ❌ ${today}`, {}, 'task-cancelled', 'taskCancelled: today');
    });

    it('should render date component with its class and data attribute with "future-1d" value', async () => {
        const future = DateParser.parseDate('tomorrow').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ ➕ ${future}`, {}, 'task-created', 'taskCreated: future-1d');
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${future}`, {}, 'task-due', 'taskDue: future-1d');
        await testComponentClasses(`- [ ] Full task ⏫ ⏳ ${future}`, {}, 'task-scheduled', 'taskScheduled: future-1d');
        await testComponentClasses(`- [ ] Full task ⏫ 🛫 ${future}`, {}, 'task-start', 'taskStart: future-1d');
        await testComponentClasses(`- [x] Done task ✅ ${future}`, {}, 'task-done', 'taskDone: future-1d');
        await testComponentClasses(`- [-] Canc task ❌ ${future}`, {}, 'task-cancelled', 'taskCancelled: future-1d');
    });

    it('should render date component with its class and data attribute with "future-7d" value', async () => {
        const future = DateParser.parseDate('in 7 days').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ ➕ ${future}`, {}, 'task-created', 'taskCreated: future-7d');
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${future}`, {}, 'task-due', 'taskDue: future-7d');
        await testComponentClasses(`- [ ] Full task ⏫ ⏳ ${future}`, {}, 'task-scheduled', 'taskScheduled: future-7d');
        await testComponentClasses(`- [ ] Full task ⏫ 🛫 ${future}`, {}, 'task-start', 'taskStart: future-7d');
        await testComponentClasses(`- [x] Done task ✅ ${future}`, {}, 'task-done', 'taskDone: future-7d');
        await testComponentClasses(`- [-] Canc task ❌ ${future}`, {}, 'task-cancelled', 'taskCancelled: future-7d');
    });

    it('should render date component with its class and data attribute with "past-1d" value', async () => {
        const past = DateParser.parseDate('yesterday').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ ➕ ${past}`, {}, 'task-created', 'taskCreated: past-1d');
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${past}`, {}, 'task-due', 'taskDue: past-1d');
        await testComponentClasses(`- [ ] Full task ⏫ ⏳ ${past}`, {}, 'task-scheduled', 'taskScheduled: past-1d');
        await testComponentClasses(`- [ ] Full task ⏫ 🛫 ${past}`, {}, 'task-start', 'taskStart: past-1d');
        await testComponentClasses(`- [x] Done task ✅ ${past}`, {}, 'task-done', 'taskDone: past-1d');
        await testComponentClasses(`- [-] Canc task ❌ ${past}`, {}, 'task-cancelled', 'taskCancelled: past-1d');
    });

    it('should render date component with its class and data attribute with "past-7d" value', async () => {
        const past = DateParser.parseDate('7 days ago').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ ➕ ${past}`, {}, 'task-created', 'taskCreated: past-7d');
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${past}`, {}, 'task-due', 'taskDue: past-7d');
        await testComponentClasses(`- [ ] Full task ⏫ ⏳ ${past}`, {}, 'task-scheduled', 'taskScheduled: past-7d');
        await testComponentClasses(`- [ ] Full task ⏫ 🛫 ${past}`, {}, 'task-start', 'taskStart: past-7d');
        await testComponentClasses(`- [x] Done task ✅ ${past}`, {}, 'task-done', 'taskDone: past-7d');
        await testComponentClasses(`- [-] Canc task ❌ ${past}`, {}, 'task-cancelled', 'taskCancelled: past-7d');
    });

    it('should render date component with its class and data attribute with "future-far" & "past-far" values', async () => {
        const future = DateParser.parseDate('in 8 days').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ ➕ ${future}`, {}, 'task-created', 'taskCreated: future-far');
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${future}`, {}, 'task-due', 'taskDue: future-far');
        await testComponentClasses(
            `- [ ] Full task ⏫ ⏳ ${future}`,
            {},
            'task-scheduled',
            'taskScheduled: future-far',
        );
        await testComponentClasses(`- [ ] Full task ⏫ 🛫 ${future}`, {}, 'task-start', 'taskStart: future-far');
        await testComponentClasses(`- [x] Done task ✅ ${future}`, {}, 'task-done', 'taskDone: future-far');
        await testComponentClasses(`- [-] Canc task ❌ ${future}`, {}, 'task-cancelled', 'taskCancelled: future-far');

        const past = DateParser.parseDate('8 days ago').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ ➕ ${past}`, {}, 'task-created', 'taskCreated: past-far');
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${past}`, {}, 'task-due', 'taskDue: past-far');
        await testComponentClasses(`- [ ] Full task ⏫ ⏳ ${past}`, {}, 'task-scheduled', 'taskScheduled: past-far');
        await testComponentClasses(`- [ ] Full task ⏫ 🛫 ${past}`, {}, 'task-start', 'taskStart: past-far');
        await testComponentClasses(`- [x] Done task ✅ ${past}`, {}, 'task-done', 'taskDone: past-far');
        await testComponentClasses(`- [-] Canc task ❌ ${past}`, {}, 'task-cancelled', 'taskCancelled: past-far');
    });

    it('should not add data attributes for invalid dates', async () => {
        await testComponentClasses('- [ ] task with invalid due date 📅 2023-02-29', {}, 'task-due', '');
    });

    it.each([
        ['task-priority', 'taskPriority: medium', { hidePriority: true }],
        ['task-createdDate', 'taskCreated: past-far', { hideCreatedDate: true }],
        ['task-dueDate', 'taskDue: past-far', { hideDueDate: true }],
        ['task-scheduledDate', 'taskScheduled: past-far', { hideScheduledDate: true }],
        ['task-startDate', 'taskStart: past-far', { hideStartDate: true }],
        ['task-doneDate', 'taskDone: past-far', { hideDoneDate: true }],
        ['task-cancelledDate', 'taskCancelled: past-far', { hideCancelledDate: true }],
    ])(
        'should not render "%s" class but should set "%s" data attributes to the list item',
        async (
            expectedAbsentClass: string,
            expectedDateAttributes: string,
            layoutOptions: Partial<TaskLayoutOptions>,
        ) => {
            const task = TaskBuilder.createFullyPopulatedTask();
            const fullLayoutOptions = { ...new TaskLayoutOptions(), ...layoutOptions };
            const listItem = await renderListItem(task, fullLayoutOptions);

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

    const testLiAttributes = async (
        taskLine: string,
        layoutOptions: Partial<TaskLayoutOptions>,
        attributes: string[],
    ) => {
        const task = fromLine({
            line: taskLine,
        });
        const fullLayoutOptions = { ...new TaskLayoutOptions(), ...layoutOptions };
        const listItem = await renderListItem(task, fullLayoutOptions);
        for (const attribute of attributes) {
            expect(listItem).toHaveAmongDataAttributes(attribute);
        }
    };

    it('creates data attributes for custom statuses', async () => {
        await testLiAttributes('- [ ] An incomplete task', {}, [
            'task: ',
            'taskStatusName: Todo',
            'taskStatusType: TODO',
        ]);
        await testLiAttributes('- [x] A complete task', {}, [
            'task: x',
            'taskStatusName: Done',
            'taskStatusType: DONE',
        ]);
        await testLiAttributes('- [/] In-progress task', {}, [
            'task: /',
            'taskStatusName: In Progress',
            'taskStatusType: IN_PROGRESS',
        ]);
        await testLiAttributes('- [-] In-progress task', {}, [
            'task: -',
            'taskStatusName: Cancelled',
            'taskStatusType: CANCELLED',
        ]);
    });

    it('marks nonexistent task priority as "normal" priority', async () => {
        await testLiAttributes('- [ ] Full task 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day', {}, [
            'taskPriority: normal',
        ]);
    });
});

describe('Visualise HTML', () => {
    async function renderAndVerifyHTML(
        task: Task,
        {
            layoutOptions,
            queryLayoutOptions,
        }: { layoutOptions: TaskLayoutOptions; queryLayoutOptions: QueryLayoutOptions },
    ) {
        const listItem = await renderListItem(task, layoutOptions, queryLayoutOptions, mockHTMLRenderer);

        const taskAsMarkdown = `<!--
${task.toFileLineString()}
-->\n\n`;
        const taskAsHTML = listItem.outerHTML.replace(/ data-/g, '\n    data-').replace(/<span/g, '\n        <span');

        verifyWithFileExtension(taskAsMarkdown + taskAsHTML, 'html');
    }

    const fullTask = TaskBuilder.createFullyPopulatedTask();
    const minimalTask = fromLine({ line: '- [-] empty' });

    function layoutOptionsFullMode() {
        const layoutOptions = new TaskLayoutOptions();

        // Show every Task field, disable short mode, do not explain the query
        // Also note that urgency, backlinks and edit button are rendered in QueryRender.createTaskList(),
        // so they won't be visible in this test it is using TaskLineRenderer.renderTaskLine().
        // See also comments in TaskLayout.applyOptions().
        Object.keys(layoutOptions).forEach((key) => {
            const key2 = key as keyof TaskLayoutOptions;
            layoutOptions[key2] = false;
        });

        return { layoutOptions, queryLayoutOptions: new QueryLayoutOptions() };
    }

    function layoutOptionsShortMode() {
        const queryLayoutOptions = new QueryLayoutOptions();
        queryLayoutOptions.shortMode = true;

        return { layoutOptions: new TaskLayoutOptions(), queryLayoutOptions };
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
