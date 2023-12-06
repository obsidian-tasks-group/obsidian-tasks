/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { DebugSettings } from '../src/Config/DebugSettings';
import { GlobalFilter } from '../src/Config/GlobalFilter';
import { resetSettings, updateSettings } from '../src/Config/Settings';
import { DateParser } from '../src/Query/DateParser';
import type { Task } from '../src/Task';
import { TaskRegularExpressions } from '../src/Task';
import { TaskFieldRenderer } from '../src/TaskFieldRenderer';
import { LayoutOptions } from '../src/TaskLayout';
import type { TextRenderer } from '../src/TaskLineRenderer';
import { TaskLineRenderer } from '../src/TaskLineRenderer';
import { fromLine } from './TestHelpers';
import { verifyWithFileExtension } from './TestingTools/ApprovalTestHelpers';
import { TaskBuilder } from './TestingTools/TaskBuilder';

jest.mock('obsidian');
window.moment = moment;

type AttributesDictionary = { [key: string]: string };

const fieldRenderer = new TaskFieldRenderer();

/**
 * Creates a dummy 'parent element' to host a task render, renders a task inside it,
 * and returns it for inspection.
 */
async function createMockParentAndRender(task: Task, layoutOptions?: LayoutOptions, mockTextRenderer?: TextRenderer) {
    const parentElement = document.createElement('div');
    // Our default text renderer for this method is a simplistic flat text
    if (!mockTextRenderer)
        mockTextRenderer = async (text: string, element: HTMLSpanElement, _path: string) => {
            element.innerText = text;
        };
    const taskLineRenderer = new TaskLineRenderer({
        textRenderer: mockTextRenderer,
        obsidianComponent: null,
        parentUlElement: parentElement,
        layoutOptions: layoutOptions ?? new LayoutOptions(),
    });
    await taskLineRenderer.renderTaskLine(task, 0);
    return parentElement;
}

function getTextSpan(parentElement: HTMLElement) {
    const li = parentElement.children[0];
    return li.children[1] as HTMLSpanElement;
}

function getDescriptionText(parentElement: HTMLElement) {
    const textSpan = getTextSpan(parentElement);
    return (textSpan.children[0].children[0] as HTMLElement).innerText;
}

/*
 * Returns a list of the task components that are not the description, as strings.
 */
function getOtherLayoutComponents(parentElement: HTMLElement): string[] {
    const textSpan = getTextSpan(parentElement);
    const components: string[] = [];
    for (const childSpan of Array.from(textSpan.children)) {
        if (childSpan.classList.contains(fieldRenderer.className('description'))) continue;
        if (childSpan?.textContent) components.push(childSpan.textContent);
    }
    return components;
}

describe('task line rendering', () => {
    afterEach(() => {
        resetSettings();
        GlobalFilter.getInstance().reset();
        GlobalFilter.getInstance().setRemoveGlobalFilter(false);
    });

    it('creates the correct span structure for a basic task', async () => {
        const taskLine = '- [ ] This is a simple task';
        const task = fromLine({
            line: taskLine,
        });
        const parentRender = await createMockParentAndRender(task);

        // Check what we have one child, which is the rendered child
        expect(parentRender.children.length).toEqual(1);
        const li = parentRender.children[0];

        // Check that it's an element of type LI
        expect(li.nodeName).toEqual('LI');

        // Check that it has two children: a checkbox and a text span
        expect(li.children.length).toEqual(2);

        const checkbox = li.children[0];
        expect(checkbox.nodeName).toEqual('INPUT');
        expect(checkbox.classList.contains('task-list-item-checkbox')).toBeTruthy();

        const textSpan = li.children[1];
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

    const getDescriptionTest = async (taskLine: string) => {
        const task = fromLine({
            line: taskLine,
        });
        const parentRender = await createMockParentAndRender(task);
        return getDescriptionText(parentRender);
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

    const testLayoutOptions = async (
        taskLine: string,
        layoutOptions: Partial<LayoutOptions>,
        expectedDescription: string,
        expectedComponents: string[],
    ) => {
        const task = fromLine({
            line: taskLine,
            path: 'a/b/c.d',
            precedingHeader: 'Previous Heading',
        });
        const fullLayoutOptions = { ...new LayoutOptions(), ...layoutOptions };
        const parentRender = await createMockParentAndRender(task, fullLayoutOptions);
        const renderedDescription = getDescriptionText(parentRender);
        const renderedComponents = getOtherLayoutComponents(parentRender);
        expect(renderedDescription).toEqual(expectedDescription);
        expect(renderedComponents).toEqual(expectedComponents);
    };

    it('renders correctly with the default layout options', async () => {
        await testLayoutOptions(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            {},
            'Full task',
            [' ⏫', ' 🔁 every day', ' 🛫 2022-07-04', ' ⏳ 2022-07-03', ' 📅 2022-07-02'],
        );
    });

    it('renders without priority', async () => {
        await testLayoutOptions(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            { hidePriority: true },
            'Full task',
            [' 🔁 every day', ' 🛫 2022-07-04', ' ⏳ 2022-07-03', ' 📅 2022-07-02'],
        );
    });

    it('renders without created date', async () => {
        await testLayoutOptions(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 ➕ 2022-07-05 🔁 every day',
            { hideCreatedDate: true },
            'Full task',
            [' ⏫', ' 🔁 every day', ' 🛫 2022-07-04', ' ⏳ 2022-07-03', ' 📅 2022-07-02'],
        );
    });

    it('renders without start date', async () => {
        await testLayoutOptions(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            { hideStartDate: true },
            'Full task',
            [' ⏫', ' 🔁 every day', ' ⏳ 2022-07-03', ' 📅 2022-07-02'],
        );
    });

    it('renders without scheduled date', async () => {
        await testLayoutOptions(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            { hideScheduledDate: true },
            'Full task',
            [' ⏫', ' 🔁 every day', ' 🛫 2022-07-04', ' 📅 2022-07-02'],
        );
    });

    it('renders without due date', async () => {
        await testLayoutOptions(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            { hideDueDate: true },
            'Full task',
            [' ⏫', ' 🔁 every day', ' 🛫 2022-07-04', ' ⏳ 2022-07-03'],
        );
    });

    it('renders without recurrence rule', async () => {
        await testLayoutOptions(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            { hideRecurrenceRule: true },
            'Full task',
            [' ⏫', ' 🛫 2022-07-04', ' ⏳ 2022-07-03', ' 📅 2022-07-02'],
        );
    });

    it('renders without id', async () => {
        await testLayoutOptions(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🆔 12345',
            { hideId: true },
            'Full task',
            [' ⏫', ' 🛫 2022-07-04', ' ⏳ 2022-07-03', ' 📅 2022-07-02'],
        );
    });

    it('renders without depends on', async () => {
        await testLayoutOptions(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 ⤵️ 12345',
            { hideDependsOn: true },
            'Full task',
            [' ⏫', ' 🛫 2022-07-04', ' ⏳ 2022-07-03', ' 📅 2022-07-02'],
        );
    });

    it('marks nonexistent task priority as "normal" priority', async () => {
        await testLiAttributes(
            '- [ ] Full task 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            {},
            { taskPriority: 'normal' },
        );
    });

    it('renders a done task correctly with the default layout', async () => {
        await testLayoutOptions(
            '- [x] Full task ✅ 2022-07-05 ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 ➕ 2022-07-05 🔁 every day',
            {},
            'Full task',
            [
                ' ⏫',
                ' 🔁 every day',
                ' ➕ 2022-07-05',
                ' 🛫 2022-07-04',
                ' ⏳ 2022-07-03',
                ' 📅 2022-07-02',
                ' ✅ 2022-07-05',
            ],
        );
    });

    it('renders a done task without the done date', async () => {
        await testLayoutOptions(
            '- [x] Full task ✅ 2022-07-05 ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 ➕ 2022-07-05 🔁 every day',
            { hideDoneDate: true },
            'Full task',
            [' ⏫', ' 🔁 every day', ' ➕ 2022-07-05', ' 🛫 2022-07-04', ' ⏳ 2022-07-03', ' 📅 2022-07-02'],
        );
    });

    it('writes a placeholder message if a date is invalid', async () => {
        await testLayoutOptions('- [ ] Task with invalid due date 📅 2023-13-02', {}, 'Task with invalid due date', [
            ' 📅 Invalid date',
        ]);
    });

    it('renders debug info if requested', async () => {
        // Disable sort instructions
        updateSettings({ debugSettings: new DebugSettings(false, true) });
        await testLayoutOptions(
            '- [ ] Task with invalid due date 📅 2023-11-02',
            {},
            "Task with invalid due date<br>🐛 <b>0</b> . 0 . 0 . '<code>- [ ] Task with invalid due date 📅 2023-11-02</code>'<br>'<code>a/b/c.d</code>' > '<code>Previous Heading</code>'<br>",
            [' 📅 2023-11-02'],
        );
    });

    it('standardise the recurrence rule, even if the rule is invalid', async () => {
        await testLayoutOptions(
            '- [ ] Task with invalid recurrence rule 🔁 every month on the 32nd',
            {},
            'Task with invalid recurrence rule',
            [' 🔁 every month on the 32th'],
        );
    });

    const testComponentClasses = async (
        taskLine: string,
        layoutOptions: Partial<LayoutOptions>,
        mainClass: string,
        attributes: AttributesDictionary,
    ) => {
        const task = fromLine({
            line: taskLine,
        });
        const fullLayoutOptions = { ...new LayoutOptions(), ...layoutOptions };
        const parentRender = await createMockParentAndRender(task, fullLayoutOptions);

        const textSpan = getTextSpan(parentRender);
        let found = false;
        for (const childSpan of Array.from(textSpan.children)) {
            if (childSpan.classList.contains(mainClass)) {
                found = true;
                const spanElement = childSpan as HTMLSpanElement;
                // Now verify the attributes
                for (const key in attributes) {
                    expect(spanElement.dataset[key]).toEqual(attributes[key]);
                }
            }
        }
        expect(found).toBeTruthy();
    };

    const testLiAttributes = async (
        taskLine: string,
        layoutOptions: Partial<LayoutOptions>,
        attributes: AttributesDictionary,
    ) => {
        const task = fromLine({
            line: taskLine,
        });
        const fullLayoutOptions = { ...new LayoutOptions(), ...layoutOptions };
        const parentRender = await createMockParentAndRender(task, fullLayoutOptions);
        const li = parentRender.children[0] as HTMLElement;
        for (const key in attributes) {
            expect(li.dataset[key]).toEqual(attributes[key]);
        }
    };

    const testHiddenComponentClasses = async (
        taskLine: string,
        layoutOptions: Partial<LayoutOptions>,
        hiddenGenericClass: string,
        attributes: AttributesDictionary,
    ) => {
        const task = fromLine({
            line: taskLine,
        });
        const fullLayoutOptions = { ...new LayoutOptions(), ...layoutOptions };
        const parentRender = await createMockParentAndRender(task, fullLayoutOptions);

        const textSpan = getTextSpan(parentRender);
        for (const childSpan of Array.from(textSpan.children)) {
            expect(childSpan.classList.contains(hiddenGenericClass)).toBeFalsy();
        }
        const li = parentRender.children[0] as HTMLElement;
        // Now verify the attributes
        for (const key in attributes) {
            expect(li.dataset[key]).toEqual(attributes[key]);
        }
    };

    it('renders priority with its correct classes', async () => {
        await testComponentClasses(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            {},
            fieldRenderer.className('priority'),
            { taskPriority: 'high' },
        );
        await testComponentClasses(
            '- [ ] Full task 🔼 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            {},
            fieldRenderer.className('priority'),
            { taskPriority: 'medium' },
        );
        await testComponentClasses(
            '- [ ] Full task 🔽 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            {},
            fieldRenderer.className('priority'),
            { taskPriority: 'low' },
        );
    });

    it('renders dependency fields with their correct classes', async () => {
        await testComponentClasses('- [ ] Minimal task 🆔 g7317o', {}, LayoutClasses.id, {});
        await testComponentClasses('- [ ] Minimal task ⤵️ ya44g5,hry475', {}, LayoutClasses.dependsOn, {});
    });

    it('renders recurrence with its correct classes', async () => {
        await testComponentClasses(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            {},
            fieldRenderer.className('recurrenceRule'),
            {},
        );
    });

    it('adds a correct "today" CSS class to dates', async () => {
        const today = DateParser.parseDate('today').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ ➕ ${today}`, {}, fieldRenderer.className('createdDate'), {
            taskCreated: 'today',
        });
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${today}`, {}, fieldRenderer.className('dueDate'), {
            taskDue: 'today',
        });
        await testComponentClasses(`- [ ] Full task ⏫ ⏳ ${today}`, {}, fieldRenderer.className('scheduledDate'), {
            taskScheduled: 'today',
        });
        await testComponentClasses(`- [ ] Full task ⏫ 🛫 ${today}`, {}, fieldRenderer.className('startDate'), {
            taskStart: 'today',
        });
        await testComponentClasses(`- [x] Done task ✅ ${today}`, {}, fieldRenderer.className('doneDate'), {
            taskDone: 'today',
        });
    });

    it('adds a correct "future-1d" CSS class to dates', async () => {
        const future = DateParser.parseDate('tomorrow').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ ➕ ${future}`, {}, fieldRenderer.className('createdDate'), {
            taskCreated: 'future-1d',
        });
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${future}`, {}, fieldRenderer.className('dueDate'), {
            taskDue: 'future-1d',
        });
        await testComponentClasses(`- [ ] Full task ⏫ ⏳ ${future}`, {}, fieldRenderer.className('scheduledDate'), {
            taskScheduled: 'future-1d',
        });
        await testComponentClasses(`- [ ] Full task ⏫ 🛫 ${future}`, {}, fieldRenderer.className('startDate'), {
            taskStart: 'future-1d',
        });
        await testComponentClasses(`- [x] Done task ✅ ${future}`, {}, fieldRenderer.className('doneDate'), {
            taskDone: 'future-1d',
        });
    });

    it('adds a correct "future-7d" CSS class to dates', async () => {
        const future = DateParser.parseDate('in 7 days').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ ➕ ${future}`, {}, fieldRenderer.className('createdDate'), {
            taskCreated: 'future-7d',
        });
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${future}`, {}, fieldRenderer.className('dueDate'), {
            taskDue: 'future-7d',
        });
        await testComponentClasses(`- [ ] Full task ⏫ ⏳ ${future}`, {}, fieldRenderer.className('scheduledDate'), {
            taskScheduled: 'future-7d',
        });
        await testComponentClasses(`- [ ] Full task ⏫ 🛫 ${future}`, {}, fieldRenderer.className('startDate'), {
            taskStart: 'future-7d',
        });
        await testComponentClasses(`- [x] Done task ✅ ${future}`, {}, fieldRenderer.className('doneDate'), {
            taskDone: 'future-7d',
        });
    });

    it('adds a correct "past-1d" CSS class to dates', async () => {
        const past = DateParser.parseDate('yesterday').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ ➕ ${past}`, {}, fieldRenderer.className('createdDate'), {
            taskCreated: 'past-1d',
        });
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${past}`, {}, fieldRenderer.className('dueDate'), {
            taskDue: 'past-1d',
        });
        await testComponentClasses(`- [ ] Full task ⏫ ⏳ ${past}`, {}, fieldRenderer.className('scheduledDate'), {
            taskScheduled: 'past-1d',
        });
        await testComponentClasses(`- [ ] Full task ⏫ 🛫 ${past}`, {}, fieldRenderer.className('startDate'), {
            taskStart: 'past-1d',
        });
        await testComponentClasses(`- [x] Done task ✅ ${past}`, {}, fieldRenderer.className('doneDate'), {
            taskDone: 'past-1d',
        });
    });

    it('adds a correct "past-7d" CSS class to dates', async () => {
        const past = DateParser.parseDate('7 days ago').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ ➕ ${past}`, {}, fieldRenderer.className('createdDate'), {
            taskCreated: 'past-7d',
        });
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${past}`, {}, fieldRenderer.className('dueDate'), {
            taskDue: 'past-7d',
        });
        await testComponentClasses(`- [ ] Full task ⏫ ⏳ ${past}`, {}, fieldRenderer.className('scheduledDate'), {
            taskScheduled: 'past-7d',
        });
        await testComponentClasses(`- [ ] Full task ⏫ 🛫 ${past}`, {}, fieldRenderer.className('startDate'), {
            taskStart: 'past-7d',
        });
        await testComponentClasses(`- [x] Done task ✅ ${past}`, {}, fieldRenderer.className('doneDate'), {
            taskDone: 'past-7d',
        });
    });

    it('adds the classes "...future-far" and "...past-far" to dates that are further than 7 days', async () => {
        const future = DateParser.parseDate('in 8 days').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ ➕ ${future}`, {}, fieldRenderer.className('createdDate'), {
            taskCreated: 'future-far',
        });
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${future}`, {}, fieldRenderer.className('dueDate'), {
            taskDue: 'future-far',
        });
        await testComponentClasses(`- [ ] Full task ⏫ ⏳ ${future}`, {}, fieldRenderer.className('scheduledDate'), {
            taskScheduled: 'future-far',
        });
        await testComponentClasses(`- [ ] Full task ⏫ 🛫 ${future}`, {}, fieldRenderer.className('startDate'), {
            taskStart: 'future-far',
        });
        await testComponentClasses(`- [x] Done task ✅ ${future}`, {}, fieldRenderer.className('doneDate'), {
            taskDone: 'future-far',
        });
        const past = DateParser.parseDate('8 days ago').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ ➕ ${past}`, {}, fieldRenderer.className('createdDate'), {
            taskCreated: 'past-far',
        });
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${past}`, {}, fieldRenderer.className('dueDate'), {
            taskDue: 'past-far',
        });
        await testComponentClasses(`- [ ] Full task ⏫ ⏳ ${past}`, {}, fieldRenderer.className('scheduledDate'), {
            taskScheduled: 'past-far',
        });
        await testComponentClasses(`- [ ] Full task ⏫ 🛫 ${past}`, {}, fieldRenderer.className('startDate'), {
            taskStart: 'past-far',
        });
        await testComponentClasses(`- [x] Done task ✅ ${past}`, {}, fieldRenderer.className('doneDate'), {
            taskDone: 'past-far',
        });
    });

    it('does not add specific classes to invalid dates', async () => {
        await testComponentClasses('- [ ] Full task ⏫ 📅 2023-02-29', {}, fieldRenderer.className('dueDate'), {});
    });

    it('does not render hidden components but sets their specific classes to the upper li element', async () => {
        await testHiddenComponentClasses(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            { hidePriority: true },
            fieldRenderer.className('priority'),
            { taskPriority: 'high' },
        );
        await testHiddenComponentClasses(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 ➕ 2022-07-04 🔁 every day',
            { hideCreatedDate: true },
            fieldRenderer.className('createdDate'),
            { taskCreated: 'past-far' },
        );
        await testHiddenComponentClasses(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            { hideDueDate: true },
            fieldRenderer.className('dueDate'),
            { taskDue: 'past-far' },
        );
        await testHiddenComponentClasses(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            { hideScheduledDate: true },
            fieldRenderer.className('scheduledDate'),
            { taskScheduled: 'past-far' },
        );
        await testHiddenComponentClasses(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            { hideStartDate: true },
            fieldRenderer.className('startDate'),
            { taskStart: 'past-far' },
        );
    });

    // Unlike the default renderer in createMockParentAndRender, this one accepts a raw HTML rather
    // than a text, used for the following tests
    const mockInnerHtmlRenderer = async (text: string, element: HTMLSpanElement, _path: string) => {
        element.innerHTML = text;
    };

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
        const parentRender = await createMockParentAndRender(task, new LayoutOptions(), mockInnerHtmlRenderer);

        const textSpan = getTextSpan(parentRender);
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
        const parentRender = await createMockParentAndRender(task, new LayoutOptions(), mockInnerHtmlRenderer);

        const textSpan = getTextSpan(parentRender);
        const descriptionSpan = textSpan.children[0].children[0] as HTMLElement;
        expect(descriptionSpan.textContent).toEqual('Class with #illegal"data&attribute');
        const tagSpan = descriptionSpan.children[0] as HTMLSpanElement;
        expect(tagSpan.textContent).toEqual('#illegal"data&attribute');
        expect(tagSpan.classList[0]).toEqual('tag');
        expect(tagSpan.dataset.tagName).toEqual('#illegal-data-attribute');
    });

    it('creates data attributes for custom statuses', async () => {
        await testLiAttributes(
            '- [ ] An incomplete task',
            {},
            { task: '', taskStatusName: 'Todo', taskStatusType: 'TODO' },
        );
        await testLiAttributes(
            '- [x] A complete task',
            {},
            { task: 'x', taskStatusName: 'Done', taskStatusType: 'DONE' },
        );
        await testLiAttributes(
            '- [/] In-progress task',
            {},
            { task: '/', taskStatusName: 'In Progress', taskStatusType: 'IN_PROGRESS' },
        );
        await testLiAttributes(
            '- [-] In-progress task',
            {},
            { task: '-', taskStatusName: 'Cancelled', taskStatusType: 'CANCELLED' },
        );
    });
});

describe('Visualise HTML', () => {
    async function renderAndVerifyHTML(task: Task, layoutOptions: LayoutOptions) {
        const mockHTMLRenderer = async (text: string, element: HTMLSpanElement, _path: string) => {
            // Contrary to the default mockTextRenderer() in createMockParentAndRender(),
            // instead of the rendered HTMLSpanElement.innerText,
            // we need the plain HTML here like in TaskLineRenderer.renderComponentText(),
            // in order to ensure that any description and tags are retained.
            element.innerHTML = text;
        };

        const parentRender = await createMockParentAndRender(task, layoutOptions, mockHTMLRenderer);
        const taskAsMarkdown = `<!--
${task.toFileLineString()}
-->\n\n`;
        const taskAsHTML = parentRender.innerHTML
            .replace(/ data-/g, '\n    data-')
            .replace(/<span/g, '\n        <span');

        verifyWithFileExtension(taskAsMarkdown + taskAsHTML, 'html');
    }

    const fullTask = TaskBuilder.createFullyPopulatedTask();
    const minimalTask = fromLine({ line: '- [-] empty' });

    function layoutOptionsFullMode(): LayoutOptions {
        const layoutOptions = new LayoutOptions();

        // Show every Task field, disable short mode, do not explain the query
        // Also note that urgency, backlinks and edit button are rendered in QueryRender.createTaskList(),
        // so they won't be visible in this test it is using TaskLineRenderer.renderTaskLine().
        // See also comments in TaskLayout.applyOptions().
        Object.keys(layoutOptions).forEach((key) => {
            const key2 = key as keyof LayoutOptions;
            layoutOptions[key2] = false;
        });

        return layoutOptions;
    }

    function layoutOptionsShortMode(): LayoutOptions {
        const layoutOptions = layoutOptionsFullMode();

        layoutOptions.shortMode = true;

        return layoutOptions;
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
