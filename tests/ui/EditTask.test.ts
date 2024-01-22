/**
 * @jest-environment jsdom
 */
import { type RenderResult, fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it } from '@jest/globals';
import moment from 'moment';
import { taskFromLine } from '../../src/Commands/CreateOrEditTaskParser';
import type { Task } from '../../src/Task/Task';
import EditTask from '../../src/ui/EditTask.svelte';
import { Status } from '../../src/Statuses/Status';
import { DateFallback } from '../../src/Task/DateFallback';
import { GlobalFilter } from '../../src/Config/GlobalFilter';
import { resetSettings, updateSettings } from '../../src/Config/Settings';
import { verifyAllCombinations3Async } from '../TestingTools/CombinationApprovalsAsync';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

window.moment = moment;
const statusOptions: Status[] = [Status.DONE, Status.TODO];

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
    const result: RenderResult<EditTask> = render(EditTask, { task, statusOptions, onSubmit, allTasks });
    const { container } = result;
    expect(() => container).toBeTruthy();
    return { result, container };
}

function getAndCheckRenderedElement(container: HTMLElement, elementId: string) {
    const renderedDescription = container.ownerDocument.getElementById(elementId) as HTMLInputElement;
    expect(() => renderedDescription).toBeTruthy();
    return renderedDescription;
}

function getAndCheckRenderedDescriptionElement(container: HTMLElement): HTMLInputElement {
    return getAndCheckRenderedElement(container, 'description');
}

function getAndCheckApplyButton(result: RenderResult<EditTask>): HTMLButtonElement {
    const submit = result.getByText('Apply') as HTMLButtonElement;
    expect(submit).toBeTruthy();
    return submit;
}

async function editInputElementAndSubmit(
    inputElement: HTMLInputElement,
    newValue: string,
    submit: HTMLButtonElement,
    waitForClose: Promise<string>,
): Promise<string> {
    await fireEvent.input(inputElement, { target: { value: newValue } });
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

    const description = getAndCheckRenderedElement(container, elementId);
    const submit = getAndCheckApplyButton(result);

    return await editInputElementAndSubmit(description, newValue, submit, waitForClose);
}

describe('Task rendering', () => {
    afterEach(() => {
        GlobalFilter.getInstance().reset();
    });

    function testElementRender(line: string, elementId: string, expectedElementValue: string) {
        const task = taskFromLine({ line, path: '' });

        const onSubmit = (_: Task[]): void => {};
        const { container } = renderAndCheckModal(task, onSubmit);

        const inputElement = getAndCheckRenderedElement(container, elementId);
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
