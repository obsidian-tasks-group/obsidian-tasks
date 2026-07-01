import { queryTasks } from '../../src/Api/queryTasks';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

describe('queryTasks', () => {
    it('returns matching tasks as TaskV1 objects', () => {
        const matchingTask = new TaskBuilder().description('Do this').tags(['#work']).build();
        const otherTask = new TaskBuilder().description('Ignore this').build();

        const result = queryTasks('description includes Do', [matchingTask, otherTask]);

        expect(result).toHaveLength(1);
        expect(result[0].description).toBe('Do this #work');
    });

    it('returns each matching task only once when grouped by multiple tags', () => {
        const task = new TaskBuilder().description('Do this').tags(['#a', '#b']).build();

        const result = queryTasks('description includes Do\ngroup by tags', [task]);

        expect(result).toHaveLength(1);
        expect(result[0].description).toBe('Do this #a #b');
    });

    it('throws query parser errors', () => {
        expect(() => queryTasks('not a valid instruction', [])).toThrow(/do not understand query/);
    });
});
