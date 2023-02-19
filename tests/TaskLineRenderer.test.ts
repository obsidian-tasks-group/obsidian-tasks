/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { LayoutClasses, renderTaskLine } from '../src/TaskLineRenderer';
import type { TextRenderer } from '../src/TaskLineRenderer';
import { resetSettings, updateSettings } from '../src/Config/Settings';
import { LayoutOptions } from '../src/TaskLayout';
import type { Task } from '../src/Task';
import { TaskRegularExpressions } from '../src/Task';
import { DateParser } from '../src/Query/DateParser';
import { fromLine } from './TestHelpers';

jest.mock('obsidian');
window.moment = moment;

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
    await renderTaskLine(
        task,
        {
            parentUlElement: parentElement,
            listIndex: 0,
            layoutOptions: layoutOptions,
        },
        mockTextRenderer,
    );
    return parentElement;
}

function getTextSpan(parentElement: HTMLElement) {
    const li = parentElement.children[0];
    const textSpan = li.children[1] as HTMLSpanElement;
    return textSpan;
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
        if (childSpan.classList.contains(LayoutClasses.description)) continue;
        if (childSpan?.textContent) components.push(childSpan.textContent);
    }
    return components;
}

describe('task line rendering', () => {
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

    it('hides the global filter if and only if required', async () => {
        const getDescriptionTest = async () => {
            const taskLine = '- [ ] This is a simple task with a #global filter';
            const task = fromLine({
                line: taskLine,
            });
            const parentRender = await createMockParentAndRender(task);
            return getDescriptionText(parentRender);
        };

        const descriptionWithFilter = await getDescriptionTest();
        expect(descriptionWithFilter).toEqual('This is a simple task with a #global filter');

        updateSettings({ globalFilter: '#global', removeGlobalFilter: true });
        const descriptionWithoutFilter = await getDescriptionTest();
        expect(descriptionWithoutFilter).toEqual('This is a simple task with a  filter');
        resetSettings();
    });

    const testLayoutOptions = async (
        taskLine: string,
        layoutOptions: Partial<LayoutOptions>,
        expectedDescription: string,
        expectedComponents: string[],
    ) => {
        const task = fromLine({
            line: taskLine,
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

    it('renders a done task correctly with the default layout', async () => {
        await testLayoutOptions(
            '- [x] Full task ✅ 2022-07-05 ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            {},
            'Full task',
            [' ⏫', ' 🔁 every day', ' 🛫 2022-07-04', ' ⏳ 2022-07-03', ' 📅 2022-07-02', ' ✅ 2022-07-05'],
        );
    });

    it('renders a done task without the done date', async () => {
        await testLayoutOptions(
            '- [x] Full task ✅ 2022-07-05 ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            { hideDoneDate: true },
            'Full task',
            [' ⏫', ' 🔁 every day', ' 🛫 2022-07-04', ' ⏳ 2022-07-03', ' 📅 2022-07-02'],
        );
    });

    it('writes a placeholder message if a date is invalid', async () => {
        await testLayoutOptions('- [ ] Task with invalid due date 📅 2023-13-02', {}, 'Task with invalid due date', [
            ' 📅 Invalid date',
        ]);
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
        moreClasses: string[],
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
                const spanClasses = Array.from(childSpan.classList).filter((c) => c != mainClass);
                expect(spanClasses).toEqual(moreClasses);
            }
        }
        expect(found).toBeTruthy();
    };

    const testHiddenComponentClasses = async (
        taskLine: string,
        layoutOptions: Partial<LayoutOptions>,
        hiddenGenericClass: string,
        expectedSpecificClass: string,
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
        const li = parentRender.children[0];
        expect(li.classList.contains(expectedSpecificClass)).toBeTruthy();
    };

    it('renders priority with its correct classes', async () => {
        await testComponentClasses(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            {},
            LayoutClasses.priority,
            ['task-priority-high'],
        );
        await testComponentClasses(
            '- [ ] Full task 🔼 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            {},
            LayoutClasses.priority,
            ['task-priority-medium'],
        );
        await testComponentClasses(
            '- [ ] Full task 🔽 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            {},
            LayoutClasses.priority,
            ['task-priority-low'],
        );
    });

    it('renders recurrence with its correct classes', async () => {
        await testComponentClasses(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            {},
            LayoutClasses.recurrenceRule,
            [],
        );
    });

    it('adds a correct "today" CSS class to dates', async () => {
        const today = DateParser.parseDate('today').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${today}`, {}, LayoutClasses.dueDate, ['task-due-today']);
        await testComponentClasses(`- [ ] Full task ⏫ ⏳ ${today}`, {}, LayoutClasses.scheduledDate, [
            'task-scheduled-today',
        ]);
        await testComponentClasses(`- [ ] Full task ⏫ 🛫 ${today}`, {}, LayoutClasses.startDate, ['task-start-today']);
        await testComponentClasses(`- [x] Done task ✅ ${today}`, {}, LayoutClasses.doneDate, ['task-done-today']);
    });

    it('adds a correct "future-1d" CSS class to dates', async () => {
        const future = DateParser.parseDate('tomorrow').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${future}`, {}, LayoutClasses.dueDate, [
            'task-due-future-1d',
        ]);
        await testComponentClasses(`- [ ] Full task ⏫ ⏳ ${future}`, {}, LayoutClasses.scheduledDate, [
            'task-scheduled-future-1d',
        ]);
        await testComponentClasses(`- [ ] Full task ⏫ 🛫 ${future}`, {}, LayoutClasses.startDate, [
            'task-start-future-1d',
        ]);
        await testComponentClasses(`- [x] Done task ✅ ${future}`, {}, LayoutClasses.doneDate, ['task-done-future-1d']);
    });

    it('adds a correct "future-7d" CSS class to dates', async () => {
        const future = DateParser.parseDate('in 7 days').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${future}`, {}, LayoutClasses.dueDate, [
            'task-due-future-7d',
        ]);
        await testComponentClasses(`- [ ] Full task ⏫ ⏳ ${future}`, {}, LayoutClasses.scheduledDate, [
            'task-scheduled-future-7d',
        ]);
        await testComponentClasses(`- [ ] Full task ⏫ 🛫 ${future}`, {}, LayoutClasses.startDate, [
            'task-start-future-7d',
        ]);
        await testComponentClasses(`- [x] Done task ✅ ${future}`, {}, LayoutClasses.doneDate, ['task-done-future-7d']);
    });

    it('adds a correct "past-1d" CSS class to dates', async () => {
        const past = DateParser.parseDate('yesterday').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${past}`, {}, LayoutClasses.dueDate, ['task-due-past-1d']);
        await testComponentClasses(`- [ ] Full task ⏫ ⏳ ${past}`, {}, LayoutClasses.scheduledDate, [
            'task-scheduled-past-1d',
        ]);
        await testComponentClasses(`- [ ] Full task ⏫ 🛫 ${past}`, {}, LayoutClasses.startDate, [
            'task-start-past-1d',
        ]);
        await testComponentClasses(`- [x] Done task ✅ ${past}`, {}, LayoutClasses.doneDate, ['task-done-past-1d']);
    });

    it('adds a correct "past-7d" CSS class to dates', async () => {
        const past = DateParser.parseDate('7 days ago').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${past}`, {}, LayoutClasses.dueDate, ['task-due-past-7d']);
        await testComponentClasses(`- [ ] Full task ⏫ ⏳ ${past}`, {}, LayoutClasses.scheduledDate, [
            'task-scheduled-past-7d',
        ]);
        await testComponentClasses(`- [ ] Full task ⏫ 🛫 ${past}`, {}, LayoutClasses.startDate, [
            'task-start-past-7d',
        ]);
        await testComponentClasses(`- [x] Done task ✅ ${past}`, {}, LayoutClasses.doneDate, ['task-done-past-7d']);
    });

    it('adds the classes "...future-far" and "...past-far" to dates that are further than 7 days', async () => {
        const future = DateParser.parseDate('in 8 days').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${future}`, {}, LayoutClasses.dueDate, [
            'task-due-future-far',
        ]);
        await testComponentClasses(`- [ ] Full task ⏫ ⏳ ${future}`, {}, LayoutClasses.scheduledDate, [
            'task-scheduled-future-far',
        ]);
        await testComponentClasses(`- [ ] Full task ⏫ 🛫 ${future}`, {}, LayoutClasses.startDate, [
            'task-start-future-far',
        ]);
        await testComponentClasses(`- [x] Done task ✅ ${future}`, {}, LayoutClasses.doneDate, [
            'task-done-future-far',
        ]);
        const past = DateParser.parseDate('8 days ago').format(TaskRegularExpressions.dateFormat);
        await testComponentClasses(`- [ ] Full task ⏫ 📅 ${past}`, {}, LayoutClasses.dueDate, ['task-due-past-far']);
        await testComponentClasses(`- [ ] Full task ⏫ ⏳ ${past}`, {}, LayoutClasses.scheduledDate, [
            'task-scheduled-past-far',
        ]);
        await testComponentClasses(`- [ ] Full task ⏫ 🛫 ${past}`, {}, LayoutClasses.startDate, [
            'task-start-past-far',
        ]);
        await testComponentClasses(`- [x] Done task ✅ ${past}`, {}, LayoutClasses.doneDate, ['task-done-past-far']);
    });

    it('does not add specific classes to invalid dates', async () => {
        await testComponentClasses('- [ ] Full task ⏫ 📅 2023-02-29', {}, LayoutClasses.dueDate, []);
    });

    it('adds classes for task tags', async () => {
        await testComponentClasses('- [ ] Task with #tag1 #tag2/subtag', {}, LayoutClasses.description, [
            'task-tag-tag1',
            'task-tag-tag2-subtag',
        ]);
    });

    it('correctly sanitizes tag names to be legal CSS classes', async () => {
        await testComponentClasses('- [ ] Task with #$ #_tag/אבג/x #__other/tag', {}, LayoutClasses.description, [
            'task-tag-tag-----x',
            'task-tag-other-tag',
        ]);
    });

    // TODO TEMP add documentation
    it('does not render hidden components but sets their specific classes to the upper li element', async () => {
        await testHiddenComponentClasses(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            { hidePriority: true },
            LayoutClasses.priority,
            'task-priority-high',
        );
        await testHiddenComponentClasses(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            { hideDueDate: true },
            LayoutClasses.dueDate,
            'task-due-past-far',
        );
        await testHiddenComponentClasses(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            { hideScheduledDate: true },
            LayoutClasses.scheduledDate,
            'task-scheduled-past-far',
        );
        await testHiddenComponentClasses(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            { hideStartDate: true },
            LayoutClasses.startDate,
            'task-start-past-far',
        );
    });

    // TODO TEMP add to documentation
    /*
     * In this test we try to imitate Obsidian's Markdown renderer more thoroughly than other tests,
     * so we can verify that the rendering code adds the correct tag classes inside the rendered
     * Markdown.
     * Note that this test, just like the code that it tests, assumed a specific rendered structure
     * by Obsidian, which is not guaranteed by the API.
     */
    it('adds tag specific classes inside the description span', async () => {
        const taskLine = '- [ ] Class with <a class="tag">#someTag</a>';
        const task = fromLine({
            line: taskLine,
        });

        // Unlike the default renderer in createMockParentAndRender, this one accepts a raw HTML rather
        // than a text
        const mockInnerHtmlRenderer = async (text: string, element: HTMLSpanElement, _path: string) => {
            element.innerHTML = text;
        };
        const parentRender = await createMockParentAndRender(task, new LayoutOptions(), mockInnerHtmlRenderer);

        const textSpan = getTextSpan(parentRender);
        const descriptionSpan = textSpan.children[0].children[0] as HTMLElement;
        expect(descriptionSpan.textContent).toEqual('Class with #someTag');
        const tagSpan = descriptionSpan.children[0];
        expect(tagSpan.textContent).toEqual('#someTag');
        expect(tagSpan.classList[0]).toEqual('tag');
        expect(tagSpan.classList[1]).toEqual('task-tag-someTag');
    });
});
