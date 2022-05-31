import type { FilterOrErrorMessage } from '../../src/Query/Filter/Filter';
import type { Task } from '../../src/Task';

/**
 * Convenience function to test a Filter on a single Task
 *
 * @param filter - a FilterOrErrorMessage, which should have a valid Filter.
 * @param task - the Task to filter.
 * @param expected true if the task should match the filter, and false otherwise.
 */
export function testTaskFilter(
    filter: FilterOrErrorMessage,
    task: Task,
    expected: boolean,
) {
    expect(filter.filter).toBeDefined();
    expect(filter.error).toBeUndefined();
    expect(filter.filter!(task)).toEqual(expected);
}
