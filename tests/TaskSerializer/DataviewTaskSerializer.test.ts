/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Priority } from '../../src/Task';
import { RecurrenceBuilder } from '../TestingTools/RecurrenceBuilder';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { DATAVIEW_SYMBOLS, DataviewTaskSerializer } from '../../src/TaskSerializer/DataviewTaskSerializer';
import type { Task } from '../../src/Task';
import type { TaskDetails } from '../../src/TaskSerializer';

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
