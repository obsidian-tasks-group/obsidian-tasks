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
        };

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
});
