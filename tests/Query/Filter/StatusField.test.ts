import { StatusField } from '../../../src/Query/Filter/StatusField';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { Status } from '../../../src/Status';
import * as TestHelpers from '../../TestHelpers';
import {
    expectTaskComparesAfter,
    expectTaskComparesBefore,
    expectTaskComparesEqual,
} from '../../CustomMatchers/CustomMatchersForSorting';
import { StatusConfiguration, StatusType } from '../../../src/StatusConfiguration';

describe('status', () => {
    it('done', () => {
        // Arrange
        const filter = new StatusField().createFilterOrErrorMessage('done');

        // Assert
        expect(filter).not.toMatchTaskWithStatus(Status.makeTodo().configuration);
        expect(filter).toMatchTaskWithStatus(Status.makeDone().configuration);
        expect(filter).toMatchTaskWithStatus(new StatusConfiguration('X', 'Really Done', 'x', true, StatusType.DONE));
        expect(filter).not.toMatchTaskWithStatus(Status.makeInProgress().configuration);
        expect(filter).toMatchTaskWithStatus(Status.makeCancelled().configuration);
        expect(filter).not.toMatchTaskWithStatus(new StatusConfiguration('!', 'Todo', 'x', true, StatusType.TODO)); // 'done' checks type.
        expect(filter).toMatchTaskWithStatus(new StatusConfiguration('^', 'Non', 'x', true, StatusType.NON_TASK));
    });

    it('not done', () => {
        // Arrange
        const filter = new StatusField().createFilterOrErrorMessage('not done');

        // Assert
        expect(filter).toMatchTaskWithStatus(Status.makeTodo().configuration);
        expect(filter).not.toMatchTaskWithStatus(Status.makeDone().configuration);
        expect(filter).not.toMatchTaskWithStatus(
            new StatusConfiguration('X', 'Really Done', 'x', true, StatusType.DONE),
        );
        expect(filter).toMatchTaskWithStatus(Status.makeInProgress().configuration);
        expect(filter).not.toMatchTaskWithStatus(Status.makeCancelled().configuration);
        expect(filter).toMatchTaskWithStatus(new StatusConfiguration('!', 'Todo', 'x', true, StatusType.TODO)); // 'not done' type.
        expect(filter).not.toMatchTaskWithStatus(new StatusConfiguration('^', 'Non', 'x', true, StatusType.NON_TASK));
    });
});

describe('sorting by status', () => {
    const doneTask = new TaskBuilder().status(Status.DONE).build();
    const todoTask = new TaskBuilder().status(Status.TODO).build();

    it('supports Field sorting methods correctly', () => {
        const field = new StatusField();
        expect(field.supportsSorting()).toEqual(true);
    });

    it('sort by status', () => {
        // Arrange
        const sorter = new StatusField().createNormalSorter();

        // Assert
        expectTaskComparesAfter(sorter, doneTask, todoTask);

        expectTaskComparesBefore(sorter, todoTask, doneTask);
        expectTaskComparesBefore(sorter, todoTask, TestHelpers.fromLine({ line: '- [-] Z' }));
        expectTaskComparesBefore(sorter, todoTask, TestHelpers.fromLine({ line: '- [x] Z' }));
        expectTaskComparesBefore(sorter, todoTask, TestHelpers.fromLine({ line: '- [X] Z' }));
        expectTaskComparesBefore(sorter, todoTask, TestHelpers.fromLine({ line: '- [!] Z' }));

        expectTaskComparesEqual(sorter, doneTask, doneTask);
        expectTaskComparesEqual(sorter, doneTask, TestHelpers.fromLine({ line: '- [-] Z' }));
        expectTaskComparesEqual(sorter, doneTask, TestHelpers.fromLine({ line: '- [x] Z' }));
        expectTaskComparesEqual(sorter, doneTask, TestHelpers.fromLine({ line: '- [X] Z' }));
        expectTaskComparesEqual(sorter, doneTask, TestHelpers.fromLine({ line: '- [!] Z' }));
    });

    it('sort by status reverse', () => {
        // Arrange
        const sorter = new StatusField().createReverseSorter();

        // Assert
        expectTaskComparesBefore(sorter, doneTask, todoTask);
        expectTaskComparesAfter(sorter, todoTask, doneTask);
        expectTaskComparesEqual(sorter, doneTask, doneTask);
    });
});
