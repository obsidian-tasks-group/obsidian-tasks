import moment from 'moment';
import type { Settings } from '../../src/Config/Settings';
import { DefaultTaskSerializer } from '../../src/TaskSerializer';
import { RecurrenceBuilder } from '../TestingTools/RecurrenceBuilder';
import {
    DEFAULT_SYMBOLS,
    type DefaultTaskSerializerSymbols,
    allTaskPluginEmojis,
} from '../../src/TaskSerializer/DefaultTaskSerializer';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { OnCompletion } from '../../src/Task/OnCompletion';
import { Priority } from '../../src/Task/Priority';
import { TaskLayoutComponent } from '../../src/Layout/TaskLayoutOptions';
import { escapeInvisibleCharacters } from '../../src/lib/StringHelpers';

window.moment = moment;

type DefaultTaskSerializeSymbolMap = readonly {
    taskFormat: Settings['taskFormat'];
    symbols: DefaultTaskSerializerSymbols;
}[];
// A map that facilitates parameterizing the tests over symbols
const symbolMap: DefaultTaskSerializeSymbolMap = [{ taskFormat: 'tasksPluginEmoji', symbols: DEFAULT_SYMBOLS }];

/**
 * Since Variant Selectors are invisible, any tests whose behaviour is dependent on the
 * presence or absence of one MUST 'expect' on the result of this function,
 * to confirm that the test is doing what it claims to be doing.
 * @param text
 */
function hasVariantSelector16(text: string) {
    const vs16Regex = /\uFE0F/u;
    return text.match(vs16Regex) !== null;
}

describe('validate emojis', () => {
    // If these tests fail, paste the problem emoji in to https://apps.timwhitlock.info/unicode/inspect
    it.each(allTaskPluginEmojis())('emoji does not contain Variant Selector 16: "%s"', (emoji: string) => {
        expect(hasVariantSelector16(emoji)).toBe(false);
    });
});

describe('validate emoji regular expressions', () => {
    /**
     * Generate a string representation of all regular expressions
     * in TaskFormatRegularExpressions by concatenating their source and flags.
     */
    function generateRegexApprovalTest(): string {
        const regexMap = DEFAULT_SYMBOLS.TaskFormatRegularExpressions;
        const regexDetails = Object.entries(regexMap).map(([key, regex]) => {
            // Get the source and flags for each regex
            if (regex instanceof RegExp) {
                return `${key}: /${regex.source}/${regex.flags}`;
            } else {
                throw new Error(`Unexpected value for ${key}: Not a regular expression.`);
            }
        });
        // Concatenate all entries into a single string, with any Variation Selectors made visible
        return escapeInvisibleCharacters('\n' + regexDetails.join('\n') + '\n');
    }

    it('regular expressions should have expected source', () => {
        expect(generateRegexApprovalTest()).toMatchInlineSnapshot(`
          "
          priorityRegex: /(🔺|⏫|🔼|🔽|⏬)\\ufe0f?$/
          startDateRegex: /🛫\\ufe0f? *(\\d{4}-\\d{2}-\\d{2}(?:[ T]\\d{2}:\\d{2})?)$/
          createdDateRegex: /➕\\ufe0f? *(\\d{4}-\\d{2}-\\d{2}(?:[ T]\\d{2}:\\d{2})?)$/
          scheduledDateRegex: /(?:⏳|⌛)\\ufe0f? *(\\d{4}-\\d{2}-\\d{2}(?:[ T]\\d{2}:\\d{2})?)$/
          dueDateRegex: /(?:📅|📆|🗓)\\ufe0f? *(\\d{4}-\\d{2}-\\d{2}(?:[ T]\\d{2}:\\d{2})?)$/
          doneDateRegex: /✅\\ufe0f? *(\\d{4}-\\d{2}-\\d{2}(?:[ T]\\d{2}:\\d{2})?)$/
          cancelledDateRegex: /❌\\ufe0f? *(\\d{4}-\\d{2}-\\d{2}(?:[ T]\\d{2}:\\d{2})?)$/
          recurrenceRegex: /🔁\\ufe0f? *([a-zA-Z0-9, !]+)$/
          onCompletionRegex: /🏁\\ufe0f? *([a-zA-Z]+)$/
          dependsOnRegex: /⛔\\ufe0f? *([a-zA-Z0-9-_]+( *, *[a-zA-Z0-9-_]+ *)*)$/
          idRegex: /🆔\\ufe0f? *([a-zA-Z0-9-_]+)$/
          "
        `);
    });
});

// NEW_TASK_FIELD_EDIT_REQUIRED

describe.each(symbolMap)("DefaultTaskSerializer with '$taskFormat' symbols", ({ symbols }) => {
    const taskSerializer = new DefaultTaskSerializer(symbols);
    const serialize = taskSerializer.serialize.bind(taskSerializer);
    const deserialize = taskSerializer.deserialize.bind(taskSerializer);
    const {
        startDateSymbol,
        createdDateSymbol,
        recurrenceSymbol,
        onCompletionSymbol,
        scheduledDateSymbol,
        dueDateSymbol,
        doneDateSymbol,
        cancelledDateSymbol,
        idSymbol,
        dependsOnSymbol,
    } = symbols;

    describe('deserialize', () => {
        it('should parse an empty string', () => {
            const taskDetails = deserialize('');
            expect(taskDetails).toMatchTaskDetails({});
        });

        describe('should parse dates', () => {
            it.each([
                { what: 'startDate', symbol: startDateSymbol },
                { what: 'createdDate', symbol: createdDateSymbol },
                { what: 'scheduledDate', symbol: scheduledDateSymbol },
                { what: 'dueDate', symbol: dueDateSymbol },
                { what: 'doneDate', symbol: doneDateSymbol },
            ] as const)('should parse a $what', ({ what, symbol }) => {
                const taskDetails = deserialize(`${symbol} 2021-06-20`);
                expect(taskDetails).toMatchTaskDetails({ [what]: moment('2021-06-20', 'YYYY-MM-DD') });
            });

            it('should parse a scheduledDate - with non-standard emoji', () => {
                const taskDetails = deserialize('⌛ 2021-06-20');
                expect(taskDetails).toMatchTaskDetails({ ['scheduledDate']: moment('2021-06-20', 'YYYY-MM-DD') });
            });

            it('should parse a scheduledDate - with Variation Selector', () => {
                // This test showed the existence of https://github.com/obsidian-tasks-group/obsidian-tasks/issues/3179
                const input = '⏳️ 2024-11-18';
                expect(hasVariantSelector16(input)).toBe(true);

                const taskDetails = deserialize(input);
                expect(taskDetails).toMatchTaskDetails({ ['scheduledDate']: moment('2024-11-18', 'YYYY-MM-DD') });
            });

            it('should parse a dueDate - with non-standard emoji 1', () => {
                const taskDetails = deserialize('📆 2021-06-20');
                expect(taskDetails).toMatchTaskDetails({ ['dueDate']: moment('2021-06-20', 'YYYY-MM-DD') });
            });

            it('should parse a dueDate - with non-standard emoji 2', () => {
                const taskDetails = deserialize('🗓 2021-06-20');
                expect(taskDetails).toMatchTaskDetails({ ['dueDate']: moment('2021-06-20', 'YYYY-MM-DD') });
            });

            it.each([
                { what: 'startDate', symbol: startDateSymbol },
                { what: 'createdDate', symbol: createdDateSymbol },
                { what: 'scheduledDate', symbol: scheduledDateSymbol },
                { what: 'dueDate', symbol: dueDateSymbol },
                { what: 'doneDate', symbol: doneDateSymbol },
                { what: 'cancelledDate', symbol: cancelledDateSymbol },
            ] as const)('should parse a $what with time', ({ what, symbol }) => {
                const taskDetails = deserialize(`${symbol} 2021-06-20 20:20`);
                expect(taskDetails).toMatchTaskDetails({ [what]: moment('2021-06-20 20:20', 'YYYY-MM-DD HH:mm') });
            });

            it.each([
                { what: 'startDate', symbol: startDateSymbol },
                { what: 'createdDate', symbol: createdDateSymbol },
                { what: 'scheduledDate', symbol: scheduledDateSymbol },
                { what: 'dueDate', symbol: dueDateSymbol },
                { what: 'doneDate', symbol: doneDateSymbol },
                { what: 'cancelledDate', symbol: cancelledDateSymbol },
            ] as const)('should parse a $what with ISO time', ({ what, symbol }) => {
                const taskDetails = deserialize(`${symbol} 2021-06-20T20:20`);
                expect(taskDetails).toMatchTaskDetails({ [what]: moment('2021-06-20T20:20', 'YYYY-MM-DDTHH:mm') });
            });

            it('should parse due date with time and priority without leaving timestamp in description', () => {
                const taskDetails = deserialize(
                    `Test reminder ${dueDateSymbol} 2026-10-14 20:20 ${symbols.prioritySymbols.High}`,
                );
                expect(taskDetails).toMatchTaskDetails({
                    description: 'Test reminder',
                    dueDate: moment('2026-10-14 20:20', 'YYYY-MM-DD HH:mm'),
                    priority: Priority.High,
                });
            });

            it('should mark date with invalid time as invalid rather than falling back to date-only', () => {
                const taskDetails = deserialize(`${dueDateSymbol} 2021-06-20 25:99`);
                expect(taskDetails.dueDate).not.toBeNull();
                expect(taskDetails.dueDate!.isValid()).toBe(false);
            });

            it('should mark 24:00 as invalid rather than rolling to 00:00 the next day', () => {
                const spaceSeparated = deserialize(`${dueDateSymbol} 2026-10-23 24:00`);
                expect(spaceSeparated.dueDate).not.toBeNull();
                expect(spaceSeparated.dueDate!.isValid()).toBe(false);

                const isoSeparated = deserialize(`${dueDateSymbol} 2026-10-23T24:00`);
                expect(isoSeparated.dueDate).not.toBeNull();
                expect(isoSeparated.dueDate!.isValid()).toBe(false);
            });

            it('should not parse dates with seconds or timezone offsets on task lines', () => {
                const withSeconds = deserialize(`Task ${dueDateSymbol} 2026-10-23 14:30:00`);
                expect(withSeconds.dueDate).toBeNull();

                const withTimezone = deserialize(`Task ${dueDateSymbol} 2026-10-23T14:30Z`);
                expect(withTimezone.dueDate).toBeNull();
            });
        });

        describe('should parse priorities', () => {
            it('should parse a priority', () => {
                const priorities = ['Highest', 'High', 'None', 'Medium', 'Low', 'Lowest'] as const;
                for (const p of priorities) {
                    const prioritySymbol = symbols.prioritySymbols[p];
                    const priority = Priority[p];

                    const taskDetails = deserialize(`${prioritySymbol}`);

                    expect(taskDetails).toMatchTaskDetails({ priority });
                }
            });

            it('should parse a high priority without Variant Selector 16', () => {
                const line = '⏫';
                expect(hasVariantSelector16(line)).toBe(false);

                const taskDetails = deserialize(line);
                expect(taskDetails).toMatchTaskDetails({ priority: Priority.High });
            });

            it('should parse a high priority with Variant Selector 16', () => {
                // This test showed the existence of https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2273
                const line = '⏫️'; // There is a hidden Variant Selector 16 character at the end of this string
                expect(hasVariantSelector16(line)).toBe(true);

                const taskDetails = deserialize(line);
                expect(taskDetails).toMatchTaskDetails({ priority: Priority.High });
            });
        });

        it('should parse a recurrence', () => {
            const taskDetails = deserialize(`${recurrenceSymbol} every day`);
            expect(taskDetails).toMatchTaskDetails({
                recurrence: new RecurrenceBuilder().rule('every day').build(),
            });
        });

        describe('should parse onCompletion', () => {
            it('should parse delete action', () => {
                const onCompletion = `${onCompletionSymbol} Delete`;
                const taskDetails = deserialize(onCompletion);
                expect(taskDetails).toMatchTaskDetails({ onCompletion: OnCompletion.Delete });
            });

            it('should allow multiple spaces', () => {
                const onCompletion = `${onCompletionSymbol}  Keep`;
                const taskDetails = deserialize(onCompletion);
                expect(taskDetails).toMatchTaskDetails({ onCompletion: OnCompletion.Keep });
            });
        });

        describe('should parse depends on', () => {
            it('should parse depends on one task', () => {
                const id = `${dependsOnSymbol} F12345`;
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ dependsOn: ['F12345'] });
            });

            it('should parse depends on one task - without Variant Selector 16', () => {
                // This test showed the existence of https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2693
                const id = '⛔ F12345';
                expect(hasVariantSelector16(id)).toBe(false);

                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ dependsOn: ['F12345'] });
            });

            it('should parse depends on one task - with Variant Selector 16', () => {
                const id = '⛔️ F12345'; // There is a hidden Variant Selector 16 character at the end of this string
                expect(hasVariantSelector16(id)).toBe(true);

                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ dependsOn: ['F12345'] });
            });

            it('should parse depends on two tasks', () => {
                const id = `${dependsOnSymbol} 123456,abC123`;
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ dependsOn: ['123456', 'abC123'] });
            });

            it('should parse depends on multiple tasks with varying spaces tasks', () => {
                const id = `${dependsOnSymbol} ab , CD ,  EF  ,    GK`;
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ dependsOn: ['ab', 'CD', 'EF', 'GK'] });
            });
        });

        describe('should parse id', () => {
            it('should parse id with lower-case and numbers', () => {
                const id = `${idSymbol} pqrd0f`;
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ id: 'pqrd0f' });
            });

            it('should parse id with capitals', () => {
                const id = `${idSymbol} Abcd0f`;
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ id: 'Abcd0f' });
            });

            it('should parse id with hyphen', () => {
                const id = `${idSymbol} Abcd0f-`;
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ id: 'Abcd0f-' });
            });

            it('should parse id with underscore', () => {
                const id = `${idSymbol} Ab_cd0f`;
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ id: 'Ab_cd0f' });
            });

            it('should not parse id with asterisk, so id is left in description', () => {
                const id = `${idSymbol} A*bcd0f`;
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ description: id, id: '' });
            });
        });

        it('should parse a description containing only tags without adding whitespace', () => {
            const description = '#hello #world #task';
            const taskDetails = deserialize(description);
            expect(taskDetails).toMatchTaskDetails({ tags: ['#hello', '#world', '#task'], description });
        });
    });

    describe('serialize', () => {
        it('should serialize an "Empty" Task as the empty string', () => {
            const serialized = serialize(new TaskBuilder().description('').build());
            expect(serialized).toEqual('');
        });

        it.each([
            { what: 'startDate', symbol: startDateSymbol },
            { what: 'createdDate', symbol: createdDateSymbol },
            { what: 'scheduledDate', symbol: scheduledDateSymbol },
            { what: 'dueDate', symbol: dueDateSymbol },
            { what: 'doneDate', symbol: doneDateSymbol },
            { what: 'cancelledDate', symbol: cancelledDateSymbol },
        ] as const)('should serialize a $what', ({ what, symbol }) => {
            const serialized = serialize(new TaskBuilder()[what]('2021-06-20').description('').build());
            expect(serialized).toEqual(` ${symbol} 2021-06-20`);
        });

        it.each([
            { what: 'startDate', symbol: startDateSymbol },
            { what: 'createdDate', symbol: createdDateSymbol },
            { what: 'scheduledDate', symbol: scheduledDateSymbol },
            { what: 'dueDate', symbol: dueDateSymbol },
            { what: 'doneDate', symbol: doneDateSymbol },
            { what: 'cancelledDate', symbol: cancelledDateSymbol },
        ] as const)('should serialize a $what with time', ({ what, symbol }) => {
            const task = new TaskBuilder().description('')[what]('2021-06-20 20:20').build();
            const serialized = serialize(task);
            expect(serialized).toEqual(` ${symbol} 2021-06-20 20:20`);
        });

        it.each([
            { what: 'startDate', symbol: startDateSymbol },
            { what: 'createdDate', symbol: createdDateSymbol },
            { what: 'scheduledDate', symbol: scheduledDateSymbol },
            { what: 'dueDate', symbol: dueDateSymbol },
            { what: 'doneDate', symbol: doneDateSymbol },
            { what: 'cancelledDate', symbol: cancelledDateSymbol },
        ] as const)('should serialize a $what with ISO time', ({ what, symbol }) => {
            const task = new TaskBuilder().description('')[what]('2021-06-20T20:20').build();
            const serialized = serialize(task);
            expect(serialized).toEqual(` ${symbol} 2021-06-20T20:20`);
        });

        it('should serialize dates with time in short mode with only emoji', () => {
            const task = new TaskBuilder().description('').dueDate('2021-06-20 20:20').build();
            const shortSerialized = taskSerializer.componentToString(task, true, TaskLayoutComponent.DueDate);
            expect(shortSerialized).toEqual(` ${dueDateSymbol}`);
        });

        it('should serialize a Highest, High, Medium, Low and Lowest priority', () => {
            const priorities = ['Highest', 'High', 'Medium', 'Low', 'Lowest'] as const;
            for (const p of priorities) {
                const task = new TaskBuilder().priority(Priority[p]).description('').build();
                const serialized = serialize(task);
                expect(serialized).toEqual(` ${symbols.prioritySymbols[p]}`);
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
            expect(serialized).toEqual(` ${recurrenceSymbol} every day`);
        });

        it('should serialize onCompletion', () => {
            const task = new TaskBuilder().onCompletion(OnCompletion.Delete).description('').build();
            const serialized = serialize(task);
            expect(serialized).toEqual(` ${onCompletionSymbol} delete`);
        });

        it('should serialize depends on', () => {
            const task = new TaskBuilder().description('').dependsOn(['123456', 'abc123']).build();
            const serialized = serialize(task);
            expect(serialized).toEqual(` ${dependsOnSymbol} 123456,abc123`);
        });

        it('should serialize id', () => {
            const task = new TaskBuilder().description('').id('abcdef').build();
            const serialized = serialize(task);
            expect(serialized).toEqual(` ${idSymbol} abcdef`);
        });

        it('should serialize tags', () => {
            const task = new TaskBuilder().description('').tags(['#hello', '#world', '#task']).build();
            const serialized = serialize(task);
            expect(serialized).toEqual(' #hello #world #task');
        });
    });
});
