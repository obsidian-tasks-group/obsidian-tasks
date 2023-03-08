/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { DebugSettings } from '../src/Config/DebugSettings';
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
    afterEach(() => {
        resetSettings();
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

    const testLayoutOptions = async (
        taskLine: string,
        layoutOptions: Partial<LayoutOptions>,
        expectedRender: string,
    ) => {
        const task = fromLine({
            line: taskLine,
            path: 'a/b/c.d',
            precedingHeader: 'Previous Heading',
        });
        const fullLayoutOptions = { ...new LayoutOptions(), ...layoutOptions };
        const parentRender = await createMockParentAndRender(task, fullLayoutOptions);
        const renderedDescription = getDescriptionText(parentRender);
        expect(renderedDescription).toEqual(expectedRender);
    };

    it('renders correctly with the default layout options', async () => {
        await testLayoutOptions(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            {},
            'Full task ⏫ 🔁 every day 🛫 2022-07-04 ⏳ 2022-07-03 📅 2022-07-02',
        );
    });

    it('renders without priority', async () => {
        await testLayoutOptions(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            { hidePriority: true },
            'Full task 🔁 every day 🛫 2022-07-04 ⏳ 2022-07-03 📅 2022-07-02',
        );
    });

    it('renders without created date', async () => {
        await testLayoutOptions(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 ➕ 2022-07-05 🔁 every day',
            { hideCreatedDate: true },
            'Full task ⏫ 🔁 every day 🛫 2022-07-04 ⏳ 2022-07-03 📅 2022-07-02',
        );
    });

    it('renders without start date', async () => {
        await testLayoutOptions(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            { hideStartDate: true },
            'Full task ⏫ 🔁 every day ⏳ 2022-07-03 📅 2022-07-02',
        );
    });

    it('renders without scheduled date', async () => {
        await testLayoutOptions(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            { hideScheduledDate: true },
            'Full task ⏫ 🔁 every day 🛫 2022-07-04 📅 2022-07-02',
        );
    });

    it('renders without due date', async () => {
        await testLayoutOptions(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            { hideDueDate: true },
            'Full task ⏫ 🔁 every day 🛫 2022-07-04 ⏳ 2022-07-03',
        );
    });

    it('renders without recurrence rule', async () => {
        await testLayoutOptions(
            '- [ ] Full task ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            { hideRecurrenceRule: true },
            'Full task ⏫ 🛫 2022-07-04 ⏳ 2022-07-03 📅 2022-07-02',
        );
    });

    it('renders a done task correctly with the default layout', async () => {
        await testLayoutOptions(
            '- [x] Full task ✅ 2022-07-05 ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            {},
            'Full task ⏫ 🔁 every day 🛫 2022-07-04 ⏳ 2022-07-03 📅 2022-07-02 ✅ 2022-07-05',
        );
    });

    it('renders a done task without the done date', async () => {
        await testLayoutOptions(
            '- [x] Full task ✅ 2022-07-05 ⏫ 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            { hideDoneDate: true },
            'Full task ⏫ 🔁 every day 🛫 2022-07-04 ⏳ 2022-07-03 📅 2022-07-02',
        );
    });

    it('writes a placeholder message if a date is invalid', async () => {
        await testLayoutOptions(
            '- [ ] Task with invalid due date 📅 2023-13-02',
            {},
            'Task with invalid due date 📅 Invalid date',
        );
    });

    it('renders debug info if requested', async () => {
        // Disable sort instructions
        updateSettings({ debugSettings: new DebugSettings(false, true) });
        await testLayoutOptions(
            '- [ ] Task with invalid due date 📅 2023-11-02',
            {},
            "Task with invalid due date 📅 2023-11-02<br>🐛 <b>0</b> . 0 . 0 . '<code>- [ ] Task with invalid due date 📅 2023-11-02</code>'<br>'<code>a/b/c.d</code>' > '<code>Previous Heading</code>'<br>",
        );
    });

    it('standardise the recurrence rule, even if the rule is invalid', async () => {
        await testLayoutOptions(
            '- [ ] Task with invalid recurrence rule 🔁 every month on the 32nd',
            {},
            'Task with invalid recurrence rule 🔁 every month on the 32th',
        );
    });
});
