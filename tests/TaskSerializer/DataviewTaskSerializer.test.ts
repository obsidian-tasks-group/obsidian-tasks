/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Priority } from '../../src/Task';
import { RecurrenceBuilder } from '../TestingTools/RecurrenceBuilder';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { DATAVIEW_SYMBOLS, DataviewTaskSerializer } from '../../src/TaskSerializer/DataviewTaskSerializer';

jest.mock('obsidian');
window.moment = moment;

describe('DataviewTaskSerializer', () => {
    const taskSerializer = new DataviewTaskSerializer();
    const serialize = taskSerializer.serialize.bind(taskSerializer);
    const deserialize = taskSerializer.deserialize.bind(taskSerializer);

    const dateFields = ['startDate', 'dueDate', 'doneDate', 'createdDate', 'scheduledDate'] as const;

    describe('deserialize', () => {
        it('should parse an empty string', () => {
            const taskDetails = deserialize('');
            expect(taskDetails).toMatchTaskDetails({});
        });

        it.each(dateFields)('should parse a %s', (field) => {
            const symbol = DATAVIEW_SYMBOLS[`${field}Symbol`];
            const taskDetails = deserialize(`[${symbol} 2021-06-20]`);
            expect(taskDetails).toMatchTaskDetails({ [field]: moment('2021-06-20', 'YYYY-MM-DD') });
        });

        it('should parse a priority', () => {
            const priorities = ['High', 'Medium', 'Low'] as const;
            for (const p of priorities) {
                const prioritySymbol = DATAVIEW_SYMBOLS.prioritySymbols[p];
                const priority = Priority[p];

                const taskDetails = deserialize(`[${prioritySymbol}]`);

                expect(taskDetails).toMatchTaskDetails({ priority });
            }
        });

        it('should parse a recurrence', () => {
            const taskDetails = deserialize('[repeat:: every day]');
            expect(taskDetails).toMatchTaskDetails({
                recurrence: new RecurrenceBuilder().rule('every day').build(),
            });
        });

        it('should parse tags', () => {
            const description = ' #hello #world #task';
            const taskDetails = deserialize(description);
            expect(taskDetails).toMatchTaskDetails({ tags: ['#hello', '#world', '#task'], description });
        });
    });

    describe('serialize', () => {
        it('should serialize an "Empty" Task as the empty string', () => {
            const serialized = serialize(new TaskBuilder().description('').build());
            expect(serialized).toEqual('');
        });

        it.each(dateFields)('should serialize a %s', (dateField) => {
            const serialized = serialize(new TaskBuilder()[dateField]('2021-06-20').description('').build());
            const symbol = DATAVIEW_SYMBOLS[`${dateField}Symbol`];
            expect(serialized).toEqual(` [${symbol} 2021-06-20]`);
        });

        it('should serialize a High, Medium and Low priority', () => {
            const priorities = ['High', 'Medium', 'Low'] as const;
            for (const p of priorities) {
                const task = new TaskBuilder().priority(Priority[p]).description('').build();
                const serialized = serialize(task);
                expect(serialized).toEqual(` [${DATAVIEW_SYMBOLS.prioritySymbols[p]}]`);
            }
        });

        it('should serialize a None priority', () => {
            const task = new TaskBuilder().priority(Priority.None).description('').build();
            const serialized = serialize(task);
            expect(serialized).toEqual('');
        });

        it('should serialize a recurrence', () => {
            const task = new TaskBuilder()
                .recurrence(new RecurrenceBuilder().rule('every day').build())
                .description('')
                .build();
            const serialized = serialize(task);
            expect(serialized).toEqual(' [repeat:: every day]');
        });

        it('should serialize tags', () => {
            const task = new TaskBuilder().description('').tags(['#hello', '#world', '#task']).build();
            const serialized = serialize(task);
            expect(serialized).toEqual(' #hello #world #task');
        });
    });
});
