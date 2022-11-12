/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { renderTaskLine } from '../src/TaskLineRenderer';
import { resetSettings, updateSettings } from '../src/Config/Settings';
import type { Task } from '../src/Task';
import { fromLine } from './TestHelpers';

jest.mock('obsidian');
window.moment = moment;

/**
 * Creates a dummy 'parent element' to host a task render, renders a task inside it,
 * and returns it for inspection.
 */
async function createMockParentAndRender(task: Task) {
    const parentElement = document.createElement('div');
    const mockTextRenderer = async (text: string, element: HTMLSpanElement, _path: string) => {
        element.innerText = text;
    };
    await renderTaskLine(
        task,
        {
            parentUlElement: parentElement,
            listIndex: 0,
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
});
