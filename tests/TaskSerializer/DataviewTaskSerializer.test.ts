/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { RecurrenceBuilder } from '../TestingTools/RecurrenceBuilder';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { DATAVIEW_SYMBOLS, DataviewTaskSerializer } from '../../src/TaskSerializer/DataviewTaskSerializer';
import type { Task } from '../../src/Task/Task';
import type { TaskDetails } from '../../src/TaskSerializer';
import { Priority } from '../../src/Task/Priority';

jest.mock('obsidian');
window.moment = moment;

// NEW_TASK_FIELD_EDIT_REQUIRED

describe('DataviewTaskSerializer', () => {
    const taskSerializer = new DataviewTaskSerializer();
    const serialize = taskSerializer.serialize.bind(taskSerializer);
    const deserialize = taskSerializer.deserialize.bind(taskSerializer);

    const dateFields = ['startDate', 'dueDate', 'doneDate', 'createdDate', 'scheduledDate', 'cancelledDate'] as const;

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
            const priorities = ['Highest', 'High', 'Medium', 'Low', 'Lowest'] as const;
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

        describe('should parse depends on', () => {
            it('should parse depends on one task', () => {
                const id = '[dependsOn:: F12345]';
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ dependsOn: ['F12345'] });
            });

            it('should parse depends on two tasks', () => {
                const id = '[dependsOn:: 123456,abC123]';
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ dependsOn: ['123456', 'abC123'] });
            });

            it('should parse depends on multiple tasks with varying spaces tasks', () => {
                const id = '[dependsOn::  ab , CD ,  EF  ,    GK]';
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ dependsOn: ['ab', 'CD', 'EF', 'GK'] });
            });

            it('should treat dependsOn as case-sensitive, so dependson remains in the description', () => {
                const id = '[dependson:: F12345]';
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ description: id, dependsOn: [] });
            });
        });

        describe('should parse id', () => {
            it('should parse id with lower-case and numbers', () => {
                const id = '[id:: pqrd0f]';
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ id: 'pqrd0f' });
            });

            it('should parse id with capitals', () => {
                const id = '[id:: Abcd0f]';
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ id: 'Abcd0f' });
            });

            it('should parse id with hyphen', () => {
                const id = '[id:: Abcd0f-]';
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ id: 'Abcd0f-' });
            });

            it('should parse id with underscore', () => {
                const id = '[id:: Ab_cd0f]';
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ id: 'Ab_cd0f' });
            });

            it('should not parse id with asterisk, so id is left in description', () => {
                const id = '[id:: A*bcd0f]';
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ description: id, id: '' });
            });
        });

        it('should parse a task with multiple fields and tags', () => {
            const taskDetails = deserialize(
                'Wobble [priority::high] #tag1 [completion:: 2024-09-04] #tag2  [due::2025-10-05] #tag3 [scheduled::2022-07-02] #tag4 [start::2023-08-03] #tag5  [repeat::every day]  #tag6 #tag7 #tag8 #tag9 #tag10',
            );

            expect(taskDetails).toMatchTaskDetails({
                description: 'Wobble #tag1 #tag2 #tag3 #tag4 #tag5 #tag6 #tag7 #tag8 #tag9 #tag10',
                dueDate: moment('2025-10-05', 'YYYY-MM-DD'),
                doneDate: moment('2024-09-04', 'YYYY-MM-DD'),
                startDate: moment('2023-08-03', 'YYYY-MM-DD'),
                scheduledDate: moment('2022-07-02', 'YYYY-MM-DD'),
                priority: Priority.High,
                recurrence: new RecurrenceBuilder()
                    .rule('every day')
                    .dueDate('2025-10-05')
                    .scheduledDate('2022-07-02')
                    .startDate('2023-08-03')
                    .build(),
                tags: ['#tag1', '#tag2', '#tag3', '#tag4', '#tag5', '#tag6', '#tag7', '#tag8', '#tag9', '#tag10'],
            });
        });

        describe('whitespace within an inline field', () => {
            type OnlyStringKeys<T> = { [K in keyof T as K]: T[K] extends string ? T[K] : never };
            type DataviewFieldsWithoutPriority = OnlyStringKeys<typeof DATAVIEW_SYMBOLS>[keyof OnlyStringKeys<
                typeof DATAVIEW_SYMBOLS
            >];

            type FieldWhitespaceTest = {
                field: keyof Task;
                input: {
                    symbol: DataviewFieldsWithoutPriority | 'priority::';
                    value: string;
                };
                expected: Partial<TaskDetails>;
            };

            describe.each([
                ...dateFields.map((dateField) => ({
                    field: dateField,
                    input: { symbol: DATAVIEW_SYMBOLS[`${dateField}Symbol`], value: '2021-06-20' },
                    expected: { [dateField]: moment('2021-06-20', 'YYYY-MM-DD') },
                })),
                {
                    field: 'recurrence',
                    input: { symbol: 'repeat::', value: 'every day' },
                    expected: { recurrence: new RecurrenceBuilder().rule('every day').build() },
                },
                {
                    field: 'priority',
                    input: { symbol: 'priority::', value: 'high' },
                    expected: { priority: Priority.High },
                },
            ] as FieldWhitespaceTest[])('$field', ({ input, expected }) => {
                const { symbol, value } = input;

                it('should parse with no extraneous whitespace', () => {
                    const taskDetails = deserialize(`[${symbol}${value}]`);
                    expect(taskDetails).toMatchTaskDetails(expected);
                });

                it('should parse with whitespace after ::', () => {
                    // Single space
                    let taskDetails = deserialize(`[${symbol} ${value}]`);
                    expect(taskDetails).toMatchTaskDetails(expected);

                    // Many spaces
                    taskDetails = deserialize(`[${symbol}               ${value}]`);
                    expect(taskDetails).toMatchTaskDetails(expected);
                });

                it('should parse with whitespace near brackets', () => {
                    // Single space after opening
                    let taskDetails = deserialize(`[ ${symbol}${value}]`);
                    expect(taskDetails).toMatchTaskDetails(expected);

                    // Many spaces after opening
                    taskDetails = deserialize(`[      ${symbol}${value}]`);
                    expect(taskDetails).toMatchTaskDetails(expected);

                    // Single space before closing
                    taskDetails = deserialize(`[${symbol}${value} ]`);
                    expect(taskDetails).toMatchTaskDetails(expected);

                    // Single space before closing
                    taskDetails = deserialize(`[${symbol}${value}     ]`);
                    expect(taskDetails).toMatchTaskDetails(expected);

                    // Single space surrounding
                    taskDetails = deserialize(`[ ${symbol}${value} ]`);
                    expect(taskDetails).toMatchTaskDetails(expected);

                    // Many spaces surrounding
                    taskDetails = deserialize(`[     ${symbol}${value}     ]`);
                    expect(taskDetails).toMatchTaskDetails(expected);
                });

                it('should parse with whitespace near brackets and after ::', () => {
                    const taskDetails = deserialize(`[     ${symbol}     ${value}     ]`);
                    expect(taskDetails).toMatchTaskDetails(expected);
                });
            });
        });

        it('should parse tags', () => {
            const description = ' #hello #world #task';
            const taskDetails = deserialize(description);
            expect(taskDetails).toMatchTaskDetails({ tags: ['#hello', '#world', '#task'], description });
        });

        it('should recognize inline fields surrounded by square brackets', () => {
            const taskDetails = deserialize('Some task that is [due::2021-08-22] [priority:: high]');
            expect(taskDetails).toMatchTaskDetails({
                priority: Priority.High,
                dueDate: moment('2021-08-22', 'YYYY-MM-DD'),
                description: 'Some task that is',
            });
        });

        it('should recognize inline fields surrounded by parens', () => {
            const taskDetails = deserialize('Some task that is (due::2021-08-22) (priority:: high)');
            expect(taskDetails).toMatchTaskDetails({
                priority: Priority.High,
                dueDate: moment('2021-08-22', 'YYYY-MM-DD'),
                description: 'Some task that is',
            });
        });

        it('should not recognize inline fields with mismatched surrounding pair', () => {
            const taskDetails = deserialize('Some task that is [due::2021-08-22) (priority:: high]');
            expect(taskDetails).toMatchTaskDetails({
                description: 'Some task that is [due::2021-08-22) (priority:: high]',
            });
        });

        it('should not recognize unbracketed fields', () => {
            const taskDetails = deserialize('Some task - due value not found by dataview - due:: 2021-08-22');
            expect(taskDetails).toMatchTaskDetails({
                description: 'Some task - due value not found by dataview - due:: 2021-08-22',
            });
        });

        // This test validates that the workaround for https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1913
        // works
        it('should recognize comma seperated inline fields', () => {
            const taskDetails = deserialize(
                'Some task that is [due::2021-08-22], [priority::high]       , (start::2021-08-19)',
            );
            expect(taskDetails).toMatchTaskDetails({
                priority: Priority.High,
                dueDate: moment('2021-08-22', 'YYYY-MM-DD'),
                startDate: moment('2021-08-19', 'YYYY-MM-DD'),
                // Note that the commas are consumed by the inline field parsing
                // This may have to change if #1505 is implemented
                description: 'Some task that is',
            });
        });

        // This is one major behavior difference between Dataview and Tasks
        // This task is marked as skipped until tasks has support for parsing fields arbitrarily
        // within a task line
        it.skip('should recognize inline fields arbitrarily positioned in the string', () => {
            const taskDetails = deserialize('Some task that is [due::2021-08-02] and is [priority::high]');
            expect(taskDetails).toMatchTaskDetails({
                description: 'Some task that is [due::2021-08-02] and is [priority::high]',
                dueDate: moment('2021-08-02', 'YYYY-MM-DD'),
                priority: Priority.High,
            });
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
            expect(serialized).toEqual(`  [${symbol} 2021-06-20]`);
        });

        it('should serialize a Highest, High, Medium, Low and Lowest priority', () => {
            const priorities = ['Highest', 'High', 'Medium', 'Low', 'Lowest'] as const;
            for (const p of priorities) {
                const task = new TaskBuilder().priority(Priority[p]).description('').build();
                const serialized = serialize(task);
                expect(serialized).toEqual(`  [${DATAVIEW_SYMBOLS.prioritySymbols[p]}]`);
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
            expect(serialized).toEqual('  [repeat:: every day]');
        });

        it('should serialize tags', () => {
            const task = new TaskBuilder().description('').tags(['#hello', '#world', '#task']).build();
            const serialized = serialize(task);
            expect(serialized).toEqual(' #hello #world #task');
        });

        it('should serialize depends on', () => {
            const task = new TaskBuilder().description('').dependsOn(['123456', 'abc123']).build();
            const serialized = serialize(task);
            expect(serialized).toEqual('  [dependsOn:: 123456,abc123]');
        });

        it('should serialize id', () => {
            const task = new TaskBuilder().description('').id('abcdef').build();
            const serialized = serialize(task);
            expect(serialized).toEqual('  [id:: abcdef]');
        });

        it('should serialize a fully populated task', () => {
            const task = TaskBuilder.createFullyPopulatedTask();
            const serialized = serialize(task);
            expect(serialized).toMatchInlineSnapshot(
                '"Do exercises #todo #health  [id:: abcdef]  [dependsOn:: 123456,abc123]  [priority:: medium]  [repeat:: every day when done]  [created:: 2023-07-01]  [start:: 2023-07-02]  [scheduled:: 2023-07-03]  [due:: 2023-07-04]  [cancelled:: 2023-07-06]  [completion:: 2023-07-05] ^dcf64c"',
            );
        });
    });
});
