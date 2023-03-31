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

describe('Task rendering', () => {
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
        testDescriptionRender('important thing #todo', 'important thing #todo');
    });

    it('should display task description without non-tag Global Filter)', () => {
        GlobalFilter.set('filter');
        testDescriptionRender('filter important thing', 'important thing');
    });

    it('should display task description without tag-like Global Filter', () => {
        GlobalFilter.set('#todo');
        testDescriptionRender('#todo another plan', 'another plan');
    });
});

describe('Task editing', () => {
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
        GlobalFilter.set(globalFilter);
        await testDescriptionEdit(`${globalFilter} ${description}`, description, `${globalFilter} ${description}`);
    });

    it('should change the description if the task was edited and keep Global Filter', async () => {
        const globalFilter = '#remember';
        const oldDescription = 'simple task';
        const newDescription = 'new plan';
        GlobalFilter.set(globalFilter);
        await testDescriptionEdit(
            `${globalFilter} ${oldDescription}`,
            newDescription,
            `${globalFilter} ${newDescription}`,
        );
    });
});
