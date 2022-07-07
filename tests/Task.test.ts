/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Priority, Status, Task } from '../src/Task';
import { getSettings, updateSettings } from '../src/config/Settings';
import { fromLine } from './TestHelpers';

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
        const originalSettings = getSettings();
        updateSettings({ globalFilter: '#task' });
        const line = '- [x] this is a done task 🗓 2021-09-12 ✅ 2021-06-20';

        // Act
        const task = fromLine({
            line,
        });

        // Assert
        expect(task).toBeNull();

        // Cleanup
        updateSettings(originalSettings);
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
                '- [ ] Export [Cloud Feedly feeds](https://cloud.feedly.com/#opml) #context/pc_clare 🔁 every 4 weeks on Sunday ⏳ 2022-05-15 #context/more_context',
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
    ])(
        'should parse $markdownTask and extract $extractedTags',
        ({
            markdownTask,
            expectedDescription,
            extractedTags,
            globalFilter,
        }) => {
            // Arrange
            const originalSettings = getSettings();
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
                updateSettings(originalSettings);
            }
        },
    );
});

describe('to string', () => {
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
        expect(toggled!.blockLink).toEqual(' ^my-precious');
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
