import { StatusField } from '../../../src/Query/Filter/StatusField';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { Status } from '../../../src/Statuses/Status';
import * as TestHelpers from '../../TestingTools/TestHelpers';
import {
    expectTaskComparesAfter,
    expectTaskComparesBefore,
    expectTaskComparesEqual,
} from '../../CustomMatchers/CustomMatchersForSorting';
import { StatusConfiguration, StatusType } from '../../../src/Statuses/StatusConfiguration';
import { fromLine } from '../../TestingTools/TestHelpers';
import { StatusRegistry } from '../../../src/Statuses/StatusRegistry';
import type { StatusCollection } from '../../../src/Statuses/StatusCollection';

beforeAll(() => {
    StatusRegistry.getInstance().resetToDefaultStatuses();
    const importantCycle: StatusCollection = [
        ['!', 'todo', 'X', 'TODO'],
        ['X', 'done', '!', 'DONE'],
    ];
    importantCycle.forEach((entry) => {
        const status = Status.createFromImportedValue(entry);
        StatusRegistry.getInstance().add(status);
    });
});

afterAll(() => {
    StatusRegistry.getInstance().resetToDefaultStatuses();
});

describe('status', () => {
    it('done', () => {
        // Arrange
        const filter = new StatusField().createFilterOrErrorMessage('done');

        // Assert
        expect(filter).not.toMatchTaskWithStatus(Status.TODO.configuration);
        expect(filter).toMatchTaskWithStatus(Status.DONE.configuration);
        expect(filter).toMatchTaskWithStatus(new StatusConfiguration('X', 'Really Done', 'x', true, StatusType.DONE));
        expect(filter).not.toMatchTaskWithStatus(Status.IN_PROGRESS.configuration);
        expect(filter).toMatchTaskWithStatus(Status.CANCELLED.configuration);
        expect(filter).not.toMatchTaskWithStatus(new StatusConfiguration('!', 'Todo', 'x', true, StatusType.TODO)); // 'done' checks type.
        expect(filter).toMatchTaskWithStatus(new StatusConfiguration('^', 'Non', 'x', true, StatusType.NON_TASK));
    });

    it('not done', () => {
        // Arrange
        const filter = new StatusField().createFilterOrErrorMessage('not done');

        // Assert
        expect(filter).toMatchTaskWithStatus(Status.TODO.configuration);
        expect(filter).not.toMatchTaskWithStatus(Status.DONE.configuration);
        expect(filter).not.toMatchTaskWithStatus(
            new StatusConfiguration('X', 'Really Done', 'x', true, StatusType.DONE),
        );
        expect(filter).toMatchTaskWithStatus(Status.IN_PROGRESS.configuration);
        expect(filter).not.toMatchTaskWithStatus(Status.CANCELLED.configuration);
        expect(filter).toMatchTaskWithStatus(new StatusConfiguration('!', 'Todo', 'x', true, StatusType.TODO)); // 'not done' type.
        expect(filter).not.toMatchTaskWithStatus(new StatusConfiguration('^', 'Non', 'x', true, StatusType.NON_TASK));
    });

    it('should honour original case, when explaining simple filters', () => {
        const filter = new StatusField().createFilterOrErrorMessage('NOT done');
        expect(filter).toHaveExplanation('NOT done');
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
        expectTaskComparesEqual(sorter, todoTask, TestHelpers.fromLine({ line: '- [!] Z' }));

        expectTaskComparesEqual(sorter, doneTask, doneTask);
        expectTaskComparesEqual(sorter, doneTask, TestHelpers.fromLine({ line: '- [-] Z' }));
        expectTaskComparesEqual(sorter, doneTask, TestHelpers.fromLine({ line: '- [x] Z' }));
        expectTaskComparesEqual(sorter, doneTask, TestHelpers.fromLine({ line: '- [X] Z' }));
        expectTaskComparesAfter(sorter, doneTask, TestHelpers.fromLine({ line: '- [!] Z' }));
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

describe('grouping by status', () => {
    it('supports grouping methods correctly', () => {
        expect(new StatusField()).toSupportGroupingWithProperty('status');
    });

    it.each([
        ['- [ ] a', ['Todo']],
        ['- [x] a', ['Done']],
        ['- [X] a', ['Done']],
        ['- [/] a', ['Todo']],
        ['- [-] a', ['Done']],
        ['- [!] a', ['Todo']],
    ])('task "%s" should have groups: %s', (taskLine: string, groups: string[]) => {
        // Arrange
        const grouper = new StatusField().createNormalGrouper();

        // Assert
        const tasks = [fromLine({ line: taskLine })];

        // Check this symbol has been registered, so we are not passing by luck:
        const symbol = tasks[0].status.symbol;
        expect(StatusRegistry.getInstance().bySymbol(symbol).type).not.toEqual(StatusType.EMPTY);

        expect({ grouper, tasks }).groupHeadingsToBe(groups);
    });

    it('should sort groups for StatusField', () => {
        const grouper = new StatusField().createNormalGrouper();
        const taskLines = ['- [ ] a', '- [x] a'];
        const tasks = taskLines.map((taskLine) => fromLine({ line: taskLine }));

        expect({ grouper, tasks }).groupHeadingsToBe(['Done', 'Todo']);
    });
});
