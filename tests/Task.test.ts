/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Priority, Status, Task } from '../src/Task';
import { resetSettings, updateSettings } from '../src/config/Settings';
import { fromLine } from './TestHelpers';
import { TaskBuilder } from './TestingTools/TaskBuilder';
import { RecurrenceBuilder } from './TestingTools/RecurrenceBuilder';

jest.mock('obsidian');
window.moment = moment;

describe('parsing', () => {
    it('parses a task from a line', () => {
        // Arrange
        const line = '- [x] this is a done task 🗓 2021-09-12 ✅ 2021-06-20';

        // Act
        const task = fromLine({
            line,
        });

        // Assert
        expect(task).not.toBeNull();
        expect(task!.description).toEqual('this is a done task');
        expect(task!.status).toStrictEqual(Status.Done);
        expect(task!.dueDate).not.toBeNull();
        expect(
            task!.dueDate!.isSame(moment('2021-09-12', 'YYYY-MM-DD')),
        ).toStrictEqual(true);
        expect(task!.doneDate).not.toBeNull();
        expect(
            task!.doneDate!.isSame(moment('2021-06-20', 'YYYY-MM-DD')),
        ).toStrictEqual(true);
    });

    it('returns null when task does not have global filter', () => {
        // Arrange
        updateSettings({ globalFilter: '#task' });
        const line = '- [x] this is a done task 🗓 2021-09-12 ✅ 2021-06-20';

        // Act
        const task = fromLine({
            line,
        });

        // Assert
        expect(task).toBeNull();

        // Cleanup
        resetSettings();
    });

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
        expect(task!.status).toStrictEqual(Status.Done);
        expect(task!.dueDate).not.toBeNull();
        expect(
            task!.dueDate!.isSame(moment('2021-09-12', 'YYYY-MM-DD')),
        ).toStrictEqual(true);
        expect(task!.doneDate).not.toBeNull();
        expect(
            task!.doneDate!.isSame(moment('2021-06-20', 'YYYY-MM-DD')),
        ).toStrictEqual(true);
    });

    it('also works with block links and trailing spaces', () => {
        // Arrange
        const line =
            '- [x] this is a ✅ done task 🗓 2021-09-12 ✅ 2021-06-20 ^my-precious  ';

        // Act
        const task = fromLine({
            line,
        });

        // Assert
        expect(task).not.toBeNull();
        expect(task!.description).toEqual('this is a ✅ done task');
        expect(task!.status).toStrictEqual(Status.Done);
        expect(task!.dueDate).not.toBeNull();
        expect(
            task!.dueDate!.isSame(moment('2021-09-12', 'YYYY-MM-DD')),
        ).toStrictEqual(true);
        expect(task!.doneDate).not.toBeNull();
        expect(
            task!.doneDate!.isSame(moment('2021-06-20', 'YYYY-MM-DD')),
        ).toStrictEqual(true);
        expect(task!.blockLink).toEqual(' ^my-precious');
    });

    it('supports tag anywhere in the description and separates them correctly from signifier emojis', () => {
        // Arrange
        const line =
            '- [ ] this is a task due 📅 2021-09-12 #inside_tag ⏫ #some/tags_with_underscore';

        // Act
        const task = fromLine({
            line,
        });

        // Assert
        expect(task).not.toBeNull();
        expect(task!.description).toEqual(
            'this is a task due #inside_tag #some/tags_with_underscore',
        );
        expect(task!.tags).toEqual([
            '#inside_tag',
            '#some/tags_with_underscore',
        ]);
        expect(task!.dueDate).not.toBeNull();
        expect(task!.dueDate!.isSame(moment('2021-09-12', 'YYYY-MM-DD')));
        expect(task!.priority == Priority.High);
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
        expect(task!.description).toEqual(
            'Wobble #tag1 #tag2 #tag3 #tag4 #tag5 #tag6 #tag7 #tag8 #tag9 #tag10',
        );
        expect(task!.dueDate!.isSame(moment('022-07-02', 'YYYY-MM-DD')));
        expect(task!.doneDate!.isSame(moment('022-07-02', 'YYYY-MM-DD')));
        expect(task!.startDate!.isSame(moment('022-07-02', 'YYYY-MM-DD')));
        expect(task!.scheduledDate!.isSame(moment('022-07-02', 'YYYY-MM-DD')));
        expect(task!.priority == Priority.High);
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
            '- [ ] Wobble ✅2022-07-01 📅2022-07-02 ⏳2022-07-03 🛫2022-07-04 🔁every day',
            '- [ ] Wobble ✅ 2022-07-01 📅 2022-07-02 ⏳ 2022-07-03 🛫 2022-07-04 🔁 every day',
            '- [ ] Wobble ✅  2022-07-01 📅  2022-07-02 ⏳  2022-07-03 🛫  2022-07-04 🔁  every day',
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
                priority: task.priority,
                recurrence: task.recurrence?.toText(),
            }).toMatchObject({
                _input: line,
                description: 'Wobble',
                done: '2022-07-01',
                due: '2022-07-02',
                scheduled: '2022-07-03',
                start: '2022-07-04',
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

function constructTaskFromLine(line: string) {
    return Task.fromLine({
        line,
        path: 'file.md',
        sectionStart: 0,
        sectionIndex: 0,
        precedingHeader: '',
    });
}

describe('parsing tags', () => {
    test.each<TagParsingExpectations>([
        {
            markdownTask:
                '- [x] this is a done task #tagone 🗓 2021-09-12 #another-tag ✅ 2021-06-20 #and_another',
            expectedDescription:
                'this is a done task #tagone #another-tag #and_another',
            extractedTags: ['#tagone', '#another-tag', '#and_another'],
            globalFilter: '',
        },
        {
            markdownTask:
                '- [x] this is a done task #tagone #tagtwo 🗓 2021-09-12 ✅ 2021-06-20',
            expectedDescription: 'this is a done task #tagone #tagtwo',
            extractedTags: ['#tagone', '#tagtwo'],
            globalFilter: '',
        },
        {
            markdownTask:
                '- [ ] this is a normal task #tagone 🗓 2021-09-12 ✅ 2021-06-20',
            expectedDescription: 'this is a normal task #tagone',
            extractedTags: ['#tagone'],
            globalFilter: '',
        },
        {
            markdownTask:
                '- [ ] this is a normal task #tagone #tagtwo 🗓 2021-09-12 ✅ 2021-06-20',
            expectedDescription: 'this is a normal task #tagone #tagtwo',
            extractedTags: ['#tagone', '#tagtwo'],
            globalFilter: '',
        },
        {
            markdownTask:
                '- [ ] this is a normal task #tagone #tag/with/depth #tagtwo 🗓 2021-09-12 ✅ 2021-06-20',
            expectedDescription:
                'this is a normal task #tagone #tag/with/depth #tagtwo',
            extractedTags: ['#tagone', '#tag/with/depth', '#tagtwo'],
            globalFilter: '',
        },

        {
            markdownTask:
                '- [x] #someglobaltasktag this is a done task #tagone 🗓 2021-09-12 ✅ 2021-06-20',
            expectedDescription:
                '#someglobaltasktag this is a done task #tagone',
            extractedTags: ['#tagone'],
            globalFilter: '#someglobaltasktag',
        },
        {
            markdownTask:
                '- [x] #someglobaltasktag this is a done task #tagone #tagtwo 🗓 2021-09-12 ✅ 2021-06-20',
            expectedDescription:
                '#someglobaltasktag this is a done task #tagone #tagtwo',
            extractedTags: ['#tagone', '#tagtwo'],
            globalFilter: '#someglobaltasktag',
        },
        {
            markdownTask:
                '- [ ] #someglobaltasktag this is a normal task #tagone 🗓 2021-09-12 ✅ 2021-06-20',
            expectedDescription:
                '#someglobaltasktag this is a normal task #tagone',
            extractedTags: ['#tagone'],
            globalFilter: '#someglobaltasktag',
        },
        {
            markdownTask:
                '- [ ] #someglobaltasktag this is a normal task #tagone #tagtwo 🗓 2021-09-12 #tagthree ✅ 2021-06-20 #tagfour',
            expectedDescription:
                '#someglobaltasktag this is a normal task #tagone #tagtwo #tagthree #tagfour',
            extractedTags: ['#tagone', '#tagtwo', '#tagthree', '#tagfour'],
            globalFilter: '#someglobaltasktag',
        },
        {
            markdownTask:
                '- [ ] #someglobaltasktag this is a normal task #tagone #tag/with/depth #tagtwo 🗓 2021-09-12 ✅ 2021-06-20',
            expectedDescription:
                '#someglobaltasktag this is a normal task #tagone #tag/with/depth #tagtwo',
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
            markdownTask:
                '>>> * [ ] Task inside a nested blockquote or callout #tagone',
            expectedDescription:
                'Task inside a nested blockquote or callout #tagone',
            extractedTags: ['#tagone'],
            globalFilter: '',
        },
    ])(
        'should parse "$markdownTask" and extract "$extractedTags"',
        ({
            markdownTask,
            expectedDescription,
            extractedTags,
            globalFilter,
        }) => {
            // Arrange
            if (globalFilter != '') {
                updateSettings({ globalFilter: globalFilter });
            }

            // Act
            const task = constructTaskFromLine(markdownTask);

            // Assert
            expect(task).not.toBeNull();
            expect(task!.description).toEqual(expectedDescription);
            expect(task!.tags).toStrictEqual(extractedTags);

            // Cleanup
            if (globalFilter != '') {
                resetSettings();
            }
        },
    );
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
        const line =
            '- [x] this is a done task #tagone 📅 2021-09-12 ✅ 2021-06-20 #journal/daily';

        // Act
        const task: Task = fromLine({
            line,
        }) as Task;

        // Assert
        const expectedLine =
            '- [x] this is a done task #tagone #journal/daily 📅 2021-09-12 ✅ 2021-06-20';
        expect(task.toFileLineString()).toStrictEqual(expectedLine);
    });
});

describe('toggle done', () => {
    it('retains the block link', () => {
        // Arrange
        const line = '- [ ] this is a task 📅 2021-09-12 ^my-precious';

        // Act
        const task: Task = fromLine({
            line,
        }) as Task;
        const toggled: Task = task.toggle()[0];

        // Assert
        expect(toggled).not.toBeNull();
        expect(toggled!.status).toStrictEqual(Status.Done);
        expect(toggled!.doneDate).not.toBeNull();
        expect(toggled!.originalStatusCharacter).toStrictEqual('x');
        expect(toggled!.blockLink).toEqual(' ^my-precious');
    });

    it('removes done date after untoggle', () => {
        // Arrange
        const line = '- [x] I thought I finished ✅ 2021-09-12';

        // Act
        const task: Task = fromLine({
            line,
        }) as Task;
        const toggled: Task = task.toggle()[0];

        // Assert
        expect(toggled).not.toBeNull();
        expect(toggled!.status).toStrictEqual(Status.Todo);
        expect(toggled!.originalStatusCharacter).toStrictEqual(' ');
        expect(toggled!.doneDate).toBeNull();
    });

    type RecurrenceCase = {
        interval: string;
        due?: string;
        scheduled?: string;
        start?: string;
        today?: string;
        nextDue?: string;
        nextScheduled?: string;
        nextStart?: string;
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
    ];

    test.concurrent.each<RecurrenceCase>(recurrenceCases)(
        'recurs correctly (%j)',
        ({
            interval,
            due,
            scheduled,
            start,
            today,
            nextDue,
            nextScheduled,
            nextStart,
        }) => {
            const todaySpy = jest
                .spyOn(Date, 'now')
                .mockReturnValue(moment(today).valueOf());

            const line = [
                '- [ ] I am task',
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

            const nextTask: Task = task!.toggle()[0];

            expect({
                nextDue: nextTask.dueDate?.format('YYYY-MM-DD'),
                nextScheduled: nextTask.scheduledDate?.format('YYYY-MM-DD'),
                nextStart: nextTask.startDate?.format('YYYY-MM-DD'),
            }).toMatchObject({
                nextDue,
                nextScheduled,
                nextStart,
            });

            expect(nextTask.recurrence?.toText()).toBe(interval);

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
        expect(task!.dueDate).not.toBeNull();
        expect(
            task!.dueDate!.isSame(moment('2021-09-12', 'YYYY-MM-DD')),
        ).toStrictEqual(true);

        const nextTask: Task = task!.toggle()[0];
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

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeIdenticalTo(builder2: TaskBuilder): R;
        }

        interface Expect {
            toBeIdenticalTo(builder2: TaskBuilder): any;
        }

        interface InverseAsymmetricMatchers {
            toBeIdenticalTo(builder2: TaskBuilder): any;
        }
    }
}

export function toBeIdenticalTo(builder1: TaskBuilder, builder2: TaskBuilder) {
    const task1 = builder1.build();
    const task2 = builder2.build();
    const pass = task1.identicalTo(task2);

    if (pass) {
        return {
            message: () =>
                'Tasks treated as identical, but should be different',
            pass: true,
        };
    }
    return {
        message: () => {
            return 'Tasks should be identical, but are treated as different';
        },
        pass: false,
    };
}

expect.extend({
    toBeIdenticalTo,
});

describe('identicalTo', () => {
    it('should check status', () => {
        const lhs = new TaskBuilder().status(Status.Todo);
        expect(lhs).toBeIdenticalTo(new TaskBuilder().status(Status.Todo));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().status(Status.Done));
    });

    it('should check description', () => {
        const lhs = new TaskBuilder().description('same long initial text');
        expect(lhs).toBeIdenticalTo(
            new TaskBuilder().description('same long initial text'),
        );
        expect(lhs).not.toBeIdenticalTo(
            new TaskBuilder().description('different text'),
        );
    });

    it('should check path', () => {
        const lhs = new TaskBuilder().path('same test file.md');
        expect(lhs).toBeIdenticalTo(
            new TaskBuilder().path('same test file.md'),
        );
        // Check it is case-sensitive
        expect(lhs).not.toBeIdenticalTo(
            new TaskBuilder().path('Same Test File.md'),
        );
        expect(lhs).not.toBeIdenticalTo(
            new TaskBuilder().path('different text.md'),
        );
    });

    it('should check indentation', () => {
        const lhs = new TaskBuilder().indentation('');
        expect(lhs).toBeIdenticalTo(new TaskBuilder().indentation(''));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().indentation('    '));
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

    it('should check originalStatusCharacter', () => {
        const lhs = new TaskBuilder().originalStatusCharacter(' ');
        expect(lhs).toBeIdenticalTo(
            new TaskBuilder().originalStatusCharacter(' '),
        );
        expect(lhs).not.toBeIdenticalTo(
            new TaskBuilder().originalStatusCharacter('x'),
        );
    });

    it('should check precedingHeader', () => {
        const lhs = new TaskBuilder().precedingHeader('Heading 1');
        expect(lhs).toBeIdenticalTo(
            new TaskBuilder().precedingHeader('Heading 1'),
        );
        expect(lhs).not.toBeIdenticalTo(
            new TaskBuilder().precedingHeader('Different Heading'),
        );
        expect(lhs).not.toBeIdenticalTo(
            new TaskBuilder().precedingHeader(null),
        );
    });

    it('should check priority', () => {
        const lhs = new TaskBuilder().priority(Priority.Medium);
        expect(lhs).toBeIdenticalTo(
            new TaskBuilder().priority(Priority.Medium),
        );
        expect(lhs).not.toBeIdenticalTo(
            new TaskBuilder().priority(Priority.None),
        );
    });

    it('should check startDate', () => {
        const lhs = new TaskBuilder().startDate('2012-12-27');
        expect(lhs).toBeIdenticalTo(new TaskBuilder().startDate('2012-12-27'));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().startDate(null));
        expect(lhs).not.toBeIdenticalTo(
            new TaskBuilder().startDate('2012-12-26'),
        );
    });

    it('should check scheduledDate', () => {
        const lhs = new TaskBuilder().scheduledDate('2012-12-27');
        expect(lhs).toBeIdenticalTo(
            new TaskBuilder().scheduledDate('2012-12-27'),
        );
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().scheduledDate(null));
        expect(lhs).not.toBeIdenticalTo(
            new TaskBuilder().scheduledDate('2012-12-26'),
        );
    });

    it('should check dueDate', () => {
        const lhs = new TaskBuilder().dueDate('2012-12-27');
        expect(lhs).toBeIdenticalTo(new TaskBuilder().dueDate('2012-12-27'));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().dueDate(null));
        expect(lhs).not.toBeIdenticalTo(
            new TaskBuilder().dueDate('2012-12-26'),
        );
    });

    it('should check doneDate', () => {
        const lhs = new TaskBuilder().doneDate('2012-12-27');
        expect(lhs).toBeIdenticalTo(new TaskBuilder().doneDate('2012-12-27'));
        expect(lhs).not.toBeIdenticalTo(new TaskBuilder().doneDate(null));
        expect(lhs).not.toBeIdenticalTo(
            new TaskBuilder().doneDate('2012-12-26'),
        );
    });

    describe('should check recurrence', () => {
        const lhs = new TaskBuilder().recurrence(null);
        expect(lhs).toBeIdenticalTo(new TaskBuilder().recurrence(null));

        const weekly = new RecurrenceBuilder().rule('every week').build();
        const daily = new RecurrenceBuilder().rule('every day').build();
        expect(new TaskBuilder().recurrence(weekly)).not.toBeIdenticalTo(
            new TaskBuilder().recurrence(daily),
        );
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

describe('check removal of the global filter', () => {
    type GlobalFilterRemovalExpectation = {
        globalFilter: string;
        markdownTask: string;
        expectedDescription: string;
    };

    test.each<GlobalFilterRemovalExpectation>([
        {
            globalFilter: '#task',
            markdownTask: '- [ ] #task this is a very simple task',
            expectedDescription: 'this is a very simple task',
        },
        {
            globalFilter: '',
            markdownTask: '- [ ] #task this is a very simple task',
            expectedDescription: '#task this is a very simple task',
        },
        {
            globalFilter: '🞋',
            markdownTask: '- [ ] task with emoji 🞋 global filter',
            expectedDescription: 'task with emoji global filter',
        },
        {
            globalFilter: '#t',
            markdownTask: '- [ ] task with #t global filter in the middle',
            expectedDescription: 'task with global filter in the middle',
        },
        {
            globalFilter: '#t',
            markdownTask: '- [ ] task with global filter in the end #t',
            expectedDescription: 'task with global filter in the end',
        },
        {
            globalFilter: '#t',
            markdownTask:
                '- [ ] task with global filter in the end and some spaces  #t  ',
            expectedDescription:
                'task with global filter in the end and some spaces',
        },
        {
            globalFilter: '#complex/global/filter',
            markdownTask:
                '- [ ] task with #complex/global/filter in the middle',
            expectedDescription: 'task with in the middle',
        },
        {
            globalFilter: '#task',
            markdownTask:
                '- [ ] task with an extension of the global filter #task/with/extension',
            expectedDescription:
                'task with an extension of the global filter #task/with/extension',
        },
        {
            globalFilter: '#t',
            markdownTask: '- [ ] task with #t multiple global filters #t',
            expectedDescription: 'task with multiple global filters',
        },
        {
            globalFilter: '#t',
            markdownTask: '- [ ] #t', // confirm behaviour when the description is empty
            expectedDescription: '',
        },
    ])(
        'should parse "$markdownTask" and extract "$expectedDescription"',
        ({ globalFilter, markdownTask, expectedDescription }) => {
            // Arrange
            if (globalFilter != '') {
                updateSettings({ globalFilter: globalFilter });
            }

            // Act
            const task = constructTaskFromLine(markdownTask);

            // Assert
            expect(task).not.toBeNull();
            expect(task!.getDescriptionWithoutGlobalFilter()).toEqual(
                expectedDescription,
            );

            // Cleanup
            if (globalFilter != '') {
                resetSettings();
            }
        },
    );
});

describe('check removal of the global filter exhaustively', () => {
    type GlobalFilterRemoval = {
        globalFilter: string;
    };

    function checkDescription(
        markdownLine: string,
        expectedDescription: string,
    ) {
        const task = constructTaskFromLine(markdownLine);

        // Assert
        expect(task).not.toBeNull();
        expect(task!.getDescriptionWithoutGlobalFilter()).toEqual(
            expectedDescription,
        );
    }

    test.each<GlobalFilterRemoval>([
        {
            globalFilter: '#t',
        },
        // The characters listed below are the ones that are - or were - escaped by
        // Task.escapeRegExp().
        // See the developer.mozilla.org reference in that method.
        // This test validates the escaping of each of those characters.
        {
            globalFilter: '.',
        },
        {
            globalFilter: '*',
        },
        {
            globalFilter: '+',
        },
        {
            globalFilter: '?',
        },
        {
            globalFilter: '^',
        },
        {
            // Failed attempt at creating a failing test for when = was not escaped.
            // When I make Task.escapeRegExp() escape =, I get:
            // Invalid regular expression: /(^|\s)hello\=world($|\s)/: Invalid escape
            globalFilter: 'hello=world',
        },
        {
            // Failed attempt at creating a failing test for when ! was not escaped.
            // When I make Task.escapeRegExp() escape !, I get:
            // Invalid regular expression: /(^|\s)hello\!world($|\s)/: Invalid escape
            globalFilter: 'hello!world',
        },
        {
            // Failed attempt at creating a failing test for when : was not escaped.
            // When I make Task.escapeRegExp() escape :, I get:
            // Invalid regular expression: /(^|\s)hello\:world($|\s)/: Invalid escape
            globalFilter: 'hello:world',
        },
        {
            globalFilter: '$',
        },
        {
            globalFilter: '{',
        },
        {
            globalFilter: '}',
        },
        {
            globalFilter: '(',
        },
        {
            globalFilter: ')',
        },
        {
            globalFilter: '|',
        },
        {
            globalFilter: '[',
        },
        {
            globalFilter: ']',
        },
        {
            // Failed attempt at creating a failing test for when / was not escaped
            globalFilter: '///',
        },
        {
            globalFilter: '\\',
        },
    ])(
        'should parse global filter "$globalFilter" edge cases correctly',
        ({ globalFilter }) => {
            // Arrange
            if (globalFilter != '') {
                updateSettings({ globalFilter: globalFilter });
            }

            // Act

            // global filter removed at beginning, middle and end
            let markdownLine = `- [ ] ${globalFilter} 1 ${globalFilter} 2 ${globalFilter}`;
            let expectedDescription = '1 2';
            checkDescription(markdownLine, expectedDescription);

            // global filter not removed if non-empty non-tag characters before or after it
            markdownLine = `- [ ] ${globalFilter}x 1 x${globalFilter} ${globalFilter}x 2 x${globalFilter}`;
            expectedDescription = `${globalFilter}x 1 x${globalFilter} ${globalFilter}x 2 x${globalFilter}`;
            checkDescription(markdownLine, expectedDescription);

            // global filter not removed if non-empty sub-tag characters after it.
            // Include at least one occurrence of global filter, so we don't pass by luck.
            markdownLine = `- [ ] ${globalFilter}/x 1 x${globalFilter} ${globalFilter}/x 2 ${globalFilter} ${globalFilter}/x`;
            expectedDescription = `${globalFilter}/x 1 x${globalFilter} ${globalFilter}/x 2 ${globalFilter}/x`;
            checkDescription(markdownLine, expectedDescription);

            // Cleanup
            if (globalFilter != '') {
                resetSettings();
            }
        },
    );
});
