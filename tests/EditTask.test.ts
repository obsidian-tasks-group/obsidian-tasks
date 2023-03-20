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
