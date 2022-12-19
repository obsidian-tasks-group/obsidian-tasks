/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { renderTaskLine } from '../src/TaskLineRenderer';
import { resetSettings, updateSettings } from '../src/Config/Settings';
import { LayoutOptions } from '../src/TaskLayout';
import type { Task } from '../src/Task';
import { fromLine } from './TestHelpers';

jest.mock('obsidian');
window.moment = moment;

/**
 * Creates a dummy 'parent element' to host a task render, renders a task inside it,
 * and returns it for inspection.
 */
async function createMockParentAndRender(task: Task, layoutOptions?: LayoutOptions) {
    const parentElement = document.createElement('div');
    const mockTextRenderer = async (text: string, element: HTMLSpanElement, _path: string) => {
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
    return textSpan.innerText;
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
        expect((textSpan as HTMLSpanElement).innerText).toEqual('This is a simple task');
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

    it('renders task components according to the given layout', async () => {
        // Suggest moving testLayoutOptions outside this test, to just before  it('renders task components a...
        // That way, things like the [example below with invalid data] can be done.
        // Gives an
        const testLayoutOptions = async (
            taskLine: string,
            layoutOptions: Partial<LayoutOptions>,
            expectedRender: string,
        ) => {
            const task = fromLine({
                line: taskLine,
            });
            const fullLayoutOptions = { ...new LayoutOptions(), ...layoutOptions };
            const parentRender = await createMockParentAndRender(task, fullLayoutOptions);
            const renderedDescription = getDescriptionText(parentRender);
            expect(renderedDescription).toEqual(expectedRender);
            // When this fails, there is no information about the location of the failure
            /*
                at /Users/clare/Documents/develop/Obsidian/schemar/obsidian-tasks/tests/TaskLineRenderer.test.ts:103:41
                at Generator.next (<anonymous>)
                at fulfilled (/Users/clare/Documents/develop/Obsidian/schemar/obsidian-tasks/node_modules/tslib/tslib.js:115:62)
                at processTicksAndRejections (node:internal/process/task_queues:96:5)
             */
        };

        // Tests can be made more robust by removing duplication in the date.
        // For example, if someone broke the rendering of due date and made it write
        // scheduled date instead, these tests would still pass.
        // Suggest using different values for each of the dates in the initial task.
        const taskLine = '- [ ] Wobble ⏫ 📅 2022-07-02 ⏳ 2022-07-02 🛫 2022-07-02 🔁 every day';

        // Test the default layout
        await testLayoutOptions(taskLine, {}, 'Wobble ⏫ 🔁 every day 🛫 2022-07-02 ⏳ 2022-07-02 📅 2022-07-02');

        // Without priority
        await testLayoutOptions(
            taskLine,
            { hidePriority: true },
            'Wobble 🔁 every day 🛫 2022-07-02 ⏳ 2022-07-02 📅 2022-07-02',
        );

        // Without start date
        await testLayoutOptions(
            taskLine,
            { hideStartDate: true },
            'Wobble ⏫ 🔁 every day ⏳ 2022-07-02 📅 2022-07-02',
        );

        // Without scheduled date
        await testLayoutOptions(
            taskLine,
            { hideScheduledDate: true },
            'Wobble ⏫ 🔁 every day 🛫 2022-07-02 📅 2022-07-02',
        );

        // Without due date
        await testLayoutOptions(taskLine, { hideDueDate: true }, 'Wobble ⏫ 🔁 every day 🛫 2022-07-02 ⏳ 2022-07-02');

        // Without recurrence rule
        await testLayoutOptions(
            taskLine,
            { hideRecurrenceRule: true },
            'Wobble ⏫ 🛫 2022-07-02 ⏳ 2022-07-02 📅 2022-07-02',
        );

        const doneTask = '- [x] Wobble ✅ 2022-07-02 ⏫ 📅 2022-07-02 ⏳ 2022-07-02 🛫 2022-07-02 🔁 every day';

        // Done task - default layout
        await testLayoutOptions(
            doneTask,
            {},
            'Wobble ⏫ 🔁 every day 🛫 2022-07-02 ⏳ 2022-07-02 📅 2022-07-02 ✅ 2022-07-02',
        );

        // Done task - without done date
        await testLayoutOptions(
            doneTask,
            { hideDoneDate: true },
            'Wobble ⏫ 🔁 every day 🛫 2022-07-02 ⏳ 2022-07-02 📅 2022-07-02',
        );
    });

    /*
    it('should write placeholder message if a date is invalid', async () => {
        const taskLine = '- [ ] Task with invalid due date 📅 2023-13-02';
        await testLayoutOptions(taskLine, {}, 'Task with invalid due date 📅 Invalid date');
    });

    it('should standardise the recurrence rule, even if the rule is invalid', async () => {
        const taskLine = '- [ ] Task with invalid recurrence rule 🔁 every month on the 32nd';
        await testLayoutOptions(taskLine, {}, 'Task with invalid recurrence rule 🔁 every month on the 32th');
    });
    */
});
