/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Status } from '../src/Status';
import { Priority, Task } from '../src/Task';
import { resetSettings, updateSettings } from '../src/Config/Settings';
import { GlobalFilter } from '../src/Config/GlobalFilter';
import type { StatusCollection } from '../src/StatusCollection';
import { StatusRegistry } from '../src/StatusRegistry';
import { TaskLocation } from '../src/TaskLocation';
import { fromLine } from './TestHelpers';
import { TaskBuilder } from './TestingTools/TaskBuilder';
import { RecurrenceBuilder } from './TestingTools/RecurrenceBuilder';

jest.mock('obsidian');
window.moment = moment;

describe('parsing', () => {
    it('parses a task from a line starting with hyphen', () => {
        // Arrange
        const line = '- [x] this is a done task 🗓 2021-09-12 ✅ 2021-06-20 ➕ 2023-03-07';

        // Act
        const task = fromLine({
            line,
        });

        // Assert
        expect(task).not.toBeNull();
        expect(task!.listMarker).toEqual('-');
        expect(task!.description).toEqual('this is a done task');
        expect(task!.status).toStrictEqual(Status.DONE);
        expect(task!.createdDate).toEqualMoment(moment('2023-03-07'));
        expect(task!.dueDate).toEqualMoment(moment('2021-09-12'));
        expect(task!.doneDate).toEqualMoment(moment('2021-06-20'));
        expect(task!.originalMarkdown).toStrictEqual(line);
        expect(task!.lineNumber).toEqual(0);
    });

    it('parses a task from a line starting with asterisk', () => {
        // Arrange
        const line = '* [ ] this is a task in asterisk list';

        // Act
        const task = fromLine({
            line,
        });

        // Assert
        expect(task).not.toBeNull();
        expect(task!.listMarker).toEqual('*');
        expect(task!.originalMarkdown).toStrictEqual(line);
    });

    it('parses a task from a line (numbered)', () => {
        // Arrange
        const line = '1. [x] this is a done task';

        // Act
        const task = fromLine({
            line,
        });

        // Assert
        expect(task).not.toBeNull();
        expect(task!.listMarker).toEqual('1.');
        expect(task!.description).toEqual('this is a done task');
        expect(task!.status).toStrictEqual(Status.DONE);
        expect(task!.originalMarkdown).toStrictEqual(line);
    });

    it('parses a task from a line (big number)', () => {
        // Arrange
        const line = '909999. [ ] this is a todo task';

        // Act
        const task = fromLine({
            line,
        });

        // Assert
        expect(task).not.toBeNull();
        expect(task!.listMarker).toEqual('909999.');
        expect(task!.description).toEqual('this is a todo task');
        expect(task!.status).toStrictEqual(Status.TODO);
        expect(task!.originalMarkdown).toStrictEqual(line);
    });

    it('returns null when task does not have global filter', () => {
        // Arrange
        GlobalFilter.set('#task');
        const line = '- [x] this is a done task 🗓 2021-09-12 ✅ 2021-06-20';

        // Act
        const task = fromLine({
            line,
        });

        // Assert
        expect(task).toBeNull();

        // Cleanup
        GlobalFilter.reset();
    });

    it('supports capitalised status characters', () => {
        // See https://github.com/obsidian-tasks-group/obsidian-tasks/issues/520
        // "In combination with SlrVb's S-Checkbox CSS, Task Plugin breaks that style"

        // Act
        const task = fromLine({ line: '- [D] this is a deferred task' });

        // Assert
        expect(task!.status.symbol).toStrictEqual('D');
    });

    // begin-snippet: example_basic_test
    it('allows signifier emojis as part of the description', () => {
        // Arrange
        const line = '- [x] this is a ✅ done task 🗓 2021-09-12 ✅ 2021-06-20';

        // Act
        const task = fromLine({
            line,
        });

        // Assert
        expect(task).not.toBeNull();
        expect(task!.description).toEqual('this is a ✅ done task');
        expect(task!.status).toStrictEqual(Status.DONE);
        expect(task!.dueDate).toEqualMoment(moment('2021-09-12'));
        expect(task!.doneDate).toEqualMoment(moment('2021-06-20'));
    });
    // end-snippet

    it('also works with block links and trailing spaces', () => {
        // Arrange
        const line = '- [x] this is a ✅ done task 🗓 2021-09-12 ✅ 2021-06-20 ^my-precious  ';

        // Act
        const task = fromLine({
            line,
        });

        // Assert
        expect(task).not.toBeNull();
        expect(task!.description).toEqual('this is a ✅ done task');
        expect(task!.status).toStrictEqual(Status.DONE);
        expect(task!.dueDate).toEqualMoment(moment('2021-09-12'));
        expect(task!.doneDate).toEqualMoment(moment('2021-06-20'));
        expect(task!.blockLink).toEqual(' ^my-precious');
    });

    it('supports tag anywhere in the description and separates them correctly from signifier emojis', () => {
        // Arrange
        const line = '- [ ] this is a task due 📅 2021-09-12 #inside_tag ⏫ #some/tags_with_underscore';

        // Act
        const task = fromLine({
            line,
        });

        // Assert
        expect(task).not.toBeNull();
        expect(task!.description).toEqual('this is a task due #inside_tag #some/tags_with_underscore');
        expect(task!.tags).toEqual(['#inside_tag', '#some/tags_with_underscore']);
        expect(task!.dueDate).toEqualMoment(moment('2021-09-12'));
        expect(task!.priority).toEqual(Priority.High);
    });

    it('supports parsing large number of values', () => {
        // Arrange
        const line =
            '- [ ] Wobble ⏫  #tag1 ✅ 2022-07-02 #tag2  📅 2022-07-02 #tag3 ⏳ 2022-07-02 #tag4 🛫 2022-07-02 #tag5  🔁 every day  #tag6 #tag7 #tag8 #tag9 #tag10';

        // Act
        const task = fromLine({
            line,
        });

        // Assert
        expect(task).not.toBeNull();
        expect(task!.description).toEqual('Wobble #tag1 #tag2 #tag3 #tag4 #tag5 #tag6 #tag7 #tag8 #tag9 #tag10');
        expect(task!.dueDate).toEqualMoment(moment('2022-07-02'));
        expect(task!.doneDate).toEqualMoment(moment('2022-07-02'));
        expect(task!.startDate).toEqualMoment(moment('2022-07-02'));
        expect(task!.scheduledDate).toEqualMoment(moment('2022-07-02'));
        expect(task!.priority).toEqual(Priority.High);
        expect(task!.tags).toStrictEqual([
            '#tag1',
            '#tag2',
            '#tag3',
            '#tag4',
            '#tag5',
            '#tag6',
            '#tag7',
            '#tag8',
            '#tag9',
            '#tag10',
        ]);
    });

    it('supports parsing of emojis with multiple spaces', () => {
        // Arrange
        const lines = [
            '- [ ] Wobble ✅2022-07-01 📅2022-07-02 ⏳2022-07-03 🛫2022-07-04 ➕2022-07-05 🔁every day',
            '- [ ] Wobble ✅ 2022-07-01 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 ➕ 2022-07-05 🔁 every day',
            '- [ ] Wobble ✅  2022-07-01 📅  2022-07-02 ⏳  2022-07-03 🛫  2022-07-04 ➕  2022-07-05 🔁  every day',
            '- [ ] Wobble ✅  2022-07-01 📅  2022-07-02 ⏳  2022-07-03 🛫  2022-07-04 ➕   2022-07-05 🔁  every day',
        ];
        // Act
        for (const line of lines) {
            const task = fromLine({
                line,
            });

            // Assert
            expect({
                _input: line, // Line is included, so it is shown in any failure output
                description: task.description,
                done: task.doneDate?.format('YYYY-MM-DD'),
                due: task.dueDate?.format('YYYY-MM-DD'),
                scheduled: task.scheduledDate?.format('YYYY-MM-DD'),
                start: task.startDate?.format('YYYY-MM-DD'),
                created: task.createdDate?.format('YYYY-MM-DD'),
                priority: task.priority,
                recurrence: task.recurrence?.toText(),
            }).toMatchObject({
                _input: line,
                description: 'Wobble',
                done: '2022-07-01',
                due: '2022-07-02',
                scheduled: '2022-07-03',
                start: '2022-07-04',
                created: '2022-07-05',
                priority: '3',
                recurrence: 'every day',
            });
        }
    });

    it('supports parsing of tasks inside blockquotes or callouts', () => {
        // Arrange
        const lines = [
            '> - [ ] Task inside a blockquote or callout 📅2022-07-29',
            '>>> - [ ] Task inside a blockquote or callout 📅2022-07-29',
            '> > > * [ ] Task inside a blockquote or callout 📅2022-07-29',
        ];

        // Act
        for (const line of lines) {
            const task = fromLine({
                line,
            });

            // Assert
            expect({
                _input: line, // Line is included, so it is shown in any failure output
                description: task.description,
                due: task.dueDate?.format('YYYY-MM-DD'),
                indentation: task.indentation,
            }).toMatchObject({
                _input: line,
                description: 'Task inside a blockquote or callout',
                due: '2022-07-29',
                indentation: line.split(/[-*]/)[0],
            });
        }
    });
});

type TagParsingExpectations = {
    markdownTask: string;
    expectedDescription: string;
    extractedTags: string[];
    globalFilter: string;
};

describe('parsing tags', () => {
    test.each<TagParsingExpectations>([
        {
            markdownTask: '- [x] this is a done task #tagone 🗓 2021-09-12 #another-tag ✅ 2021-06-20 #and_another',
            expectedDescription: 'this is a done task #tagone #another-tag #and_another',
            extractedTags: ['#tagone', '#another-tag', '#and_another'],
            globalFilter: '',
        },
        {
            markdownTask: '- [x] this is a done task #tagone #tagtwo 🗓 2021-09-12 ✅ 2021-06-20',
            expectedDescription: 'this is a done task #tagone #tagtwo',
            extractedTags: ['#tagone', '#tagtwo'],
            globalFilter: '',
        },
        {
            markdownTask: '- [ ] this is a normal task #tagone 🗓 2021-09-12 ✅ 2021-06-20',
            expectedDescription: 'this is a normal task #tagone',
            extractedTags: ['#tagone'],
            globalFilter: '',
        },
        {
            markdownTask: '- [ ] this is a normal task #tagone #tagtwo 🗓 2021-09-12 ✅ 2021-06-20',
            expectedDescription: 'this is a normal task #tagone #tagtwo',
            extractedTags: ['#tagone', '#tagtwo'],
            globalFilter: '',
        },
        {
            markdownTask: '- [ ] this is a normal task #tagone #tag/with/depth #tagtwo 🗓 2021-09-12 ✅ 2021-06-20',
            expectedDescription: 'this is a normal task #tagone #tag/with/depth #tagtwo',
            extractedTags: ['#tagone', '#tag/with/depth', '#tagtwo'],
            globalFilter: '',
        },

        {
            markdownTask: '- [x] #someglobaltasktag this is a done task #tagone 🗓 2021-09-12 ✅ 2021-06-20',
            expectedDescription: '#someglobaltasktag this is a done task #tagone',
            extractedTags: ['#tagone'],
            globalFilter: '#someglobaltasktag',
        },
        {
            markdownTask: '- [x] #someglobaltasktag this is a done task #tagone #tagtwo 🗓 2021-09-12 ✅ 2021-06-20',
            expectedDescription: '#someglobaltasktag this is a done task #tagone #tagtwo',
            extractedTags: ['#tagone', '#tagtwo'],
            globalFilter: '#someglobaltasktag',
        },
        {
            markdownTask: '- [ ] #someglobaltasktag this is a normal task #tagone 🗓 2021-09-12 ✅ 2021-06-20',
            expectedDescription: '#someglobaltasktag this is a normal task #tagone',
            extractedTags: ['#tagone'],
            globalFilter: '#someglobaltasktag',
        },
        {
            markdownTask:
                '- [ ] #someglobaltasktag this is a normal task #tagone #tagtwo 🗓 2021-09-12 #tagthree ✅ 2021-06-20 #tagfour',
            expectedDescription: '#someglobaltasktag this is a normal task #tagone #tagtwo #tagthree #tagfour',
            extractedTags: ['#tagone', '#tagtwo', '#tagthree', '#tagfour'],
            globalFilter: '#someglobaltasktag',
        },
        {
            markdownTask:
                '- [ ] #someglobaltasktag this is a normal task #tagone #tag/with/depth #tagtwo 🗓 2021-09-12 ✅ 2021-06-20',
            expectedDescription: '#someglobaltasktag this is a normal task #tagone #tag/with/depth #tagtwo',
            extractedTags: ['#tagone', '#tag/with/depth', '#tagtwo'],
            globalFilter: '#someglobaltasktag',
        },
        {
            markdownTask:
                '* [ ] Export [Cloud Feedly feeds](https://cloud.feedly.com/#opml) #context/pc_clare 🔁 every 4 weeks on Sunday ⏳ 2022-05-15 #context/more_context',
            expectedDescription:
                'Export [Cloud Feedly feeds](https://cloud.feedly.com/#opml) #context/pc_clare #context/more_context',
            extractedTags: ['#context/pc_clare', '#context/more_context'],
            globalFilter: '',
        },
        {
            markdownTask:
                '- [ ] Export [Cloud Feedly feeds](https://cloud.feedly.com/#opml) #context/pc_clare ⏳ 2022-05-15 🔁 every 4 weeks on Sunday #context/more_context',
            expectedDescription:
                'Export [Cloud Feedly feeds](https://cloud.feedly.com/#opml) #context/pc_clare #context/more_context',
            extractedTags: ['#context/pc_clare', '#context/more_context'],
            globalFilter: '',
        },
        {
            markdownTask:
                '- [ ] Review [savings accounts and interest rates](https://www.moneysavingexpert.com/tips/2022/04/20/#hiya) #context/pc_clare ⏳ 2022-05-06',
            expectedDescription:
                'Review [savings accounts and interest rates](https://www.moneysavingexpert.com/tips/2022/04/20/#hiya) #context/pc_clare',
            extractedTags: ['#context/pc_clare'],
            globalFilter: '',
        },
        {
            markdownTask: '> - [ ] Task inside a blockquote or callout #tagone',
            expectedDescription: 'Task inside a blockquote or callout #tagone',
            extractedTags: ['#tagone'],
            globalFilter: '',
        },
        {
            markdownTask: '>>> * [ ] Task inside a nested blockquote or callout #tagone',
            expectedDescription: 'Task inside a nested blockquote or callout #tagone',
            extractedTags: ['#tagone'],
            globalFilter: '',
        },
    ])(
        'should parse "$markdownTask" and extract "$extractedTags"',
        ({ markdownTask, expectedDescription, extractedTags, globalFilter }) => {
            // Arrange
            if (globalFilter != '') {
                GlobalFilter.set(globalFilter);
            }

            // Act
            const task = Task.fromLine({
                line: markdownTask,
                taskLocation: TaskLocation.fromUnknownPosition('file.md'),
                fallbackDate: null,
            });

            // Assert
            expect(task).not.toBeNull();
            expect(task!.description).toEqual(expectedDescription);
            expect(task!.tags).toStrictEqual(extractedTags);

            // Cleanup
            if (globalFilter != '') {
                GlobalFilter.reset();
            }
        },
    );
});

describe('backlinks', () => {
    function shouldGiveLinkText(
        path: string,
        heading: string | null,
        filenameUnique: boolean,
        expected: string | null,
    ) {
        expect(
            new TaskBuilder()
                .path(path)
                .precedingHeader(heading)
                .build()
                .getLinkText({ isFilenameUnique: filenameUnique }),
        ).toEqual(expected);
    }

    describe('valid and unique paths', () => {
        it('valid, unique path without heading should use filename as backlink', () => {
            shouldGiveLinkText('a/b/c.md', null, true, 'c');
        });

        it('valid, unique path with different heading should use filename and heading as backlink', () => {
            shouldGiveLinkText('a/b/c.md', 'heading', true, 'c > heading');
        });

        it('valid, unique path with same heading should use just filename as backlink', () => {
            shouldGiveLinkText('a/b/c.md', 'c', true, 'c');
        });
    });

    describe('valid non-unique paths', () => {
        it('valid, non-unique path without heading should use full path as backlink', () => {
            shouldGiveLinkText('a/b/c.md', null, false, '/a/b/c.md');
        });

        it('valid, non-unique path with different heading should use full path and heading as backlink', () => {
            shouldGiveLinkText('a/b/c.md', 'heading', false, '/a/b/c.md > heading');
        });

        it('valid, non-unique path with same heading as file name should use full path and heading as backlink', () => {
            shouldGiveLinkText('a/b/c.md', 'c', false, '/a/b/c.md > c');
        });

        it('valid, non-unique path with same heading as path name with initial slash should use just the path as backlink', () => {
            // This is not a realistic use-case, but is included to show the current behaviour of the code
            shouldGiveLinkText('a/b/c.md', '/a/b/c.md', false, '/a/b/c.md');
        });
    });

    describe('invalid unique paths', () => {
        // use invalid file extension to generate null filename
        // This is not a realistic use-case, but is included to show the current behaviour of the code

        it('invalid, unique path without heading should give null for backlink', () => {
            shouldGiveLinkText('a/b/c.markdown', null, true, null);
        });

        it('invalid, unique path with heading should give null for backlink', () => {
            shouldGiveLinkText('a/b/c.markdown', 'heading', true, null);
        });
    });

    describe('invalid non-unique paths', () => {
        // use invalid file extension to generate null filename
        // This is not a realistic use-case, but is included to show the current behaviour of the code

        it('invalid, non-unique path without heading uses path anyway for backlink', () => {
            shouldGiveLinkText('a/b/c.markdown', null, false, '/a/b/c.markdown');
        });

        it('invalid, non-unique path with heading uses path and backlink anyway for backlink', () => {
            shouldGiveLinkText('a/b/c.markdown', 'heading', false, '/a/b/c.markdown > heading');
        });
    });
});

describe('to string', () => {
    it('retains the indentation', () => {
        const line = '> > > - [ ] Task inside a nested blockquote or callout';

        // Act
        const task: Task = fromLine({
            line,
        }) as Task;

        // Assert
        expect(task).not.toBeNull();
        expect(task.toFileLineString()).toStrictEqual(line);
    });

    it('retains the asterisk', () => {
        const task = new TaskBuilder().listMarker('*').build();
        expect(task.toFileLineString()).toStrictEqual('* [ ] my description');
    });

    it('retains the block link', () => {
        // Arrange
        const line = '- [ ] this is a task 📅 2021-09-12 ^my-precious';

        // Act
        const task: Task = fromLine({
            line,
        }) as Task;

        // Assert
        expect(task).not.toBeNull();
        expect(task.toFileLineString()).toStrictEqual(line);
    });

    it('retains the tags', () => {
        // Arrange
        const line = '- [x] this is a done task #tagone 📅 2021-09-12 ✅ 2021-06-20 #journal/daily';

        // Act
        const task: Task = fromLine({
            line,
        }) as Task;

        // Assert
        const expectedLine = '- [x] this is a done task #tagone #journal/daily 📅 2021-09-12 ✅ 2021-06-20';
        expect(task.toFileLineString()).toStrictEqual(expectedLine);
    });

    it('retains the global filter', () => {
        // Arrange
        const line = '- [ ] This is a task with #t as a global filter and also #t/some tags';

        updateSettings({ globalFilter: '#t' });
        // Act
        const task: Task = fromLine({
            line,
        }) as Task;

        // Assert
        const expectedLine = 'This is a task with #t as a global filter and also #t/some tags';
        expect(task.toString()).toStrictEqual(expectedLine);
        resetSettings();
    });
});

describe('toggle done', () => {
    beforeAll(() => {
        const statuses: StatusCollection = [
            // A custom set of 3 statuses that form a cycle.
            // The last one has a conventional symbol, 'X' that is recognised as DONE.fix
            ['!', 'Important', 'D', 'TODO'],
            ['D', 'Doing - Important', 'X', 'IN_PROGRESS'],
            ['X', 'Done - Important', '!', 'DONE'],
            // A set that uses an unconventional symbol for DONE
            ['1', 'Status 1', '2', 'TODO'],
            ['2', 'Status 2', '3', 'IN_PROGRESS'],
            ['3', 'Status 3', '1', 'DONE'],
            // A set where the DONE task goes to an unknown symbol
            ['a', 'Status a', 'b', 'TODO'],
            ['b', 'Status b', 'c', 'DONE'], // c is not known
        ];
        statuses.forEach((s) => {
            StatusRegistry.getInstance().add(Status.createFromImportedValue(s));
        });
    });

    afterAll(() => {
        StatusRegistry.getInstance().resetToDefaultStatuses();
    });

    it('retains the block link', () => {
        // Arrange
        const line = '- [ ] this is a task 📅 2021-09-12 ^my-precious';

        // Act
        const task: Task = fromLine({
            line,
        }) as Task;
        const tasks = task.toggle();
        expect(tasks.length).toEqual(1);
        const toggled: Task = tasks[0];

        // Assert
        expect(toggled).not.toBeNull();
        expect(toggled!.status).toStrictEqual(Status.DONE);
        expect(toggled!.status.symbol).toStrictEqual('x');
        expect(toggled!.blockLink).toEqual(' ^my-precious');
    });

    it('removes done date after untoggle', () => {
        // Arrange
        const line = '- [x] I thought I finished ✅ 2021-09-12';

        // Act
        const task: Task = fromLine({
            line,
        }) as Task;
        const tasks = task.toggle();
        expect(tasks.length).toEqual(1);
        const toggled: Task = tasks[0];

        // Assert
        expect(toggled).not.toBeNull();
        expect(toggled!.status).toStrictEqual(Status.TODO);
        expect(toggled!.status.symbol).toStrictEqual(' ');
        expect(toggled!.doneDate).toBeNull();
    });

    type RecurrenceCase = {
        // inputs:
        interval: string;
        symbol?: string;
        due?: string;
        scheduled?: string;
        start?: string;
        today?: string;
        // results:
        doneSymbol?: string; // the symbol of the completed task
        nextSymbol?: string; // the symbol of the recurrence
        nextDue?: string;
        nextScheduled?: string;
        nextStart?: string;
        nextInterval?: string; // for when rrule re-words the recurrence interval, to simplify it
    };

    const recurrenceCases: Array<RecurrenceCase> = [
        {
            interval: 'every 7 days',
            due: '2021-02-21',
            nextDue: '2021-02-28',
        },
        {
            interval: 'every 7 days when done',
            due: '2021-02-21',
            today: '2021-02-18',
            nextDue: '2021-02-25',
        },
        {
            interval: 'every 7 days when done',
            due: '2021-02-21',
            today: '2021-02-22',
            nextDue: '2021-03-01',
        },
        {
            interval: 'every day',
            due: '2021-02-21',
            nextDue: '2021-02-22',
        },
        {
            interval: 'every day when done',
            due: '2021-02-21',
            today: '2022-01-04',
            nextDue: '2022-01-05',
        },
        {
            interval: 'every 4 weeks',
            due: '2021-10-15',
            nextDue: '2021-11-12',
        },
        {
            interval: 'every 4 weeks',
            due: '2021-10-12',
            nextDue: '2021-11-09',
        },
        {
            interval: 'every 4 weeks',
            due: '2022-10-12',
            nextDue: '2022-11-09',
        },
        {
            interval: 'every 4 weeks',
            due: '2033-10-12',
            nextDue: '2033-11-09',
        },
        {
            interval: 'every 3 weeks when done',
            due: '2022-01-10',
            today: '2021-01-14',
            nextDue: '2021-02-04',
        },
        {
            interval: 'every month',
            due: '2021-10-15',
            nextDue: '2021-11-15',
        },
        {
            interval: 'every month',
            due: '2021-10-18',
            nextDue: '2021-11-18',
        },
        {
            interval: 'every month when done',
            due: '2021-10-18',
            today: '2021-10-16',
            nextDue: '2021-11-16',
        },
        {
            interval: 'every month when done',
            due: '2021-10-18',
            today: '2021-10-24',
            nextDue: '2021-11-24',
        },
        {
            interval: 'every month on the 2nd Wednesday',
            due: '2021-09-08',
            nextDue: '2021-10-13',
        },
        {
            interval: 'every month on the 2nd Wednesday when done',
            due: '2021-09-08',
            today: '2021-09-15',
            nextDue: '2021-10-13',
        },
        {
            interval: 'every month on the 2nd Wednesday when done',
            due: '2021-09-08',
            today: '2021-10-12',
            nextDue: '2021-10-13',
        },
        {
            interval: 'every month on the 2nd Wednesday when done',
            due: '2021-09-08',
            today: '2021-10-13',
            nextDue: '2021-11-10',
        },
        {
            interval: 'every 3 months on the 3rd Thursday',
            due: '2021-04-15',
            nextDue: '2021-07-15',
        },
        {
            interval: 'every 3 months on the 3rd Thursday',
            due: '2021-08-19',
            nextDue: '2021-11-18',
        },
        {
            interval: 'every 3 months on the 3rd Thursday',
            due: '2021-09-16',
            nextDue: '2021-12-16',
        },
        {
            interval: 'every week on Monday, Wednesday, Friday',
            due: '2022-01-24',
            nextDue: '2022-01-26',
        },
        {
            interval: 'every week on Monday, Wednesday, Friday when done',
            due: '2022-01-24',
            today: '2022-01-25',
            nextDue: '2022-01-26',
        },
        {
            interval: 'every week on Monday, Wednesday, Friday when done',
            due: '2022-01-24',
            today: '2022-01-26',
            nextDue: '2022-01-28',
        },
        {
            interval: 'every 5 days',
            start: '2021-10-10',
            nextStart: '2021-10-15',
        },
        {
            interval: 'every 5 days',
            scheduled: '2021-10-10',
            nextScheduled: '2021-10-15',
        },
        {
            interval: 'every 5 days',
            start: '2021-10-10',
            due: '2021-10-11',
            nextStart: '2021-10-15',
            nextDue: '2021-10-16',
        },
        {
            interval: 'every 5 days',
            scheduled: '2021-10-10',
            due: '2021-10-11',
            nextScheduled: '2021-10-15',
            nextDue: '2021-10-16',
        },
        {
            interval: 'every 5 days',
            start: '2021-10-09',
            scheduled: '2021-10-10',
            due: '2021-10-11',
            nextStart: '2021-10-14',
            nextScheduled: '2021-10-15',
            nextDue: '2021-10-16',
        },
        {
            interval: 'every 10 days when done',
            start: '2021-10-05',
            scheduled: '2021-10-07',
            due: '2021-10-09',
            today: '2021-10-04',
            nextStart: '2021-10-10',
            nextScheduled: '2021-10-12',
            nextDue: '2021-10-14',
        },
        {
            interval: 'every 10 days when done',
            start: '2021-10-05',
            scheduled: '2021-10-07',
            due: '2021-10-09',
            today: '2021-10-06',
            nextStart: '2021-10-12',
            nextScheduled: '2021-10-14',
            nextDue: '2021-10-16',
        },
        {
            interval: 'every 10 days when done',
            start: '2021-10-05',
            scheduled: '2021-10-07',
            due: '2021-10-09',
            today: '2021-10-08',
            nextStart: '2021-10-14',
            nextScheduled: '2021-10-16',
            nextDue: '2021-10-18',
        },
        {
            interval: 'every 10 days when done',
            start: '2021-10-05',
            scheduled: '2021-10-07',
            due: '2021-10-09',
            today: '2021-10-10',
            nextStart: '2021-10-16',
            nextScheduled: '2021-10-18',
            nextDue: '2021-10-20',
        },
        {
            // every month - due 31 March, and so 31 April would not exist: it used to skip forward 2 months
            interval: 'every month',
            due: '2021-03-31',
            nextDue: '2021-04-30',
        },
        {
            // every month - due 29 January, and so 29 February would not exist: it used to skip forward 2 months
            interval: 'every month',
            due: '2021-01-29',
            nextDue: '2021-02-28',
        },
        {
            // every month - skips invalid dates if the recurrence rule states exact date, like 31st
            interval: 'every month on the 31st',
            due: '2021-01-31',
            nextDue: '2021-03-31', // skips '2021-02-31'
        },
        {
            // every year - skips invalid dates if the recurrence rule states exact date, like 31st.
            // We thought that 'every year' might need special-case code for when ' on ' is
            // used. This test was intended to prove that we did need special case code
            // for 'every year on', but instead it shows that it works OK.
            interval: 'every year on February the 29th',
            due: '2021-01-01',
            nextDue: '2024-02-29', // skips all 28th February
            nextInterval: 'every February on the 29th',
        },

        // Testing yearly repetition around leap days
        {
            // yearly, due on leap day 29th February: it used to skip forward 4 years
            interval: 'every year',
            due: '2020-02-29',
            nextDue: '2021-02-28',
        },

        // Testing 'when done' does not skip when next occurrence is a non-existent date
        {
            interval: 'every month when done',
            scheduled: '1999-01-23',
            today: '2021-08-31',
            nextScheduled: '2021-09-30',
        },
        {
            interval: 'every 2 years when done',
            start: '1999-01-23',
            today: '2020-02-29', // is a leap year
            nextStart: '2022-02-28',
        },
        // ==================================
        // Test toggling with custom statuses.
        // See the available statuses, which were set up in the beforeAll() function above.
        // ==================================
        {
            interval: 'every day',
            symbol: 'D',
            due: '2023-01-19',
            doneSymbol: 'X',
            nextSymbol: '!',
            nextDue: '2023-01-20',
        },
        {
            interval: 'every day',
            symbol: '2',
            doneSymbol: '3', // 2 toggles to 3
            nextSymbol: '1', // and the new task should be 1
        },
        {
            interval: 'every day',
            symbol: 'a',
            doneSymbol: 'b', // a toggles to b
            nextSymbol: 'c', // b says it toggles to c: , but c does not exist: check that it has been chosen anyway
        },
    ];

    // This was calling test.concurrent.each() to run the tests in parallel, but I couldn't
    // get it to run beforeAll() before running the tests.
    // https://github.com/facebook/jest/issues/7997#issuecomment-796965078
    test.each<RecurrenceCase>(recurrenceCases)(
        'recurs correctly (%j)',
        ({
            // inputs:
            interval,
            symbol,
            due,
            scheduled,
            start,
            today,
            // results:
            doneSymbol,
            nextSymbol,
            nextDue,
            nextScheduled,
            nextStart,
            nextInterval,
        }) => {
            const todaySpy = jest.spyOn(Date, 'now').mockReturnValue(moment(today).valueOf());

            // If this test fails, the RecurrenceCase had no expected new dates set, and so
            // is accidentally not doing any testing.
            const atLeaseOneExpectationSupplied =
                nextStart !== undefined ||
                nextDue !== undefined ||
                nextScheduled !== undefined ||
                nextSymbol !== undefined ||
                doneSymbol !== undefined;
            expect(atLeaseOneExpectationSupplied).toStrictEqual(true);

            const line = [
                `- [${symbol ?? ' '}] I am task`,
                `🔁 ${interval}`,
                !!scheduled && `⏳ ${scheduled}`,
                !!due && `📅 ${due}`,
                !!start && `🛫 ${start}`,
            ]
                .filter(Boolean)
                .join(' ');

            const task = fromLine({
                line,
            });

            const tasks = task!.toggle();
            expect(tasks.length).toEqual(2);
            const doneTask: Task = tasks[1];
            const nextTask: Task = tasks[0];

            expect(doneTask.status.symbol).toEqual(doneSymbol ?? 'x');
            expect(nextTask.status.symbol).toEqual(nextSymbol ?? ' ');
            expect({
                nextDue: nextTask.dueDate?.format('YYYY-MM-DD'),
                nextScheduled: nextTask.scheduledDate?.format('YYYY-MM-DD'),
                nextStart: nextTask.startDate?.format('YYYY-MM-DD'),
            }).toMatchObject({
                nextDue,
                nextScheduled,
                nextStart,
            });

            if (nextInterval) {
                expect(nextTask.recurrence?.toText()).toBe(nextInterval);
            } else {
                expect(nextTask.recurrence?.toText()).toBe(interval);
            }
            todaySpy.mockClear();
        },
    );

    it('supports recurrence rule after a due date', () => {
        // Arrange
        const line = '- [ ] this is a task 🗓 2021-09-12 🔁 every day';

        // Act
        const task = fromLine({
            line,
        });

        // Assert
        expect(task).not.toBeNull();
        expect(task!.dueDate).toEqualMoment(moment('2021-09-12'));

        const tasks = task!.toggle();
        expect(tasks.length).toEqual(2);
        const nextTask: Task = tasks[0];
        expect({
            nextDue: nextTask.dueDate?.format('YYYY-MM-DD'),
            nextScheduled: nextTask.scheduledDate?.format('YYYY-MM-DD'),
            nextStart: nextTask.startDate?.format('YYYY-MM-DD'),
        }).toMatchObject({
            nextDue: '2021-09-13',
            nextScheduled: undefined,
            nextStart: undefined,
        });
    });
});

describe('created dates on recurring task', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-03-08'));
    });

    afterEach(() => {
        jest.useRealTimers();
        resetSettings();
    });

    it('should not set created date with disabled setting', () => {
        // Arrange
        const line = '- [ ] this is a task 🔁 every day 📅 2021-09-12';
        updateSettings({ setCreatedDate: false });

        // Act
        expect(line).toToggleTo([
            '- [ ] this is a task 🔁 every day 📅 2021-09-13',
            '- [x] this is a task 🔁 every day 📅 2021-09-12 ✅ 2023-03-08',
        ]);
    });

    it('should not set created date if setting disabled, even if original has created date', () => {
        // Arrange
        const line = '- [ ] this is a task 🔁 every day ➕ 2021-09-11 📅 2021-09-12';
        updateSettings({ setCreatedDate: false });

        // Act
        expect(line).toToggleTo([
            '- [ ] this is a task 🔁 every day 📅 2021-09-13',
            '- [x] this is a task 🔁 every day ➕ 2021-09-11 📅 2021-09-12 ✅ 2023-03-08',
        ]);
    });

    it('should set created date if setting enabled', () => {
        // Arrange
        const line = '- [ ] this is a task 🔁 every day 📅 2021-09-12';
        updateSettings({ setCreatedDate: true });

        // Act
        expect(line).toToggleTo([
            '- [ ] this is a task 🔁 every day ➕ 2023-03-08 📅 2021-09-13',
            '- [x] this is a task 🔁 every day 📅 2021-09-12 ✅ 2023-03-08',
        ]);
    });

    it('should set created date if setting enabled, when original has created date', () => {
        // Arrange
        const line = '- [ ] this is a task 🔁 every day ➕ 2021-09-11 📅 2021-09-12';
        updateSettings({ setCreatedDate: true });

        // Act
        expect(line).toToggleTo([
            '- [ ] this is a task 🔁 every day ➕ 2023-03-08 📅 2021-09-13',
            '- [x] this is a task 🔁 every day ➕ 2021-09-11 📅 2021-09-12 ✅ 2023-03-08',
        ]);
    });
});

describe('order of recurring tasks', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2023, 5 - 1, 16));
        resetSettings();
    });

    afterAll(() => {
        jest.useRealTimers();
        resetSettings();
    });

    it('should put new task before old, by default', () => {
        const line = '- [ ] this is a recurring task 🔁 every day';
        expect(line).toToggleWithRecurrenceInUsersOrderTo([
            '- [ ] this is a recurring task 🔁 every day',
            '- [x] this is a recurring task 🔁 every day ✅ 2023-05-16',
        ]);
    });

    it('should honour new-task-before-old setting', () => {
        updateSettings({ recurrenceOnNextLine: false });

        const line = '- [ ] this is a recurring task 🔁 every day';
        expect(line).toToggleWithRecurrenceInUsersOrderTo([
            '- [ ] this is a recurring task 🔁 every day',
            '- [x] this is a recurring task 🔁 every day ✅ 2023-05-16',
        ]);
    });

    it('should honour old-task-before-new setting', () => {
        updateSettings({ recurrenceOnNextLine: true });

        const line = '- [ ] this is a recurring task 🔁 every day';
        expect(line).toToggleWithRecurrenceInUsersOrderTo([
            '- [x] this is a recurring task 🔁 every day ✅ 2023-05-16',
            '- [ ] this is a recurring task 🔁 every day',
        ]);
    });
});

describe('identicalTo', () => {
    it('should check status', () => {
        const lhs = new TaskBuilder().status(Status.TODO);
        expect(lhs).toBeIdenticalTo(new TaskBuilder().status(Status.TODO));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().status(Status.DONE));
    });

    it('should check description', () => {
        const lhs = new TaskBuilder().description('same long initial text');
        expect(lhs).toBeIdenticalTo(new TaskBuilder().description('same long initial text'));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().description('different text'));
    });

    it('should check path', () => {
        const lhs = new TaskBuilder().path('same test file.md');
        expect(lhs).toBeIdenticalTo(new TaskBuilder().path('same test file.md'));
        // Check it is case-sensitive
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().path('Same Test File.md'));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().path('different text.md'));
    });

    it('should check indentation', () => {
        const lhs = new TaskBuilder().indentation('');
        expect(lhs).toBeIdenticalTo(new TaskBuilder().indentation(''));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().indentation('    '));
    });

    it('should check listMarker', () => {
        const lhs = new TaskBuilder().listMarker('*');
        expect(lhs).toBeIdenticalTo(new TaskBuilder().listMarker('*'));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().listMarker('-'));
    });

    it('should check lineNumber', () => {
        const lhs = new TaskBuilder().lineNumber(0);
        expect(lhs).toBeIdenticalTo(new TaskBuilder().lineNumber(0));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().lineNumber(2));
    });

    it('should check sectionStart', () => {
        const lhs = new TaskBuilder().sectionStart(0);
        expect(lhs).toBeIdenticalTo(new TaskBuilder().sectionStart(0));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().sectionStart(2));
    });

    it('should check sectionIndex', () => {
        const lhs = new TaskBuilder().sectionIndex(0);
        expect(lhs).toBeIdenticalTo(new TaskBuilder().sectionIndex(0));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().sectionIndex(2));
    });

    it('should check precedingHeader', () => {
        const lhs = new TaskBuilder().precedingHeader('Heading 1');
        expect(lhs).toBeIdenticalTo(new TaskBuilder().precedingHeader('Heading 1'));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().precedingHeader('Different Heading'));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().precedingHeader(null));
    });

    it('should check priority', () => {
        const lhs = new TaskBuilder().priority(Priority.Medium);
        expect(lhs).toBeIdenticalTo(new TaskBuilder().priority(Priority.Medium));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().priority(Priority.None));
    });

    it('should check createdDate', () => {
        const lhs = new TaskBuilder().createdDate('2012-12-27');
        expect(lhs).toBeIdenticalTo(new TaskBuilder().createdDate('2012-12-27'));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().createdDate(null));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().createdDate('2012-12-26'));
    });

    it('should check startDate', () => {
        const lhs = new TaskBuilder().startDate('2012-12-27');
        expect(lhs).toBeIdenticalTo(new TaskBuilder().startDate('2012-12-27'));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().startDate(null));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().startDate('2012-12-26'));
    });

    it('should check scheduledDate', () => {
        const lhs = new TaskBuilder().scheduledDate('2012-12-27');
        expect(lhs).toBeIdenticalTo(new TaskBuilder().scheduledDate('2012-12-27'));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().scheduledDate(null));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().scheduledDate('2012-12-26'));
    });

    it('should check dueDate', () => {
        const lhs = new TaskBuilder().dueDate('2012-12-27');
        expect(lhs).toBeIdenticalTo(new TaskBuilder().dueDate('2012-12-27'));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().dueDate(null));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().dueDate('2012-12-26'));
    });

    it('should check isScheduledDateInferred', () => {
        const lhs = new TaskBuilder().scheduledDateIsInferred(false);
        expect(lhs).toBeIdenticalTo(new TaskBuilder().scheduledDateIsInferred(false));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().scheduledDateIsInferred(true));
    });

    it('should check doneDate', () => {
        const lhs = new TaskBuilder().doneDate('2012-12-27');
        expect(lhs).toBeIdenticalTo(new TaskBuilder().doneDate('2012-12-27'));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().doneDate(null));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().doneDate('2012-12-26'));
    });

    describe('should check recurrence', () => {
        const lhs = new TaskBuilder().recurrence(null);
        expect(lhs).toBeIdenticalTo(new TaskBuilder().recurrence(null));

        const weekly = new RecurrenceBuilder().rule('every week').build();
        const daily = new RecurrenceBuilder().rule('every day').build();
        expect(new TaskBuilder().recurrence(weekly)).not.toBeIdenticalTo(new TaskBuilder().recurrence(daily));
        // Note: There are more thorough tests of Recurrence.identicalTo() in Recurrence.test.ts.
    });

    it('should check blockLink', () => {
        const lhs = new TaskBuilder().blockLink('');
        expect(lhs).toBeIdenticalTo(new TaskBuilder().blockLink(''));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().blockLink('dcf64c'));
    });

    it('should check tags', () => {
        const lhs = new TaskBuilder().tags([]);
        expect(lhs).toBeIdenticalTo(new TaskBuilder().tags([]));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().tags(['#stuff']));
    });
});

describe('checking if task lists are identical', () => {
    it('should treat empty lists as identical', () => {
        const list1: Task[] = [];
        const list2: Task[] = [];
        expect(Task.tasksListsIdentical(list1, list2)).toBe(true);
    });

    it('should treat different sized lists as different', () => {
        const list1: Task[] = [];
        const list2: Task[] = [new TaskBuilder().build()];
        expect(Task.tasksListsIdentical(list1, list2)).toBe(false);
    });

    it('should detect matching tasks as same', () => {
        const list1: Task[] = [new TaskBuilder().description('1').build()];
        const list2: Task[] = [new TaskBuilder().description('1').build()];
        expect(Task.tasksListsIdentical(list1, list2)).toBe(true);
    });

    it('should detect non-matching tasks as different', () => {
        const list1: Task[] = [new TaskBuilder().description('1').build()];
        const list2: Task[] = [new TaskBuilder().description('2').build()];
        expect(Task.tasksListsIdentical(list1, list2)).toBe(false);
    });
});
