import { ensureTaskHasUniqueId } from '../../src/Api/TaskV1';
import type { TaskV1 } from '../../src/Api/TasksApiV2';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

const originalCrypto = globalThis.crypto;

const makeTaskV1 = (overrides: Partial<TaskV1> = {}): TaskV1 => ({
    id: '',
    description: 'Do the thing',
    status: ' ',
    priority: '',
    createdDate: null,
    startDate: null,
    scheduledDate: null,
    dueDate: null,
    doneDate: null,
    cancelledDate: null,
    recurrenceRule: '',
    onCompletion: '',
    dependsOn: [],
    tags: [],
    blockLink: '',
    originalMarkdown: '- [ ] Do the thing',
    path: 'tasks.md',
    lineNumber: 1,
    ...overrides,
});

const mockCryptoValues = (...values: number[][]) => {
    const getRandomValues = jest.fn((array: Uint8Array) => {
        array.set(values.shift() ?? []);
        return array;
    });

    Object.defineProperty(globalThis, 'crypto', {
        value: { getRandomValues },
        configurable: true,
    });

    return getRandomValues;
};

describe('ensureTaskHasUniqueId', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        Object.defineProperty(globalThis, 'crypto', {
            value: originalCrypto,
            configurable: true,
        });
    });

    it('returns the same object when the task already has a non-empty id', () => {
        const task = makeTaskV1({ id: 'existing-id' });

        const result = ensureTaskHasUniqueId(task, []);

        expect(result).toBe(task);
    });

    it('returns a copy with a new unique id when the task has no id', () => {
        const task = makeTaskV1();
        const existingTask = new TaskBuilder().id('existing-id').build();

        const result = ensureTaskHasUniqueId(task, [existingTask]);

        expect(result).not.toBe(task);
        expect(result.id).not.toBe('');
        expect(result.id).not.toBe(existingTask.id);
        expect(result.id).toMatch(/^[a-zA-Z0-9-_]+$/);
    });

    it('retries when the generated id already belongs to an existing task', () => {
        const getRandomValues = mockCryptoValues([0, 1, 2, 3, 4, 5, 6, 7], [8, 9, 10, 11, 12, 13, 14, 15]);
        const task = makeTaskV1();
        const existingTask = new TaskBuilder().id('abcdefgh').build();

        const result = ensureTaskHasUniqueId(task, [existingTask]);

        expect(result.id).toBe('ijklmnop');
        expect(result.id).not.toBe(existingTask.id);
        expect(getRandomValues).toHaveBeenCalledTimes(2);
    });

    it('does not mutate the original task when generating an id', () => {
        const task = makeTaskV1();

        const result = ensureTaskHasUniqueId(task, []);

        expect(result.id).not.toBe('');
        expect(task.id).toBe('');
    });
});
