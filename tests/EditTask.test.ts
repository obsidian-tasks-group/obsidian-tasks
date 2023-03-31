/**
 * @jest-environment jsdom
 */
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it } from '@jest/globals';
import moment from 'moment/moment';
import { taskFromLine } from '../src/Commands/CreateOrEditTaskParser';
import type { Task } from '../src/Task';
import EditTask from '../src/ui/EditTask.svelte';
import { Status } from '../src/Status';
import { DateFallback } from '../src/DateFallback';
import { GlobalFilter } from '../src/Config/GlobalFilter';

window.moment = moment;
const task = taskFromLine({ line: '- [X] test task 1', path: '' });
const statusOptions: Status[] = [Status.DONE, Status.TODO];

describe('Task editing (UI)', () => {
    let resolvePromise: (input: string) => void;
    let waitForClose: Promise<string>;
    let onSubmit: (updatedTasks: Task[]) => void;

    beforeEach(() => {
        waitForClose = new Promise<string>((resolve, _) => {
            resolvePromise = resolve;
        });
        onSubmit = (updatedTasks: Task[]): void => {
            const serializedTask = DateFallback.removeInferredStatusIfNeeded(task, updatedTasks)
                .map((task: Task) => task.toFileLineString())
                .join('\n');
            resolvePromise(serializedTask);
        };
    });

    it('task description should be displayed', () => {
        const { container } = render(EditTask, { task, statusOptions, onSubmit });
        expect(() => container).toBeTruthy();
        const description = container.ownerDocument.getElementById('description') as HTMLInputElement;
        expect(() => description).toBeTruthy();
        expect(description!.value).toEqual('test task 1');
    });

    it('task description should be updated', async () => {
        const result = render(EditTask, { task, statusOptions, onSubmit });
        const { container } = result;
        expect(() => container).toBeTruthy();

        const description = container.ownerDocument.getElementById('description') as HTMLInputElement;
        expect(description).toBeTruthy();
        const submit = result.getByText('Apply') as HTMLButtonElement;
        expect(submit).toBeTruthy();

        await fireEvent.input(description, { target: { value: 'task edited' } });
        submit.click();
        const editedTask = await waitForClose;
        expect(editedTask).toEqual('- [X] task edited');
    });
});

describe('Task rendering vs Global Filter', () => {
    let resolvePromise: (input: string) => void;
    let onSubmit: (updatedTasks: Task[]) => void;

    beforeEach(() => {
        onSubmit = (updatedTasks: Task[]): void => {
            const serializedTask = DateFallback.removeInferredStatusIfNeeded(task, updatedTasks)
                .map((task: Task) => task.toFileLineString())
                .join('\n');
            resolvePromise(serializedTask);
        };
    });

    afterEach(() => {
        GlobalFilter.reset();
    });

    function testDescriptionRender(taskDescription: string, expectedDescription: string) {
        const task = taskFromLine({ line: `- [ ] ${taskDescription}`, path: '' });
        const { container } = render(EditTask, { task, statusOptions, onSubmit });
        expect(() => container).toBeTruthy();
        const renderedDescription = container.ownerDocument.getElementById('description') as HTMLInputElement;
        expect(() => renderedDescription).toBeTruthy();
        expect(renderedDescription!.value).toEqual(expectedDescription);
    }

    it('should display task description (empty Global Filter)', () => {
        GlobalFilter.set('');
        testDescriptionRender('important thing', 'important thing');
    });

    it.each([
        // Nominal cases
        ['filter', 'filter important thing', 'important thing'],
        ['filter', 'important filter thing', 'important thing'],
        ['filter', 'important thing filter', 'important thing'],

        // Corner cases
        ['filter', 'filter', ''],
        // In case the filter is present several time it is not filtered still...
        ['filter', 'filter filter', 'filter'],
        ['filter', 'filter filter filter ', 'filter'],
        ['filter', 'filter filter filter filter filter', 'filter filter'],
        ['filter', 'filterandsomething', 'filterandsomething'],
        ['filter', 'filter/somethingelse', 'filter/somethingelse'],
    ])(
        'should display task description (non-tag Global Filter: "%s", task: "%s")',
        (globalFilter: string, taskLine: string, expectedDescription: string) => {
            GlobalFilter.set(globalFilter);
            testDescriptionRender(taskLine, expectedDescription);
        },
    );

    it.each([
        // Nominal cases
        ['#todo', '#todo another plan', 'another plan'],
        ['#todo', 'another #todo plan', 'another plan'],
        ['#todo', 'another plan #todo', 'another plan'],

        // Multiple tags
        ['#todo', 'remember this #urgent', 'remember this #urgent'],
        ['#todo', '#todo remember this #urgent', 'remember this #urgent'],
        ['#todo', 'remember #todo this #urgent', 'remember this #urgent'],
        ['#todo', 'remember this #todo #urgent', 'remember this #urgent'],
        ['#todo', 'remember this #urgent #todo', 'remember this #urgent'],

        // Corner cases
        ['#todo', '#todo', ''],
        // In case the filter is present several time it is not filtered still...
        ['#todo', '#todo #todo', '#todo'],
        ['#todo', '#todo #todo #todo ', '#todo'],
        // Note the extra space between the 2 in the result. Different from non-tag filter
        ['#todo', '#todo #todo #todo #todo #todo', '#todo  #todo'],
        //  Somehow there is a trailing space at the beggining in both tests below
        ['#todo', '#todoandsomething', ' #todoandsomething'],
        ['#todo', '#todo/somethingelse', ' #todo/somethingelse'],
    ])(
        'should display task description (tag-like Global Filter: "%s", task: "%s", display: "%s"))',
        (globalFilter: string, taskLine: string, expectedDescription: string) => {
            GlobalFilter.set(globalFilter);
            testDescriptionRender(taskLine, expectedDescription);
        },
    );
});

describe('Task editing vs Global Filter', () => {
    let resolvePromise: (input: string) => void;
    let waitForClose: Promise<string>;
    let onSubmit: (updatedTasks: Task[]) => void;

    beforeEach(() => {
        waitForClose = new Promise<string>((resolve, _) => {
            resolvePromise = resolve;
        });
        onSubmit = (updatedTasks: Task[]): void => {
            const serializedTask = DateFallback.removeInferredStatusIfNeeded(task, updatedTasks)
                .map((task: Task) => task.toFileLineString())
                .join('\n');
            resolvePromise(serializedTask);
        };
    });

    afterEach(() => {
        GlobalFilter.reset();
    });

    async function testDescriptionEdit(taskDescription: string, newDescription: string, expectedDescription: string) {
        const task = taskFromLine({ line: `- [ ] ${taskDescription}`, path: '' });
        const result = render(EditTask, { task, statusOptions, onSubmit });
        const { container } = result;
        expect(() => container).toBeTruthy();

        const description = container.ownerDocument.getElementById('description') as HTMLInputElement;
        expect(description).toBeTruthy();
        const submit = result.getByText('Apply') as HTMLButtonElement;
        expect(submit).toBeTruthy();

        await fireEvent.input(description, { target: { value: newDescription } });
        submit.click();
        const editedTask = await waitForClose;
        expect(editedTask).toEqual(`- [ ] ${expectedDescription}`);
    }

    it.each([
        // Empty Global Filter
        ['', 'simple task #remember', 'simple task #remember', 'simple task #remember'],
        ['', 'simple task #remember', 'task edited', 'task edited'],

        // Non-Tag Global Filter - no edit
        // Global Filter is moved forward and all extra instances removed
        ['STUFF', 'STUFF heavy duty', 'heavy duty', 'STUFF heavy duty'],
        ['STUFF', 'heavy duty STUFF', 'heavy duty', 'STUFF heavy duty'],
        ['STUFF', 'heavy STUFF duty', 'heavy duty', 'STUFF heavy duty'],
        ['STUFF', 'STUFF STUFF heavy duty', 'heavy duty', 'STUFF heavy duty'],
        ['STUFF', 'heavy duty STUFF STUFF', 'heavy duty', 'STUFF heavy duty'],
        ['STUFF', 'heavy STUFF STUFF duty', 'heavy duty', 'STUFF heavy duty'],
        // Why the test is crashing here?
        //['STUFF', 'STUFF', '', 'STUFF'],

        // Non-Tag Global Filter - edited
        // Global Filter multiplied if present in the edit
        ['STUFF', 'STUFF heavy duty', 'STUFF duty edited', 'STUFF STUFF duty edited'],
        // Global Filter moved forward
        ['STUFF', 'heavy duty STUFF', 'duty edited', 'STUFF duty edited'],
        // Global Filter moved forward and one instance removed
        ['STUFF', 'heavy STUFF duty STUFF', 'duty edited', 'STUFF duty edited'],
        ['STUFF', 'STUFF STUFF heavy duty', 'duty edited', 'STUFF duty edited'],
        ['STUFF', 'STUFF', 'duty edited', 'STUFF duty edited'],

        // Tag Global Filter - no edit (no difference with non-tag Global Filter)
        // Global Filter is moved forward and all extra instances removed
        ['#remember', '#remember simple task', 'simple task', '#remember simple task'],
        ['#remember', 'simple task #remember', 'simple task', '#remember simple task'],
        ['#remember', 'simple #remember task', 'simple task', '#remember simple task'],
        ['#remember', '#remember #remember simple task', 'simple task', '#remember simple task'],
        ['#remember', 'simple task #remember #remember', 'simple task', '#remember simple task'],
        ['#remember', 'simple #remember #remember task', 'simple task', '#remember simple task'],
        // Why the test is crashing here?
        //['#remember', '#remember', '', '#remember'],

        // Tag Global Filter - edited (no difference with non-tag Global Filter)
        // Global Filter multiplied if present in the edit
        ['#remember', '#remember simple task', '#remember task edited', '#remember #remember task edited'],
        // Global Filter moved forward
        ['#remember', 'simple task #remember', 'task edited', '#remember task edited'],
        // Global Filter moved forward and one instance removed
        ['#remember', 'simple #remember task #remember', 'task edited', '#remember task edited'],
        ['#remember', '#remember #remember simple task', 'task edited', '#remember task edited'],
        ['#remember', '#remember', 'task edited', '#remember task edited'],
    ])(
        'should edit task description (Global Filter: "%s", original description: "%s", new: "%s", set: "%s")',
        async (globalFilter: string, taskDescription: string, newDescription: string, expectedDescription: string) => {
            GlobalFilter.set(globalFilter);
            await testDescriptionEdit(taskDescription, newDescription, expectedDescription);
        },
    );
});
