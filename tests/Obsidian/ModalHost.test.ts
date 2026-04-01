/**
 * @jest-environment jsdom
 */

import moment from 'moment/moment';
import type { App } from 'obsidian';

import { taskFromLine } from '../../src/Commands/CreateOrEditTaskParser';
import { OptionsModal } from '../../src/Obsidian/OptionsModal';
import { TaskModal } from '../../src/Obsidian/TaskModal';

window.moment = moment;

const app = {} as App;

async function waitForUnmountToFinish() {
    await Promise.resolve();
    await Promise.resolve();
}

describe('TaskModal host lifecycle', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('mounts EditTask on open and unmounts it on close', async () => {
        const task = taskFromLine({ line: '- [ ] test', path: '' });
        expect(task).toBeTruthy();

        const onSaveSettings = jest.fn(async () => {});
        const onSubmit = jest.fn();
        const modal = new TaskModal({
            app,
            task: task!,
            onSaveSettings,
            onSubmit,
            allTasks: [task!],
        });

        modal.open();

        expect(modal.contentEl.childElementCount).toBeGreaterThan(0);
        expect(modal.titleEl.textContent).toBe('Create or edit Task');

        modal.close();

        await waitForUnmountToFinish();

        expect(modal.contentEl.childElementCount).toBe(0);
    });
});

describe('OptionsModal host lifecycle', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('mounts ModalOptionsEditor on open and unmounts it on close', async () => {
        const onSave = jest.fn();
        const modal = new OptionsModal({ app, onSave });

        modal.open();

        expect(modal.contentEl.childElementCount).toBeGreaterThan(0);
        expect(modal.titleEl.textContent).toBe('Hide unused fields');

        modal.close();

        await waitForUnmountToFinish();

        expect(modal.contentEl.childElementCount).toBe(0);
    });
});
