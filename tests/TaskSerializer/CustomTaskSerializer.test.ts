/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { RecurrenceBuilder } from '../TestingTools/RecurrenceBuilder';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { CustomTaskSerializer } from '../../src/TaskSerializer/CustomTaskSerializer';
import { OnCompletion } from '../../src/Task/OnCompletion';
import { Priority } from '../../src/Task/Priority';

jest.mock('obsidian');
window.moment = moment;

// NEW_TASK_FIELD_EDIT_REQUIRED

describe('CustomTaskSerializer', () => {
    const taskSerializer = new CustomTaskSerializer();
    const customSymbols = taskSerializer.symbols;
    const serialize = taskSerializer.serialize.bind(taskSerializer);
    const deserialize = taskSerializer.deserialize.bind(taskSerializer);

    const dateFields = ['startDate', 'dueDate', 'doneDate', 'createdDate', 'scheduledDate', 'cancelledDate'] as const;

    describe('deserialize', () => {
        it('should parse an empty string', () => {
            const taskDetails = deserialize('');
            expect(taskDetails).toMatchTaskDetails({});
        });

        it.each(dateFields)('should parse a %s', (field) => {
            const symbol = customSymbols[`${field}Symbol`];
            const taskDetails = deserialize(`(${symbol} 20.06.21)`);
            // TODO Rework this to work with the CustomTaskSerializer, then remove the '.not' in the following line:
            expect(taskDetails).not.toMatchTaskDetails({ [field]: moment('2021-06-20', 'YYYY-MM-DD') });
        });

        it.failing('should parse a priority', () => {
            // TODO Remove the '.failing' and re-work this so that it test all priority values
            const priorities = ['Highest', 'High', 'Medium', 'Low', 'Lowest'] as const;
            for (const p of priorities) {
                const prioritySymbol = customSymbols.prioritySymbols[p];
                const priority = Priority[p];

                const taskDetails = deserialize(`[${prioritySymbol}]`);

                expect(taskDetails).toMatchTaskDetails({ priority });
            }
        });

        it('should parse a recurrence', () => {
            const taskDetails = deserialize('(Repeat every day)');
            expect(taskDetails).toMatchTaskDetails({
                recurrence: new RecurrenceBuilder().rule('every day').build(),
            });
        });

        describe('should parse onCompletion', () => {
            it('should parse delete action', () => {
                const onCompletion = '(OnCompletion delete)';
                const taskDetails = deserialize(onCompletion);
                expect(taskDetails).toMatchTaskDetails({ onCompletion: OnCompletion.Delete });
            });
        });

        describe('should parse depends on', () => {
            it('should parse depends on one task', () => {
                const id = '(DependsOn F12345)';
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ dependsOn: ['F12345'] });
            });

            it('should parse depends on two tasks', () => {
                const id = '(DependsOn 123456,abC123)';
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ dependsOn: ['123456', 'abC123'] });
            });

            it.failing('should parse depends on multiple tasks with varying spaces tasks', () => {
                // TODO Probably fix the code to make this test pass - then remove the .failing
                const id = '(DependsOn  ab , CD ,  EF  ,    GK)';
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ dependsOn: ['ab', 'CD', 'EF', 'GK'] });
            });

            it('should treat dependsOn as case-sensitive, so dependson remains in the description', () => {
                const id = '(dependson F12345)';
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ description: id, dependsOn: [] });
            });
        });

        describe('should parse id', () => {
            it('should parse id with lower-case and numbers', () => {
                const id = '(ID pqrd0f)';
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ id: 'pqrd0f' });
            });

            it('should parse id with capitals', () => {
                const id = '(ID Abcd0f)';
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ id: 'Abcd0f' });
            });

            it('should parse id with hyphen', () => {
                const id = '(ID Abcd0f-)';
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ id: 'Abcd0f-' });
            });

            it('should parse id with underscore', () => {
                const id = '(ID Ab_cd0f)';
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ id: 'Ab_cd0f' });
            });

            it('should not parse id with asterisk, so id is left in description', () => {
                const id = '(ID A*bcd0f)';
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ description: id, id: '' });
            });
        });

        it.failing('should parse a task with multiple fields and tags', () => {
            // TODO I would have expected this to pass - have I got the format wrong, or has it revealed a bug in the code?
            const taskDetails = deserialize(
                'Wobble (Prio H) #tag1 (Done 04.09.24) #tag2  (Due 05.10.25) #tag3 (Plan 02.07.22) #tag4 (Start 03.08.23) #tag5  (Repeat every day)  #tag6 #tag7 #tag8 #tag9 #tag10',
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

        it('should parse tags', () => {
            const description = ' #hello #world #task';
            const taskDetails = deserialize(description);
            expect(taskDetails).toMatchTaskDetails({ tags: ['#hello', '#world', '#task'], description });
        });

        it.failing('should recognize inline fields surrounded by parens', () => {
            // TODO this fails with the following console output:
            //      Error: expect(received).toMatchTaskDetails(expected)
            //
            //      expected does not match received:
            //
            //      Compared values have no visual difference.
            // I have not been able to figure out the cause of the failure.
            // I suspect that it may be because the Moment object for the date field is in a different
            // format to that recognised by this custom format.
            const taskDetails = deserialize('Some task that is (Due 22.08.21) (Prio H)');
            expect(taskDetails).toMatchTaskDetails({
                priority: Priority.High,
                dueDate: moment('2021-08-22', 'YYYY-MM-DD'),
                description: 'Some task that is',
            });
        });

        // This is one major behavior difference between Dataview and Tasks
        // This task is marked as skipped until tasks has support for parsing fields arbitrarily
        // within a task line
        it.failing('should recognize inline fields arbitrarily positioned in the string', () => {
            const taskDetails = deserialize('Some task that is (Due 02.08.21) and is (Prio H)');
            expect(taskDetails).toMatchTaskDetails({
                description: 'Some task that is (Due 02.08.21) and is (Prio H)',
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
            const symbol = customSymbols[`${dateField}Symbol`];
            // TODO Rework this to work with the CustomTaskSerializer, then remove the '.not' in the following line:
            expect(serialized).not.toEqual(`  [${symbol} 2021-06-20]`);
        });

        it.failing('should serialize a Highest, High, Medium, Low and Lowest priority', () => {
            // TODO Remove the '.failing' and re-work this so that it test all priority values
            const priorities = ['Highest', 'High', 'Medium', 'Low', 'Lowest'] as const;
            for (const p of priorities) {
                const task = new TaskBuilder().priority(Priority[p]).description('').build();
                const serialized = serialize(task);
                expect(serialized).toEqual(`  [${customSymbols.prioritySymbols[p]}]`);
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
            expect(serialized).toEqual(' (Repeat every day)');
        });

        it('should serialize onCompletion', () => {
            const task = new TaskBuilder().onCompletion(OnCompletion.Delete).description('').build();
            const serialized = serialize(task);
            expect(serialized).toEqual(' (OnCompletion delete)');
        });

        it('should serialize tags', () => {
            const task = new TaskBuilder().description('').tags(['#hello', '#world', '#task']).build();
            const serialized = serialize(task);
            expect(serialized).toEqual(' #hello #world #task');
        });

        it('should serialize depends on', () => {
            const task = new TaskBuilder().description('').dependsOn(['123456', 'abc123']).build();
            const serialized = serialize(task);
            expect(serialized).toEqual(' (DependsOn 123456,abc123)');
        });

        it('should serialize id', () => {
            const task = new TaskBuilder().description('').id('abcdef').build();
            const serialized = serialize(task);
            expect(serialized).toEqual(' (ID abcdef)');
        });

        it('should serialize a fully populated task', () => {
            const task = TaskBuilder.createFullyPopulatedTask();
            const serialized = serialize(task);
            expect(serialized).toMatchInlineSnapshot(
                '"Do exercises #todo #health (ID abcdef) (DependsOn 123456,abc123) (Prio M) (Repeat every day when done) (OnCompletion delete) (Created 01.07.23) (Start 02.07.23) (Plan 03.07.23) (Due 04.07.23) (Cancelled 06.07.23) (Done 05.07.23) ^dcf64c"',
            );
        });
    });
});
