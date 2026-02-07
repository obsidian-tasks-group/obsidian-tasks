/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import { Notice } from 'obsidian';
import {
    createSetStatusCommands,
    createSetStatusLineTransformer,
    setStatusOnLine,
} from '../../src/Commands/CreateSetStatusLineTransformer';
import { Status } from '../../src/Statuses/Status';
import { StatusRegistry } from '../../src/Statuses/StatusRegistry';
import { StatusConfiguration, StatusType } from '../../src/Statuses/StatusConfiguration';

jest.mock('obsidian', () => ({
    Notice: jest.fn(),
}));

window.moment = moment;

describe('setStatusOnLine', () => {
    it('should return undefined for a non-task line', () => {
        const result = setStatusOnLine('This is not a task', 'file.md', Status.DONE);
        expect(result).toBeUndefined();
    });

    it('should return undefined for an empty line', () => {
        const result = setStatusOnLine('', 'file.md', Status.DONE);
        expect(result).toBeUndefined();
    });

    it('should return an EditorInsertion for a valid task line', () => {
        const result = setStatusOnLine('- [ ] A simple task', 'file.md', Status.DONE);
        expect(result).toBeDefined();
        expect(result).toHaveProperty('text');
        expect(result).toHaveProperty('moveTo');
    });

    it('should set moveTo.line to 0 for a single-line result', () => {
        const result = setStatusOnLine('- [ ] A simple task', 'file.md', Status.DONE);
        expect(result).toBeDefined();
        expect(result!.moveTo).toEqual({ line: 0 });
    });

    it('should return multiple lines with moveTo.line as last line index for a recurring task', () => {
        const result = setStatusOnLine('- [ ] A recurring task 🔁 every day 📅 2022-09-04', 'file.md', Status.DONE);
        expect(result).toBeDefined();
        const lines = result!.text.split('\n');
        expect(lines.length).toBeGreaterThan(1);
        expect(result!.moveTo).toEqual({ line: lines.length - 1 });
    });
});

describe('createSetStatusLineTransformer', () => {
    const MockedNotice = jest.mocked(Notice);

    beforeEach(() => {
        MockedNotice.mockClear();
    });

    it('should change the status of a task line', () => {
        const transformer = createSetStatusLineTransformer(Status.DONE);
        const result = transformer('- [ ] A simple task', 'file.md');
        expect(result).toBeDefined();
        expect(result).toHaveProperty('text');
        expect(result).toHaveProperty('moveTo');
    });

    it('should mark a task as done', () => {
        const transformer = createSetStatusLineTransformer(Status.DONE);
        const result = transformer('- [ ] A simple task', 'file.md');
        expect(result!.text).toContain('- [x] A simple task');
    });

    it('should do nothing when the line is not a task', () => {
        const transformer = createSetStatusLineTransformer(Status.DONE);
        const result = transformer('This is not a task', 'file.md');
        expect(result).toBeUndefined();
    });

    it('should notify the user when the line is not a task', () => {
        const transformer = createSetStatusLineTransformer(Status.DONE);
        transformer('This is not a task', 'file.md');
        expect(MockedNotice).toHaveBeenCalledWith(
            'Cannot set status: line is not a task or does not match global filter',
        );
    });

    it('should not notify the user when changing a valid task', () => {
        const transformer = createSetStatusLineTransformer(Status.DONE);
        transformer('- [ ] A simple task', 'file.md');
        expect(MockedNotice).not.toHaveBeenCalled();
    });
});

describe('Set Status Commands', () => {
    let registry: StatusRegistry;
    beforeEach(() => {
        registry = new StatusRegistry();
        registry.clearStatuses();
    });

    it('should generate expected id and name', () => {
        registry.add(Status.TODO);
        registry.add(Status.IN_PROGRESS);

        const commands = createSetStatusCommands(registry);

        expect(commands.length).toBe(2);

        expect(commands[0].id).toBe('set-status-todo');
        expect(commands[0].name).toBe('Change status to: [ ] Todo');

        expect(commands[1].id).toBe('set-status-in-progress');
        expect(commands[1].name).toBe('Change status to: [/] In Progress');
    });

    // TODO Add a basic test of the command callback, just confirm that it does actually return a correctly modified task line

    it('should only create commands for the first of any statuses with duplicate symbols', () => {
        registry.add(new StatusConfiguration('A', 'Status 1', ' ', true, StatusType.TODO));
        registry.add(new StatusConfiguration('A', 'Status 2 - I should be ignored', ' ', true, StatusType.TODO));

        const commands = createSetStatusCommands(registry);
        expect(commands.length).toBe(1);
        expect(commands[0].name).toBe('Change status to: [A] Status 1');
    });

    it('should not create commands for Empty statuses', () => {
        // Users can create a new status, and then not populate it.
        // These are 'empty' statuses; the status symbol is an empty string.
        registry.add(Status.EMPTY);

        const commands = createSetStatusCommands(registry);
        expect(commands.length).toBe(0);
    });
});
