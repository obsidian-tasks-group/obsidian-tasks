/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Status } from '../src/Status';
import { Task } from '../src/Task';
import { getSettings, toggleFeature, updateSettings } from '../src/Settings';
import { Feature } from '../src/Feature';

jest.mock('obsidian');
window.moment = moment;

describe('parsing', () => {
    it('parses a task from a line', () => {
        // Arrange
        const line = '- [x] this is a done task 🗓 2021-09-12 ✅ 2021-06-20';
        const path = 'this/is a path/to a/file.md';
        const sectionStart = 1337;
        const sectionIndex = 1209;
        const precedingHeader = 'Eloquent Section';

        // Act
        const task = Task.fromLine({
            line,
            path,
            sectionStart,
            sectionIndex,
            precedingHeader,
        });

        // Assert
        expect(task).not.toBeNull();
        expect(task!.description).toEqual('this is a done task');
        expect(task!.status).toStrictEqual(Status.DONE);
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
        const path = 'this/is a path/to a/file.md';
        const sectionStart = 1337;
        const sectionIndex = 1209;
        const precedingHeader = 'Eloquent Section';

        // Act
        const task = Task.fromLine({
            line,
            path,
            sectionStart,
            sectionIndex,
            precedingHeader,
        });

        // Assert
        expect(task).toBeNull();

        // Cleanup
        updateSettings(originalSettings);
    });

    it('allows signifier emojis as part of the description', () => {
        // Arrange
        const line = '- [x] this is a ✅ done task 🗓 2021-09-12 ✅ 2021-06-20';
        const path = 'this/is a path/to a/file.md';
        const sectionStart = 1337;
        const sectionIndex = 1209;
        const precedingHeader = 'Eloquent Section';

        // Act
        const task = Task.fromLine({
            line,
            path,
            sectionStart,
            sectionIndex,
            precedingHeader,
        });

        // Assert
        expect(task).not.toBeNull();
        expect(task!.description).toEqual('this is a ✅ done task');
        expect(task!.status).toStrictEqual(Status.DONE);
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
        const path = 'this/is a path/to a/file.md';
        const sectionStart = 1337;
        const sectionIndex = 1209;
        const precedingHeader = 'Eloquent Section';

        // Act
        const task = Task.fromLine({
            line,
            path,
            sectionStart,
            sectionIndex,
            precedingHeader,
        });

        // Assert
        expect(task).not.toBeNull();
        expect(task!.description).toEqual('this is a ✅ done task');
        expect(task!.status).toStrictEqual(Status.DONE);
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
});

type TagParsingExpectations = {
    markdownTask: string;
    expectedDescription: string;
    extractedTags: string[];
    globalFilter: string;
};

function constructTaskFromLine(line: string) {
    const task = Task.fromLine({
        line,
        path: 'file.md',
        sectionStart: 0,
        sectionIndex: 0,
        precedingHeader: '',
    });
    return task;
}

describe('parsing tags', () => {
    test.each<TagParsingExpectations>([
        {
            markdownTask:
                '- [x] this is a done task #tagone 🗓 2021-09-12 ✅ 2021-06-20',
            expectedDescription: 'this is a done task #tagone',
            extractedTags: ['#tagone'],
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
            expectedDescription: 'this is a done task #tagone',
            extractedTags: ['#tagone'],
            globalFilter: '#someglobaltasktag',
        },
        {
            markdownTask:
                '- [x] #someglobaltasktag this is a done task #tagone #tagtwo 🗓 2021-09-12 ✅ 2021-06-20',
            expectedDescription: 'this is a done task #tagone #tagtwo',
            extractedTags: ['#tagone', '#tagtwo'],
            globalFilter: '#someglobaltasktag',
        },
        {
            markdownTask:
                '- [ ] #someglobaltasktag this is a normal task #tagone 🗓 2021-09-12 ✅ 2021-06-20',
            expectedDescription: 'this is a normal task #tagone',
            extractedTags: ['#tagone'],
            globalFilter: '#someglobaltasktag',
        },
        {
            markdownTask:
                '- [ ] #someglobaltasktag this is a normal task #tagone #tagtwo 🗓 2021-09-12 ✅ 2021-06-20',
            expectedDescription: 'this is a normal task #tagone #tagtwo',
            extractedTags: ['#tagone', '#tagtwo'],
            globalFilter: '#someglobaltasktag',
        },
        {
            markdownTask:
                '- [ ] #someglobaltasktag this is a normal task #tagone #tag/with/depth #tagtwo 🗓 2021-09-12 ✅ 2021-06-20',
            expectedDescription:
                'this is a normal task #tagone #tag/with/depth #tagtwo',
            extractedTags: ['#tagone', '#tag/with/depth', '#tagtwo'],
            globalFilter: '#someglobaltasktag',
        },
        {
            markdownTask:
                '- [ ] Export [Cloud Feedly feeds](http://cloud.feedly.com/#opml) #context/pc_clare 🔁 every 4 weeks on Sunday ⏳ 2022-05-15',
            expectedDescription:
                'Export [Cloud Feedly feeds](http://cloud.feedly.com/#opml) #context/pc_clare',
            extractedTags: ['#context/pc_clare'],
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

type GlobalFilterParsingExpectations = {
    location: string;
    scenario: string;
    initialTask: string;
    expectedTask: string;
};

describe('to string', () => {
    it('retains the block link', () => {
        // Arrange
        const line = '- [ ] this is a task 📅 2021-09-12 ^my-precious';

        // Act
        const task: Task = Task.fromLine({
            line,
            path: '',
            sectionStart: 0,
            sectionIndex: 0,
            precedingHeader: '',
        }) as Task;

        // Assert
        expect(task).not.toBeNull();
        expect(task.toFileLineString()).toStrictEqual(line);
    });

    it('retains the tags', () => {
        // Arrange
        const line =
            '- [x] this is a done task #tagone #journal/daily 📅 2021-09-12 ✅ 2021-06-20';

        // Act
        const task: Task = Task.fromLine({
            line,
            path: '',
            sectionStart: 0,
            sectionIndex: 0,
            precedingHeader: '',
        }) as Task;

        // Assert
        expect(task.toFileLineString()).toStrictEqual(line);
    });

    test.each<GlobalFilterParsingExpectations>([
        {
            location: 'append',
            scenario: 'at front',
            initialTask:
                '- [x] #globalfilter this is a done task #tagone #journal/daily 📅 2021-09-12 ✅ 2021-06-20',
            expectedTask:
                '- [x] this is a done task #tagone #journal/daily #globalfilter 📅 2021-09-12 ✅ 2021-06-20',
        },
        {
            location: 'append',
            scenario: 'at end',
            initialTask:
                '- [x] this is a done task #tagone #journal/daily #globalfilter 📅 2021-09-12 ✅ 2021-06-20',
            expectedTask:
                '- [x] this is a done task #tagone #journal/daily #globalfilter 📅 2021-09-12 ✅ 2021-06-20',
        },
        {
            location: 'append',
            scenario: 'in middle',
            initialTask:
                '- [x] this is a done task #globalfilter #tagone #journal/daily  📅 2021-09-12 ✅ 2021-06-20',
            expectedTask:
                '- [x] this is a done task #tagone #journal/daily #globalfilter 📅 2021-09-12 ✅ 2021-06-20',
        },
        {
            location: 'prepend',
            scenario: 'at front',
            initialTask:
                '- [x] #globalfilter this is a done task #tagone #journal/daily 📅 2021-09-12 ✅ 2021-06-20',
            expectedTask:
                '- [x] #globalfilter this is a done task #tagone #journal/daily 📅 2021-09-12 ✅ 2021-06-20',
        },
        {
            location: 'prepend',
            scenario: 'at end',
            initialTask:
                '- [x] this is a done task #tagone #journal/daily #globalfilter 📅 2021-09-12 ✅ 2021-06-20',
            expectedTask:
                '- [x] #globalfilter this is a done task #tagone #journal/daily 📅 2021-09-12 ✅ 2021-06-20',
        },
        {
            location: 'prepend',
            scenario: 'in middle',
            initialTask:
                '- [x] this is a done task #globalfilter #tagone #journal/daily  📅 2021-09-12 ✅ 2021-06-20',
            expectedTask:
                '- [x] #globalfilter this is a done task #tagone #journal/daily 📅 2021-09-12 ✅ 2021-06-20',
        },
    ])(
        'should $location global filter when $scenario',
        ({ location, initialTask, expectedTask }) => {
            // Arrange
            const originalSettings = getSettings();
            updateSettings({ globalFilter: '#globalfilter' });
            if (location === 'append') {
                toggleFeature(Feature.APPEND_GLOBAL_FILTER.internalName, true);
            }
            // Act
            const task = constructTaskFromLine(initialTask);

            // Assert
            expect(task).not.toBeNull();
            expect(task?.toFileLineString()).toStrictEqual(expectedTask);

            // Cleanup
            updateSettings(originalSettings);
            toggleFeature(Feature.APPEND_GLOBAL_FILTER.internalName, false);
        },
    );
});

describe('toggle done', () => {
    it('retains the block link through status transitions', () => {
        // Arrange
        const line = '- [ ] this is a task 📅 2021-09-12 ^my-precious';

        // Act
        const task: Task = Task.fromLine({
            line,
            path: '',
            sectionStart: 0,
            sectionIndex: 0,
            precedingHeader: '',
        }) as Task;
        const toggled: Task = task.toggle()[0];

        // Assert
        expect(toggled).not.toBeNull();
        expect(toggled!.status).toStrictEqual(Status.IN_PROGRESS);
        expect(toggled!.doneDate).toBeNull();
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
                '- [/] I am task in progress',
                `🔁 ${interval}`,
                !!scheduled && `⏳ ${scheduled}`,
                !!due && `📅 ${due}`,
                !!start && `🛫 ${start}`,
            ]
                .filter(Boolean)
                .join(' ');

            const task = Task.fromLine({
                line,
                path: '',
                precedingHeader: '',
                sectionStart: 0,
                sectionIndex: 0,
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
});
