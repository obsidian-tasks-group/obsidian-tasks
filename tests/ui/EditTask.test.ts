/**
 * @jest-environment jsdom
 */
import { describe, expect, it } from '@jest/globals';
import { type RenderResult, fireEvent, render } from '@testing-library/svelte';
import moment from 'moment';
import { taskFromLine } from '../../src/Commands/CreateOrEditTaskParser';
import { GlobalFilter } from '../../src/Config/GlobalFilter';
import { resetSettings, updateSettings } from '../../src/Config/Settings';
import { StatusRegistry } from '../../src/Statuses/StatusRegistry';
import { DateFallback } from '../../src/Task/DateFallback';
import type { Task } from '../../src/Task/Task';
import EditTask from '../../src/ui/EditTask.svelte';
import { verifyWithFileExtension } from '../TestingTools/ApprovalTestHelpers';
import { verifyAllCombinations3Async } from '../TestingTools/CombinationApprovalsAsync';
import { prettifyHTML } from '../TestingTools/HTMLHelpers';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

window.moment = moment;
/**
 * Construct an onSubmit function for editing the given task, and when Apply is clicked,
 * returning the edit task(s) converted to a string.
 * @param task
 */
function constructSerialisingOnSubmit(task: Task) {
    let resolvePromise: (input: string) => void;
    const waitForClose = new Promise<string>((resolve, _) => {
        resolvePromise = resolve;
    });

    const onSubmit = (updatedTasks: Task[]): void => {
        const serializedTask = DateFallback.removeInferredStatusIfNeeded(task, updatedTasks)
            .map((task: Task) => task.toFileLineString())
            .join('\n');
        resolvePromise(serializedTask);
    };

    return { waitForClose, onSubmit };
}

function renderAndCheckModal(task: Task, onSubmit: (updatedTasks: Task[]) => void, allTasks = [task]) {
    const result: RenderResult<EditTask> = render(EditTask, {
        task,
        statusOptions: StatusRegistry.getInstance().registeredStatuses,
        onSubmit,
        allTasks,
    });
    const { container } = result;
    expect(() => container).toBeTruthy();
    return { result, container };
}

/**
 * Find the element with the given id.
 * Template type T might be, for example, HTMLInputElement or HTMLSelectElement
 * @param container
 * @param elementId
 */
function getAndCheckRenderedElement<T>(container: HTMLElement, elementId: string) {
    const element = container.ownerDocument.getElementById(elementId) as T;
    expect(() => element).toBeTruthy();
    return element;
}

function getAndCheckRenderedDescriptionElement(container: HTMLElement): HTMLInputElement {
    return getAndCheckRenderedElement<HTMLInputElement>(container, 'description');
}

function getAndCheckApplyButton(result: RenderResult<EditTask>): HTMLButtonElement {
    const submit = result.getByText('Apply') as HTMLButtonElement;
    expect(submit).toBeTruthy();
    return submit;
}

async function editInputElement(inputElement: HTMLInputElement, newValue: string) {
    await fireEvent.input(inputElement, { target: { value: newValue } });
}

async function editInputElementAndSubmit(
    inputElement: HTMLInputElement,
    newValue: string,
    submit: HTMLButtonElement,
    waitForClose: Promise<string>,
): Promise<string> {
    await editInputElement(inputElement, newValue);
    submit.click();
    return await waitForClose;
}

function convertDescriptionToTaskLine(taskDescription: string): string {
    return `- [ ] ${taskDescription}`;
}

/**
 * Simulate the behaviour of:
 *   - clicking on a line in Obsidian,
 *   - opening the Edit task modal,
 *   - optionally editing the description,
 *   - and clicking Apply.
 * @param line
 * @param newDescription - the new value for the description field.
 *                         If `undefined`, the description won't be edited, unless text is needed to enable the Apply button.
 * @returns The edited task line.
 *
 * See also {@link editFieldAndSave} which is simpler, and works for more fields
 */
async function editTaskLine(line: string, newDescription: string | undefined) {
    const task = taskFromLine({ line: line, path: '' });
    const { waitForClose, onSubmit } = constructSerialisingOnSubmit(task);
    const { result, container } = renderAndCheckModal(task, onSubmit);

    const description = getAndCheckRenderedDescriptionElement(container);
    const submit = getAndCheckApplyButton(result);

    let adjustedNewDescription = newDescription ? newDescription : description!.value;
    if (!adjustedNewDescription) {
        adjustedNewDescription = 'simulate user typing text in to empty description field';
    }

    return await editInputElementAndSubmit(description, adjustedNewDescription, submit, waitForClose);
}

/**
 * Simulate the behaviour of:
 *   - clicking on a line in Obsidian,
 *   - opening the Edit task modal,
 *   - editing a field,
 *   - and clicking Apply.
 * @param line
 * @param elementId - specifying the field to edit
 * @param newValue - the new value for the field.
 * @returns The edited task line.
 *
 * See also {@link editTaskLine} which has extra logic for testing the description
 */
async function editFieldAndSave(line: string, elementId: string, newValue: string) {
    const task = taskFromLine({ line: line, path: '' });
    const { waitForClose, onSubmit } = constructSerialisingOnSubmit(task);
    const { result, container } = renderAndCheckModal(task, onSubmit);

    const description = getAndCheckRenderedElement<HTMLInputElement>(container, elementId);
    const submit = getAndCheckApplyButton(result);

    return await editInputElementAndSubmit(description, newValue, submit, waitForClose);
}

async function renderTaskModalAndChangeStatus(line: string, newStatusSymbol: string) {
    const task = taskFromLine({ line: line, path: '' });
    const { waitForClose, onSubmit } = constructSerialisingOnSubmit(task);
    const { result, container } = renderAndCheckModal(task, onSubmit);

    const statusSelector = getAndCheckRenderedElement<HTMLSelectElement>(container, 'status-type');
    const submit = getAndCheckApplyButton(result);

    await fireEvent.change(statusSelector, {
        target: { value: newStatusSymbol },
    });
    return { waitForClose, container, submit };
}

function getElementValue(container: HTMLElement, elementId: string) {
    const element = getAndCheckRenderedElement<HTMLInputElement>(container, elementId);
    return element.value;
}

describe('Task rendering', () => {
    afterEach(() => {
        GlobalFilter.getInstance().reset();
    });

    function testElementRender(line: string, elementId: string, expectedElementValue: string) {
        const task = taskFromLine({ line, path: '' });

        const onSubmit = (_: Task[]): void => {};
        const { container } = renderAndCheckModal(task, onSubmit);

        const inputElement = getAndCheckRenderedElement<HTMLInputElement>(container, elementId);
        expect(inputElement!.value).toEqual(expectedElementValue);
    }

    function testDescriptionRender(taskDescription: string, expectedDescription: string) {
        const line = convertDescriptionToTaskLine(taskDescription);
        testElementRender(line, 'description', expectedDescription);
    }

    it('should display task description (empty Global Filter)', () => {
        testDescriptionRender('important thing #todo', 'important thing #todo');
    });

    it('should display task description without non-tag Global Filter)', () => {
        GlobalFilter.getInstance().set('filter');
        testDescriptionRender('filter important thing', 'important thing');
    });

    it('should display task description with complex non-tag Global Filter)', () => {
        GlobalFilter.getInstance().set('filter');
        // This behavior is inconsistent with Obsidian's tag definition which includes nested tags
        testDescriptionRender('filter/important thing', 'filter/important thing');
    });

    it('should display task description without tag-like Global Filter', () => {
        GlobalFilter.getInstance().set('#todo');
        testDescriptionRender('#todo another plan', 'another plan');
    });

    it('should display task description with complex tag-like Global Filter', () => {
        GlobalFilter.getInstance().set('#todo');
        // This behavior is inconsistent with Obsidian's tag definition which includes nested tags
        testDescriptionRender('#todo/important another plan', '#todo/important another plan');
    });

    it('should display task description with emoji removed, when global filter is in initial line', () => {
        GlobalFilter.getInstance().set('#todo');
        testDescriptionRender(
            '#todo with global filter and with scheduled date ⏳ 2023-06-13',
            'with global filter and with scheduled date',
        );
    });

    it('should display task description with emoji removed, even if the global filter is missing from initial line (bug 2037)', () => {
        GlobalFilter.getInstance().set('#todo');
        // When written, this was a demonstration of the behaviour logged in
        // https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2037
        testDescriptionRender(
            'without global filter but with scheduled date ⏳ 2023-06-13',
            'without global filter but with scheduled date', // fails, as the absence of the global filter means the line is not parsed, and the emoji stays in the description.
        );
    });

    const fullyPopulatedLine = TaskBuilder.createFullyPopulatedTask().toFileLineString();

    it('should display valid created date', () => {
        testElementRender(fullyPopulatedLine, 'created', '2023-07-01');
    });

    it('should display valid start date', () => {
        testElementRender(fullyPopulatedLine, 'start', '2023-07-02');
    });

    it('should display valid scheduled date', () => {
        testElementRender(fullyPopulatedLine, 'scheduled', '2023-07-03');
    });

    it('should display valid due date', () => {
        testElementRender(fullyPopulatedLine, 'due', '2023-07-04');
    });

    it('should display valid done date', () => {
        testElementRender(fullyPopulatedLine, 'done', '2023-07-05');
    });

    it('should display valid cancelled date', () => {
        testElementRender(fullyPopulatedLine, 'cancelled', '2023-07-06');
    });

    const invalidDateText = 'Invalid date';

    it('should display invalid cancelled date', () => {
        testElementRender('- [ ] ❌ 2024-02-31', 'cancelled', invalidDateText);
    });

    it('should display invalid created date', () => {
        testElementRender('- [ ] ➕ 2024-02-31', 'created', invalidDateText);
    });

    it('should display invalid done date', () => {
        testElementRender('- [ ] ✅ 2024-02-31', 'done', invalidDateText);
    });

    it('should display invalid due date', () => {
        testElementRender('- [ ] 📅 2024-02-31', 'due', invalidDateText);
    });

    it('should display invalid scheduled date', () => {
        testElementRender('- [ ] ⏳ 2024-02-31', 'scheduled', invalidDateText);
    });

    it('should display invalid start date', () => {
        testElementRender('- [ ] 🛫 2024-02-31', 'start', invalidDateText);
    });
});

describe('Task editing', () => {
    afterEach(() => {
        GlobalFilter.getInstance().reset();
    });

    async function testDescriptionEdit(taskDescription: string, newDescription: string, expectedDescription: string) {
        const line = convertDescriptionToTaskLine(taskDescription);
        const editedTask = await editTaskLine(line, newDescription);
        expect(editedTask).toEqual(`- [ ] ${expectedDescription}`);
    }

    it('should keep task description if it was not edited (Empty Global Filter)', async () => {
        const description = 'simple task #remember';
        await testDescriptionEdit(description, description, description);
    });

    it('should change task description if it was edited (Empty Global Filter)', async () => {
        await testDescriptionEdit('simple task #remember', 'another', 'another');
    });

    it('should not change the description if the task was not edited and keep Global Filter', async () => {
        const globalFilter = '#remember';
        const description = 'simple task';
        GlobalFilter.getInstance().set(globalFilter);
        await testDescriptionEdit(`${globalFilter} ${description}`, description, `${globalFilter} ${description}`);
    });

    it('should change the description if the task was edited and keep Global Filter', async () => {
        const globalFilter = '#remember';
        const oldDescription = 'simple task';
        const newDescription = 'new plan';
        GlobalFilter.getInstance().set(globalFilter);
        await testDescriptionEdit(
            `${globalFilter} ${oldDescription}`,
            newDescription,
            `${globalFilter} ${newDescription}`,
        );
    });

    describe('Status editing', () => {
        const today = '2024-02-29';
        beforeAll(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date(today));
        });

        afterAll(() => {
            jest.useRealTimers();
        });

        afterEach(() => {
            resetSettings();
        });

        const line = '- [ ] simple';
        it('should change status to Done and add doneDate', async () => {
            const { waitForClose, container, submit } = await renderTaskModalAndChangeStatus(line, 'x');
            expect(getElementValue(container, 'done')).toEqual(today);

            submit.click();
            expect(await waitForClose).toMatchInlineSnapshot('"- [x] simple ✅ 2024-02-29"');
        });

        it('should change status to Todo and remove doneDate', async () => {
            const { waitForClose, container, submit } = await renderTaskModalAndChangeStatus(
                '- [x] simple ✅ 2024-02-29',
                ' ',
            );
            expect(getElementValue(container, 'done')).toEqual('');

            submit.click();
            expect(await waitForClose).toMatchInlineSnapshot('"- [ ] simple"');
        });

        it('should change status to Cancelled and add cancelledDate', async () => {
            const { waitForClose, container, submit } = await renderTaskModalAndChangeStatus(line, '-');
            expect(getElementValue(container, 'cancelled')).toEqual(today);

            submit.click();
            expect(await waitForClose).toMatchInlineSnapshot('"- [-] simple ❌ 2024-02-29"');
        });

        it('should create new instance of recurring task, with doneDate set to today', async () => {
            updateSettings({ recurrenceOnNextLine: false });
            const { waitForClose, submit } = await renderTaskModalAndChangeStatus(
                '- [ ] Recurring 🔁 every day 📅 2024-02-17',
                'x',
            );

            submit.click();
            expect(await waitForClose).toMatchInlineSnapshot(`
                "- [ ] Recurring 🔁 every day 📅 2024-02-18
                - [x] Recurring 🔁 every day 📅 2024-02-17 ✅ 2024-02-29"
            `);
        });

        it('should respect user setting for order of new recurring tasks', async () => {
            updateSettings({ recurrenceOnNextLine: true });
            const { waitForClose, submit } = await renderTaskModalAndChangeStatus(
                '- [ ] Recurring 🔁 every day 📅 2024-02-17',
                'x',
            );

            submit.click();
            expect(await waitForClose).toMatchInlineSnapshot(`
                "- [x] Recurring 🔁 every day 📅 2024-02-17 ✅ 2024-02-29
                - [ ] Recurring 🔁 every day 📅 2024-02-18"
            `);
        });

        it('should create new instance of "when done" recurring task, with doneDate set to today', async () => {
            updateSettings({ setCreatedDate: true });

            const { waitForClose, submit } = await renderTaskModalAndChangeStatus(
                '- [ ] Recurring 🔁 every day when done 📅 2024-02-17',
                'x',
            );

            submit.click();
            expect(await waitForClose).toMatchInlineSnapshot(`
                "- [ ] Recurring 🔁 every day when done ➕ 2024-02-29 📅 2024-03-01
                - [x] Recurring 🔁 every day when done 📅 2024-02-17 ✅ 2024-02-29"
            `);
        });

        it('should calculate the next recurrence date based on the actual done date in the field', async () => {
            updateSettings({ setCreatedDate: true });

            const { waitForClose, container, submit } = await renderTaskModalAndChangeStatus(
                '- [ ] Recurring 🔁 every day when done 📅 2024-02-17',
                'x',
            );

            const doneField = getAndCheckRenderedElement<HTMLInputElement>(container, 'done');
            await editInputElement(doneField, '2024-02-23');

            submit.click();
            expect(await waitForClose).toMatchInlineSnapshot(`
                "- [ ] Recurring 🔁 every day when done ➕ 2024-02-29 📅 2024-02-24
                - [x] Recurring 🔁 every day when done 📅 2024-02-17 ✅ 2024-02-23"
            `);
        });
    });

    describe('Date editing', () => {
        const line = '- [ ] simple';

        it('should edit and save cancelled date', async () => {
            expect(await editFieldAndSave(line, 'cancelled', '2024-01-01')).toEqual('- [ ] simple ❌ 2024-01-01');
        });

        it('should edit and save created date', async () => {
            expect(await editFieldAndSave(line, 'created', '2024-01-01')).toEqual('- [ ] simple ➕ 2024-01-01');
        });

        it('should edit and save done date', async () => {
            expect(await editFieldAndSave(line, 'done', '2024-01-01')).toEqual('- [ ] simple ✅ 2024-01-01');
        });

        it('should edit and save due date', async () => {
            expect(await editFieldAndSave(line, 'due', '2024-01-01')).toEqual('- [ ] simple 📅 2024-01-01');
        });

        it('should edit and save scheduled date', async () => {
            expect(await editFieldAndSave(line, 'scheduled', '2024-01-01')).toEqual('- [ ] simple ⏳ 2024-01-01');
        });

        it('should edit and save start date', async () => {
            expect(await editFieldAndSave(line, 'start', '2024-01-01')).toEqual('- [ ] simple 🛫 2024-01-01');
        });
    });
});

/**
 * @summary This tests behaviour under a wide variety of scenarios, such as multiple different user settings, and input lines.
 *
 * As the number of combinations of settings values increases, it becomes harder and harder
 * to write sufficient tests manually, and to find corner cases in exploratory testing.
 */
describe('Exhaustive editing', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-07-18'));
    });

    afterEach(() => {
        GlobalFilter.getInstance().reset();
        resetSettings();
        jest.useRealTimers();
    });

    /**
     * Test outcome of simply editing and saving a task line, under many conditions.
     * Written as our previous test coverage was not good enough to detect the following:
     *   - https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2112
     *   - Since Tasks 4.0.1, using 'Create or edit task' on a line with a checkbox
     *     but no global filter no longer adds the Created date.
     */
    describe('Edit and save', () => {
        const name = 'All inputs';
        const title = 'KEY: (globalFilter, set created date)\n';
        const globalFilterValues = ['', '#task'];
        const setCreatedDateValues = [false, true];
        const initialTaskLineValues = [
            '',
            'plain text, not a list item',
            '-',
            '- ',
            '- [ ]',
            '- [ ] ',
            '- list item, but no checkbox',
            '- [ ] checkbox with initial description',
            '- [ ] checkbox with initial description and created date ➕ 2023-01-01',
            '- [ ] #task checkbox with global filter string and initial description',
            '- [ ] checkbox with initial description ending with task tag at end #task',
        ];

        // For explanation of this call, see:
        // https://publish.obsidian.md/tasks-contributing/Testing/Approval+Tests#Verify+the+results+of+multiple+input+values
        verifyAllCombinations3Async<string, boolean, string>(
            name,
            title,
            async (globalFilter, setCreatedDate, initialTaskLine) => {
                GlobalFilter.getInstance().set(globalFilter as string);

                // @ts-expect-error: TS2322: Type 'T2' is not assignable to type 'boolean | undefined'.
                updateSettings({ setCreatedDate });

                // @ts-expect-error: TS2345: Argument of type 'T3' is not assignable to parameter of type 'string'.
                const editedTaskLine = await editTaskLine(initialTaskLine, undefined);

                return `
('${globalFilter}', ${setCreatedDate})
    '${initialTaskLine}' =>
    '${editedTaskLine}'`;
            },
            globalFilterValues,
            setCreatedDateValues,
            initialTaskLineValues,
        );
    });
});

describe('Edit Modal HTML snapshot tests', () => {
    afterEach(() => {
        resetSettings();
    });

    function verifyModalHTML() {
        const task = taskFromLine({ line: '- [ ] absolutely to do', path: '' });
        const onSubmit = () => {};
        const allTasks = [task];
        const { container } = renderAndCheckModal(task, onSubmit, allTasks);

        const prettyHTML = prettifyHTML(container.innerHTML);
        verifyWithFileExtension(prettyHTML, 'html');
    }

    it('should match snapshot', () => {
        updateSettings({ provideAccessKeys: true });
        verifyModalHTML();
    });

    it('should match snapshot - without access keys', () => {
        updateSettings({ provideAccessKeys: false });
        verifyModalHTML();
    });
});
