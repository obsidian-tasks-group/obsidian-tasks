/**
 * @jest-environment jsdom
 */
import type { Moment } from 'moment';
import moment from 'moment';
import { Task } from '../src/Task';
import { resetSettings, updateSettings } from '../src/Config/Settings';
import { DateFallback } from '../src/DateFallback';
import { TaskLocation } from '../src/TaskLocation';
import { TaskBuilder } from './TestingTools/TaskBuilder';

jest.mock('obsidian');
window.moment = moment;

function date(value: string | null): Moment | null {
    return value == null ? null : window.moment(value, 'YYYY-MM-DD');
}

describe('extract date from filename', () => {
    const ANY_FOLDER: string[] = [];

    type TestCase = {
        path: string;
        expectedDate: string | null;
        useFilenameAsScheduledDate?: boolean;
        filenameAsDateFolders?: string[];
    };

    const testDefaults: Partial<TestCase> = {
        useFilenameAsScheduledDate: true,
        filenameAsDateFolders: ANY_FOLDER,
    };

    test.each<TestCase>([
        {
            path: '2022-10-22.md',
            useFilenameAsScheduledDate: false,
            expectedDate: null,
        },
        {
            path: '2022-10-22.md',
            expectedDate: '2022-10-22',
        },
        {
            path: '2022-10-22.md',
            expectedDate: '2022-10-22',
        },
        {
            path: 'prefix-2022-10-22.md',
            expectedDate: '2022-10-22',
        },
        {
            path: '2022-10-22-suffix.md',
            expectedDate: '2022-10-22',
        },
        {
            path: 'p2022-10-22s.md',
            expectedDate: '2022-10-22',
        },
        {
            path: 'folder/2022-10-22.md',
            expectedDate: '2022-10-22',
        },
        {
            path: 'folder/prefix-2022-10-22.md',
            expectedDate: '2022-10-22',
        },
        {
            path: 'folder/2022-10-22-suffix.md',
            expectedDate: '2022-10-22',
        },
        {
            path: 'folder/prefix-2022-10-22-suffix.md',
            expectedDate: '2022-10-22',
        },
        {
            path: 'folder/p2022-10-22-suffix.md',
            expectedDate: '2022-10-22',
        },
        {
            path: 'folder/prefix-2022-10-22x.md',
            expectedDate: '2022-10-22',
        },
        {
            path: '2022-10-22.md',
            expectedDate: '2022-10-22',
        },
        {
            path: '20221022.md',
            expectedDate: '2022-10-22',
        },
        {
            path: 'folder/20221022.md',
            expectedDate: '2022-10-22',
        },
        {
            path: 'folder/prefix-20221022-suffix.md',
            expectedDate: '2022-10-22',
        },
        {
            path: 'short.md',
            expectedDate: null,
        },
        {
            path: 'folder/02. prefix 2022-10-22.md',
            expectedDate: '2022-10-22',
        },
        {
            path: '2022-10-22 2022-10-29.md',
            expectedDate: '2022-10-22',
        },
        {
            path: '2022-10-22/2022-10-29.md',
            expectedDate: '2022-10-29',
        },
        {
            path: '2022/10-29.md',
            expectedDate: null,
        },
        {
            path: 'folder/2022-10-22.md',
            filenameAsDateFolders: ['folder'],
            expectedDate: '2022-10-22',
        },
        {
            path: 'folder/subfolder/2022-10-22.md',
            filenameAsDateFolders: ['folder'],
            expectedDate: '2022-10-22',
        },
        {
            path: '2022-10-22.md',
            filenameAsDateFolders: ['folder'],
            expectedDate: null,
        },
        {
            path: 'outside/2022-10-22.md',
            filenameAsDateFolders: ['folder'],
            expectedDate: null,
        },
        {
            path: 'folder2/2022-10-22.md',
            filenameAsDateFolders: ['folder1', 'folder2'],
            expectedDate: '2022-10-22',
        },
        {
            path: 'folder/2022-10-22.md',
            filenameAsDateFolders: ['folder', 'folder/subfolder'],
            expectedDate: '2022-10-22',
        },
        {
            path: 'folder/subfolder/2022-10-22.md',
            filenameAsDateFolders: ['folder', 'folder/subfolder'],
            expectedDate: '2022-10-22',
        },
        {
            path: 'folder/other-folder/2022-10-22.md',
            filenameAsDateFolders: ['folder', 'folder/subfolder'],
            expectedDate: '2022-10-22',
        },
    ])('%s', (testCase: TestCase) => {
        // Arrange
        const options = { ...testDefaults, ...testCase };

        updateSettings({
            useFilenameAsScheduledDate: options.useFilenameAsScheduledDate,
            filenameAsDateFolders: options.filenameAsDateFolders,
        });

        try {
            // Act
            const parsedDate = DateFallback.fromPath(testCase.path);

            // Assert
            if (testCase.expectedDate !== null) {
                expect(parsedDate).not.toBeNull();
                expect(parsedDate!.isSame(date(testCase.expectedDate))).toStrictEqual(true);
            } else {
                expect(parsedDate).toBeNull();
            }
        } finally {
            resetSettings();
        }
    });
});

function constructTaskFromLine(line: string, fallbackDate: string | null) {
    return Task.fromLine({
        line,
        taskLocation: TaskLocation.fromUnknownPosition('file.md'), // filename must be parsed before calling Task.fromLine, so irrelevant for these tests
        fallbackDate: date(fallbackDate),
    });
}

describe('parse task with date fallback', () => {
    beforeEach(() => {
        updateSettings({ useFilenameAsScheduledDate: true });
    });

    afterEach(() => {
        resetSettings();
    });

    it('should set scheduled date and mark as inferred', () => {
        // Arrange
        const line = '- [ ] this is a task';

        // Act
        const task = constructTaskFromLine(line, '2022-10-22');

        // Assert
        expect(task!.scheduledDate).not.toBeNull();
        expect(task!.scheduledDate!.isSame(date('2022-10-22'))).toStrictEqual(true);
        expect(task!.scheduledDateIsInferred).toBe(true);
    });

    it('should not detect dates if due date is set', () => {
        // Arrange
        const line = '- [ ] this is a task 📅 2022-11-20';

        // Act
        const task = constructTaskFromLine(line, '2022-10-22');

        // Assert
        expect(task!.scheduledDate).toBeNull();
        expect(task!.scheduledDateIsInferred).toBe(false);
    });

    it('should not detect dates if start date is set', () => {
        // Arrange
        const line = '- [ ] this is a task 🛫 2022-11-22';

        // Act
        const task = constructTaskFromLine(line, '2022-10-22');

        // Assert
        expect(task!.scheduledDate).toBeNull();
        expect(task!.scheduledDateIsInferred).toBe(false);
    });

    it('should preserve existing scheduled date', () => {
        // Arrange
        const line = '- [ ] this is a task ⏳ 2022-11-22';

        // Act
        const task = constructTaskFromLine(line, '2022-10-22');

        // Assert
        expect(task!.scheduledDate).not.toBeNull();
        expect(task!.scheduledDate!.isSame(date('2022-11-22'))).toStrictEqual(true);
        expect(task!.scheduledDateIsInferred).toBe(false);
    });

    it('should detect scheduled date even if task is done', () => {
        // Arrange
        const line = '- [x] this is a task ✅ 2022-10-22';

        // Act
        const task = constructTaskFromLine(line, '2022-10-22');

        // Assert
        expect(task!.scheduledDate).not.toBeNull();
        expect(task!.scheduledDate!.isSame(date('2022-10-22'))).toStrictEqual(true);
        expect(task!.scheduledDateIsInferred).toBe(true);
    });

    it('should not alter the representation when a date is detected', () => {
        // Arrange
        const line = '- [ ] this is a task';

        // Act
        const task = constructTaskFromLine(line, '2022-10-22');

        // Assert
        expect(task?.toFileLineString()).toEqual(line);
    });

    it('should not add the inferred scheduled date when toggled', () => {
        // Arrange
        // toggle from a completed to uncompleted task to avoid having to mock moment
        const line = '- [x] this is a task ✅ 2022-10-22';

        // Act
        const task = constructTaskFromLine(line, '2022-10-22');
        const toggled: Task = task!.toggle()[0];

        // Assert
        expect(toggled.scheduledDateIsInferred).toBe(true);
        expect(toggled.scheduledDate).not.toBeNull();
        expect(toggled.scheduledDate!.isSame(date('2022-10-22'))).toStrictEqual(true);
        expect(toggled.toFileLineString()).toBe('- [ ] this is a task');
    });
});

describe('update fallback date when path is changed', () => {
    beforeEach(() => {
        updateSettings({ useFilenameAsScheduledDate: true });
    });

    afterEach(() => {
        resetSettings();
    });

    type TestCase = {
        description: string;
        task: Task;
        newPath: string;
        expectedScheduledDate: Moment | null;
        expectedIsInferred: boolean;
    };

    test.each<TestCase>([
        {
            description: 'it should update fallback date',
            task: new TaskBuilder().scheduledDate('2022-10-28').scheduledDateIsInferred(true).build(),
            newPath: '2022-10-29.md',
            expectedScheduledDate: date('2022-10-29'),
            expectedIsInferred: true,
        },
        {
            description: 'it should use fallback if none before',
            task: new TaskBuilder().build(),
            newPath: '2022-10-29.md',
            expectedScheduledDate: date('2022-10-29'),
            expectedIsInferred: true,
        },
        {
            description: 'it should not override explicit scheduled date',
            task: new TaskBuilder().scheduledDate('2022-10-28').build(),
            newPath: '2022-10-29.md',
            expectedScheduledDate: date('2022-10-28'),
            expectedIsInferred: false,
        },
        {
            description: 'it should not use fallback if due date set',
            task: new TaskBuilder().dueDate('2022-10-28').build(),
            newPath: '2022-10-29.md',
            expectedScheduledDate: null,
            expectedIsInferred: false,
        },
        {
            description: 'it should not use fallback if start date set',
            task: new TaskBuilder().startDate('2022-10-28').build(),
            newPath: '2022-10-29.md',
            expectedScheduledDate: null,
            expectedIsInferred: false,
        },
        {
            description: 'it should remove existing fallback if none in new path',
            task: new TaskBuilder().scheduledDate('2022-10-28').scheduledDateIsInferred(true).build(),
            newPath: 'no-date.md',
            expectedScheduledDate: null,
            expectedIsInferred: false,
        },
        {
            description: 'it should not infer dates if none present',
            task: new TaskBuilder().build(),
            newPath: 'no-date.md',
            expectedScheduledDate: null,
            expectedIsInferred: false,
        },
        {
            description: 'it should keep explicit scheduled date',
            task: new TaskBuilder().scheduledDate('2022-10-28').build(),
            newPath: 'no-date.md',
            expectedScheduledDate: date('2022-10-28'),
            expectedIsInferred: false,
        },
    ])('update path: $description', ({ task, newPath, expectedScheduledDate, expectedIsInferred }: TestCase) => {
        // Arrange
        const fallbackDate = DateFallback.fromPath(newPath);

        // Act
        const updatedTask = DateFallback.updateTaskPath(task, newPath, fallbackDate);

        // Assert
        if (expectedScheduledDate === null) {
            expect(updatedTask.scheduledDate).toBeNull();
        } else {
            expect(updatedTask.scheduledDate!.isSame(expectedScheduledDate)).toStrictEqual(true);
        }

        expect(updatedTask.scheduledDateIsInferred).toBe(expectedIsInferred);
    });
});

describe('remove inferred status if scheduled date changed', () => {
    it('should keep scheduled-date-is-inferred if the date is the same', () => {
        // arrange
        const task = new TaskBuilder().scheduledDate('2022-11-11').scheduledDateIsInferred(true).build();

        const updatedTask = new TaskBuilder().scheduledDate('2022-11-11').scheduledDateIsInferred(true).build();

        // act
        const [processedTask] = DateFallback.removeInferredStatusIfNeeded(task, [updatedTask]);

        // assert
        expect(processedTask.scheduledDateIsInferred).toBe(true);
    });

    it('should remove scheduled-date-is-inferred if the date was changed', () => {
        // arrange
        const task = new TaskBuilder().scheduledDate('2022-11-11').scheduledDateIsInferred(true).build();

        const updatedTask = new TaskBuilder().scheduledDate('2022-11-15').scheduledDateIsInferred(false).build();

        // act
        const [processedTask] = DateFallback.removeInferredStatusIfNeeded(task, [updatedTask]);

        // assert
        expect(processedTask.scheduledDateIsInferred).toBe(false);
    });

    it('should not set scheduled-date-is-inferred if a scheduled date was added', () => {
        // arrange
        const task = new TaskBuilder().scheduledDateIsInferred(false).build();

        const updatedTask = new TaskBuilder().scheduledDate('2022-11-11').scheduledDateIsInferred(false).build();

        // act
        const [processedTask] = DateFallback.removeInferredStatusIfNeeded(task, [updatedTask]);

        // assert
        expect(processedTask.scheduledDateIsInferred).toBe(false);
    });
});
