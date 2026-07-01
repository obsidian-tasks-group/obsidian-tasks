import { ensureTaskHasUniqueId } from '../../src/Api/TaskV1';
import type { TaskV1 } from '../../src/Api/TasksApiV2';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

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

const generatedIdFor = (randomValue: number): string => randomValue.toString(36).slice(2, 10);

describe('ensureTaskHasUniqueId', () => {
    afterEach(() => {
        jest.restoreAllMocks();
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
        const firstRandomValue = 0.5;
        const secondRandomValue = 0.25;
        const existingId = generatedIdFor(firstRandomValue);
        const uniqueId = generatedIdFor(secondRandomValue);
        jest.spyOn(Math, 'random').mockReturnValueOnce(firstRandomValue).mockReturnValueOnce(secondRandomValue);
        const task = makeTaskV1();
        const existingTask = new TaskBuilder().id(existingId).build();

        const result = ensureTaskHasUniqueId(task, [existingTask]);

        expect(result.id).toBe(uniqueId);
        expect(result.id).not.toBe(existingId);
        expect(Math.random).toHaveBeenCalledTimes(2);
    });

    it('retries when the generated id is empty', () => {
        const validRandomValue = 0.25;
        const validId = generatedIdFor(validRandomValue);
        jest.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(validRandomValue);
        const task = makeTaskV1();

        const result = ensureTaskHasUniqueId(task, []);

        expect(result.id).toBe(validId);
        expect(result.id).not.toBe('');
        expect(Math.random).toHaveBeenCalledTimes(2);
    });

    it('does not mutate the original task when generating an id', () => {
        const task = makeTaskV1();

        const result = ensureTaskHasUniqueId(task, []);

        expect(result.id).not.toBe('');
        expect(task.id).toBe('');
    });
});
