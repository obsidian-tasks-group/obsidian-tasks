/**
 * @jest-environment jsdom
 */
import moment from 'moment';

import { Task } from '../../src/Task';
import { TaskLocation } from '../../src/TaskLocation';
import { QuerySql } from '../../src/QuerySql/QuerySql';

window.moment = moment;

const taskLines = ['- [ ] neither', '- [ ] d1', '- [ ] d2', '- [ ] d1 d2'];

const tasks = taskLines.map(
    (taskLine) =>
        Task.fromLine({
            line: taskLine,
            taskLocation: TaskLocation.fromUnknownPosition(''),
            fallbackDate: null, // For tests scheduled date needs to be set explicitly
        }) as Task,
);

function runSqlQueryWithTasks(source: string, tasks: Task[], expected: Task[]) {
    const query = new QuerySql({ source: source, sourcePath: '', frontmatter: {} });
    const result = query.queryTasks(tasks);
    expect(result).toHaveLength(expected.length);
    expect(result).toEqual(expected);
}

describe('boolean query', () => {
    // These tests are intended to be really simple, so it is easy to reason about the correct behaviour of the code.
    describe('basic operators', () => {
        it('AND', () => {
            // Arrange
            const filter = "WHERE description LIKE '%d1%' AND description LIKE '%d2%'";

            // Act, Assert
            runSqlQueryWithTasks(filter, tasks, [tasks[3]]);
        });

        it('OR', () => {
            // Arrange
            const filter = "WHERE description LIKE '%d1%' OR description LIKE '%d2%'";

            // Act, Assert
            runSqlQueryWithTasks(filter, tasks, [tasks[1], tasks[2], tasks[3]]);
        });

        it('XOR', () => {
            // Arrange
            const filter = "WHERE (description LIKE '%d1%') <> (description LIKE '%d2%')";

            // Act, Assert
            runSqlQueryWithTasks(filter, tasks, [tasks[1], tasks[2]]);
        });

        it('NOT', () => {
            // Arrange
            const filter = "WHERE description NOT LIKE '%d1%'";

            // Act, Assert
            runSqlQueryWithTasks(filter, tasks, [tasks[0], tasks[2]]);
        });

        it('AND NOT', () => {
            // Arrange
            const filter = "WHERE  description LIKE '%d1%' AND description NOT LIKE '%d2%'";

            // Act, Assert
            runSqlQueryWithTasks(filter, tasks, [tasks[1]]);
        });

        it('OR NOT', () => {
            // Arrange
            const filter = "WHERE (description LIKE '%d1%') OR NOT (description LIKE '%d2%')";

            // Act, Assert
            runSqlQueryWithTasks(filter, tasks, [tasks[0], tasks[1], tasks[3]]);
        });
    });
});
