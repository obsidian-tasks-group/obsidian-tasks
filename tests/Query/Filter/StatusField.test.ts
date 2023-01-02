import { StatusField } from '../../../src/Query/Filter/StatusField';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { toMatchTaskFromLine } from '../../CustomMatchers/CustomMatchersForFilters';
import { Status } from '../../../src/Status';
import * as TestHelpers from '../../TestHelpers';
import {
    expectTaskComparesAfter,
    expectTaskComparesBefore,
    expectTaskComparesEqual,
} from '../../CustomMatchers/CustomMatchersForSorting';

expect.extend({
    toMatchTaskFromLine,
});

describe('status', () => {
    it('done', () => {
        // Arrange
        const filter = new StatusField().createFilterOrErrorMessage('done');

        // Assert
        expect(filter).not.toMatchTaskFromLine('- [ ] X');
        expect(filter).toMatchTaskFromLine('- [x] X');
        expect(filter).toMatchTaskFromLine('- [X] X');
        expect(filter).toMatchTaskFromLine('- [/] X');
        expect(filter).toMatchTaskFromLine('- [-] X');
        expect(filter).toMatchTaskFromLine('- [!] X');
    });

    it('not done', () => {
        // Arrange
        const filter = new StatusField().createFilterOrErrorMessage('not done');

        // Assert
        expect(filter).toMatchTaskFromLine('- [ ] X');
        expect(filter).not.toMatchTaskFromLine('- [x] X');
        expect(filter).not.toMatchTaskFromLine('- [X] X');
        expect(filter).not.toMatchTaskFromLine('- [/] X');
        expect(filter).not.toMatchTaskFromLine('- [-] X');
        expect(filter).not.toMatchTaskFromLine('- [!] X');
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
