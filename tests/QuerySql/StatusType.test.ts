/**
 * @jest-environment jsdom
 */
import * as TestHelpers from '../TestHelpers';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { StatusType } from '../../src/StatusConfiguration';
import { QuerySql } from '../../src/QuerySql/QuerySql';
//import { Status } from '../../src/Status';
import type { Task } from '../../src/Task';

// Abbreviated names so that the markdown text is aligned
const todoTask = TestHelpers.fromLine({ line: '- [ ] Todo' });
const inprTask = TestHelpers.fromLine({ line: '- [/] In progress' });
const doneTask = TestHelpers.fromLine({ line: '- [x] Done' });
const cancTask = TestHelpers.fromLine({ line: '- [-] Cancelled' });
const unknTask = TestHelpers.fromLine({ line: '- [%] Unknown' });
const timeTask = TestHelpers.fromLine({ line: '- [T] Time' });
const non_Task = new TaskBuilder()
    .statusValues('^', 'non-task', 'x', false, StatusType.NON_TASK)
    .description('Non-task')
    .build();
//const emptTask = new TaskBuilder().status(Status.makeEmpty()).description('Empty task').build();

describe('status.name', () => {
    it('status.type is', () => {
        // Arrange
        const query = new QuerySql({
            source: ['WHERE isInProgress(status)'].join('\n'),
            sourcePath: '',
            frontmatter: {},
        });
        const tasksToTest = [cancTask, doneTask, inprTask, non_Task, todoTask, unknTask];

        // Act
        const result = query.queryTasks(tasksToTest) as Task[];

        // Assert
        expect(query.error).toBeUndefined();
        expect(result).toHaveLength(1);
        expect(result[0]).toStrictEqual(inprTask);
    });

    it('status.type is not', () => {
        // Arrange
        const query = new QuerySql({
            source: ['WHERE NOT isInProgress(status)'].join('\n'),
            sourcePath: '',
            frontmatter: {},
        });
        const tasksToTest = [cancTask, doneTask, inprTask, non_Task, todoTask, unknTask];

        // Act
        const result = query.queryTasks(tasksToTest) as Task[];

        // Assert
        expect(query.error).toBeUndefined();
        expect(result).toHaveLength(5);
        expect(result[0]).toStrictEqual(cancTask);
        expect(result[1]).toStrictEqual(doneTask);
        expect(result[2]).toStrictEqual(non_Task);
        expect(result[3]).toStrictEqual(todoTask);
        expect(result[4]).toStrictEqual(unknTask);
    });

    it('executes with a custom query', () => {
        // Arrange
        const query = new QuerySql({
            source: [
                "CREATE FUNCTION myIsInProgress AS ``function(status) {return (status.type == 'IN_PROGRESS' || status.symbol == 'T'); }``;",
                'WHERE myIsInProgress(status); ',
                '#ml',
            ].join('\n'),
            sourcePath: '',
            frontmatter: {},
        });
        const tasksToTest = [cancTask, doneTask, inprTask, non_Task, todoTask, unknTask, timeTask];

        // Act
        const result = query.queryTasks(tasksToTest) as Task[];

        // Assert
        expect(query.error).toBeUndefined();
        expect(result).toHaveLength(2);
        expect(result).toStrictEqual([inprTask, timeTask]);
    });
});

describe('sorting by status.name', () => {
    it('sort by status.name', () => {
        // Arrange
        const query = new QuerySql({
            source: ['ORDER BY statusTypeOrdering(status)'].join('\n'),
            sourcePath: '',
            frontmatter: {},
        });
        const tasksToTest = [cancTask, doneTask, inprTask, non_Task, todoTask, unknTask];

        // Act
        const result = query.queryTasks(tasksToTest) as Task[];

        // Assert
        expect(query.error).toBeUndefined();
        expect(result).toHaveLength(6);
        expect(result).toStrictEqual([inprTask, todoTask, unknTask, doneTask, cancTask, non_Task]);
    });

    it('sort by status.name reverse', () => {
        // Arrange
        const query = new QuerySql({
            source: ['ORDER BY statusTypeOrdering(status) DESC'].join('\n'),
            sourcePath: '',
            frontmatter: {},
        });
        const tasksToTest = [cancTask, doneTask, inprTask, non_Task, todoTask, unknTask];

        // Act
        const result = query.queryTasks(tasksToTest) as Task[];

        // Assert
        expect(query.error).toBeUndefined();
        expect(result).toHaveLength(6);
        expect(result).toStrictEqual([non_Task, cancTask, doneTask, todoTask, unknTask, inprTask]);
    });
});

// describe('grouping by status.type', () => {
//     it('supports Field grouping methods correctly', () => {
//         const field = new StatusTypeField();
//         expect(field.supportsGrouping()).toEqual(true);
//     });

//     it('group by status.type', () => {
//         // Arrange
//         const grouper = new StatusTypeField().createGrouper();

//         // // Assert
//         expect(grouper.grouper(inprTask)).toEqual(['1 IN_PROGRESS']);
//         expect(grouper.grouper(todoTask)).toEqual(['2 TODO']);
//         expect(grouper.grouper(unknTask)).toEqual(['2 TODO']);
//         expect(grouper.grouper(doneTask)).toEqual(['3 DONE']);
//         expect(grouper.grouper(cancTask)).toEqual(['4 CANCELLED']);
//         expect(grouper.grouper(non_Task)).toEqual(['5 NON_TASK']);
//         expect(grouper.grouper(emptTask)).toEqual(['6 EMPTY']); // won't be seen by users
//     });
// });
