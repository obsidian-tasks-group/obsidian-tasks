/**
 * @jest-environment jsdom
 */

import { findTaskAtLine } from '../../src/Commands/MoveTask';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

describe('findTaskAtLine', () => {
    it('should return null when allTasks is empty', () => {
        const result = findTaskAtLine([], 'notes/test.md', 5);

        expect(result).toBeNull();
    });

    it('should return null when no task matches the path', () => {
        const task = new TaskBuilder().path('other/file.md').lineNumber(5).build();

        const result = findTaskAtLine([task], 'notes/test.md', 5);

        expect(result).toBeNull();
    });

    it('should return null when no task matches the line number', () => {
        const task = new TaskBuilder().path('notes/test.md').lineNumber(10).build();

        const result = findTaskAtLine([task], 'notes/test.md', 5);

        expect(result).toBeNull();
    });

    it('should return the task when path and line number match', () => {
        const task = new TaskBuilder().path('notes/test.md').lineNumber(5).description('My task').build();

        const result = findTaskAtLine([task], 'notes/test.md', 5);

        expect(result).toBe(task);
    });

    it('should match by both path and line number together', () => {
        // Task at correct line but wrong file
        const taskWrongFile = new TaskBuilder().path('other/file.md').lineNumber(5).build();
        // Task at correct file but wrong line
        const taskWrongLine = new TaskBuilder().path('notes/test.md').lineNumber(10).build();

        const result = findTaskAtLine([taskWrongFile, taskWrongLine], 'notes/test.md', 5);

        expect(result).toBeNull();
    });

    it('should return the first matching task when multiple tasks exist at same location', () => {
        // This shouldn't happen in practice, but test the behavior
        const task1 = new TaskBuilder().path('notes/test.md').lineNumber(5).description('First').build();
        const task2 = new TaskBuilder().path('notes/test.md').lineNumber(5).description('Second').build();

        const result = findTaskAtLine([task1, task2], 'notes/test.md', 5);

        expect(result).toBe(task1);
    });

    it('should find task among many tasks in the array', () => {
        const tasks = [
            new TaskBuilder().path('a.md').lineNumber(1).build(),
            new TaskBuilder().path('b.md').lineNumber(2).build(),
            new TaskBuilder().path('notes/test.md').lineNumber(5).description('Target').build(),
            new TaskBuilder().path('c.md').lineNumber(3).build(),
        ];

        const result = findTaskAtLine(tasks, 'notes/test.md', 5);

        expect(result).not.toBeNull();
        expect(result!.description).toBe('Target');
    });

    it('should handle line number 0', () => {
        const task = new TaskBuilder().path('notes/test.md').lineNumber(0).build();

        const result = findTaskAtLine([task], 'notes/test.md', 0);

        expect(result).toBe(task);
    });

    it('should handle paths with special characters', () => {
        const path = 'notes/my folder/test (1).md';
        const task = new TaskBuilder().path(path).lineNumber(5).build();

        const result = findTaskAtLine([task], path, 5);

        expect(result).toBe(task);
    });
});
