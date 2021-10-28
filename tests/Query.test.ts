import { getSettings, updateSettings } from '../src/Settings';
import { Query } from '../src/Query';
import { Priority, Status, Task } from '../src/Task';

describe('Query', () => {
    describe('filtering', () => {
        it('filters paths case insensitive', () => {
            // Arrange
            const tasks = [
                new Task({
                    status: Status.Todo,
                    description: 'description',
                    path: 'Ab/C D',
                    indentation: '',
                    sectionStart: 0,
                    sectionIndex: 0,
                    originalStatusCharacter: ' ',
                    precedingHeader: null,
                    priority: Priority.None,
                    startDate: null,
                    scheduledDate: null,
                    dueDate: null,
                    doneDate: null,
                    recurrence: null,
                    blockLink: '',
                }),
                new Task({
                    status: Status.Todo,
                    description: 'description',
                    path: 'FF/C D',
                    indentation: '',
                    sectionStart: 0,
                    sectionIndex: 0,
                    originalStatusCharacter: ' ',
                    precedingHeader: null,
                    priority: Priority.None,
                    startDate: null,
                    scheduledDate: null,
                    dueDate: null,
                    doneDate: null,
                    recurrence: null,
                    blockLink: '',
                }),
            ];
            const input = 'path includes ab/c d';
            const query = new Query({ source: input });

            // Act
            let filteredTasks = [...tasks];
            query.filters.forEach((filter) => {
                filteredTasks = filteredTasks.filter(filter);
            });

            // Assert
            expect(filteredTasks.length).toEqual(1);
            expect(filteredTasks[0]).toEqual(tasks[0]);
        });

        it('ignores the global filter when filtering', () => {
            // Arrange
            const originalSettings = getSettings();
            updateSettings({ globalFilter: '#task' });
            const tasks: Task[] = [
                Task.fromLine({
                    line: '- [ ] #task this does not include the word; only in the global filter',
                    sectionStart: 0,
                    sectionIndex: 0,
                    path: '',
                    precedingHeader: '',
                }),
                Task.fromLine({
                    line: '- [ ] #task this does: task',
                    sectionStart: 0,
                    sectionIndex: 0,
                    path: '',
                    precedingHeader: '',
                }),
            ] as Task[];
            const input = 'description includes task';
            const query = new Query({ source: input });

            // Act
            let filteredTasks = [...tasks];
            query.filters.forEach((filter) => {
                filteredTasks = filteredTasks.filter(filter);
            });

            // Assert
            expect(filteredTasks.length).toEqual(1);
            expect(filteredTasks[0]).toEqual(tasks[1]);

            // Cleanup
            updateSettings(originalSettings);
        });

        it('works without a global filter', () => {
            // Arrange
            const originalSettings = getSettings();
            updateSettings({ globalFilter: '' });
            const tasks: Task[] = [
                Task.fromLine({
                    line: '- [ ] this does not include the word at all',
                    sectionStart: 0,
                    sectionIndex: 0,
                    path: '',
                    precedingHeader: '',
                }),
                Task.fromLine({
                    line: '- [ ] #task this includes the word as a tag',
                    sectionStart: 0,
                    sectionIndex: 0,
                    path: '',
                    precedingHeader: '',
                }),
                Task.fromLine({
                    line: '- [ ] #task this does: task',
                    sectionStart: 0,
                    sectionIndex: 0,
                    path: '',
                    precedingHeader: '',
                }),
            ] as Task[];
            const input = 'description includes task';
            const query = new Query({ source: input });

            // Act
            let filteredTasks = [...tasks];
            query.filters.forEach((filter) => {
                filteredTasks = filteredTasks.filter(filter);
            });

            // Assert
            expect(filteredTasks.length).toEqual(2);
            expect(filteredTasks[0]).toEqual(tasks[1]);
            expect(filteredTasks[1]).toEqual(tasks[2]);

            // Cleanup
            updateSettings(originalSettings);
        });
    });

    describe('sorting instructions', () => {
        const cases: {
            input: string;
            output: { property: string; reverse: boolean }[];
        }[] = [
            {
                input: 'sort by status',
                output: [{ property: 'status', reverse: false }],
            },
            {
                input: 'sort by status\nsort by due',
                output: [
                    { property: 'status', reverse: false },
                    { property: 'due', reverse: false },
                ],
            },
        ];
        it.concurrent.each(cases)('sorting as %j', ({ input, output }) => {
            const query = new Query({ source: input });

            expect(query.sorting).toEqual(output);
        });
    });
});
