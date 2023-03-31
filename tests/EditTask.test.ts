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

describe('Task editing (UI) vs Global Filter', () => {
    let resolvePromise: (input: string) => void;
    //let waitForClose: Promise<string>;
    let onSubmit: (updatedTasks: Task[]) => void;

    beforeEach(() => {
        /*waitForClose = new Promise<string>((resolve, _) => {
            resolvePromise = resolve;
        });*/
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

    function testDescriptionRender(taskLine: string, expectedDescription: string) {
        const task = taskFromLine({ line: taskLine, path: '' });
        const { container } = render(EditTask, { task, statusOptions, onSubmit });
        expect(() => container).toBeTruthy();
        const description = container.ownerDocument.getElementById('description') as HTMLInputElement;
        expect(() => description).toBeTruthy();
        expect(description!.value).toEqual(expectedDescription);
    }

    it('task description should be displayed (empty Global Filter)', () => {
        GlobalFilter.set('');
        testDescriptionRender('- [ ] important thing', 'important thing');
    });

    it.each([
        // Nominal cases
        ['filter', '- [ ] filter important thing', 'important thing'],
        ['filter', '- [ ] important filter thing', 'important thing'],
        ['filter', '- [ ] important thing filter', 'important thing'],

        // Corner cases
        ['filter', '- [ ]', ''],
        ['filter', '- [ ] filter', ''],
        ['filter', '- [ ] filterandsomething', 'filterandsomething'],
        ['filter', '- [ ] filter/somethingelse', 'filter/somethingelse'],
    ])(
        'task description should be displayed (non-tag Global Filter)',
        (globalFilter: string, taskLine: string, expectedDescription: string) => {
            GlobalFilter.set(globalFilter);
            testDescriptionRender(taskLine, expectedDescription);
        },
    );

    it.each([
        // Nominal cases
        ['#todo', '- [ ] #todo another plan', 'another plan'],
        ['#todo', '- [ ] another #todo plan', 'another plan'],
        ['#todo', '- [ ] another plan #todo', 'another plan'],

        // Multiple tags
        ['#todo', '- [ ] remember this #urgent', 'remember this #urgent'],
        ['#todo', '- [ ] #todo remember this #urgent', 'remember this #urgent'],
        ['#todo', '- [ ] remember #todo this #urgent', 'remember this #urgent'],
        ['#todo', '- [ ] remember this #todo #urgent', 'remember this #urgent'],
        ['#todo', '- [ ] remember this #urgent #todo', 'remember this #urgent'],

        // Corner cases
        ['#todo', '- [ ]', ''],
        ['#todo', '- [ ] #todo', ''],
        //  Somehow there is a trailing space at the beggining in both tests below
        ['#todo', '- [ ] #todoandsomething', ' #todoandsomething'],
        ['#todo', '- [ ] #todo/somethingelse', ' #todo/somethingelse'],
    ])(
        'task description should be displayed (tag-like Global Filter)',
        (globalFilter: string, taskLine: string, expectedDescription: string) => {
            GlobalFilter.set(globalFilter);
            testDescriptionRender(taskLine, expectedDescription);
        },
    );
});
