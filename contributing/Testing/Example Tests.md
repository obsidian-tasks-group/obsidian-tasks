# Example Tests

This page shows a few examples of typical tests in the Tasks code, to give ideas on writing tests.

## An example Jest  test

Tasks tests are written with the Jest test framework.

Here is an example test:

<!-- snippet: example_basic_test -->
```ts
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
    expect(task!.dueDate).not.toBeNull();
    expect(task!.dueDate!.isSame(moment('2021-09-12', 'YYYY-MM-DD'))).toStrictEqual(true);
    expect(task!.doneDate).not.toBeNull();
    expect(task!.doneDate!.isSame(moment('2021-06-20', 'YYYY-MM-DD'))).toStrictEqual(true);
});
```
<!-- endSnippet -->

It has:

- A name that conveys the intention of the test: `'allows signifier emojis as part of the description'`
- Some assertions, that is, statements that check that the code being executed did what was intended.
- The assertions have two parts:
  - `expect(...)` - containing a value, or function call
  - `.to....()` or `.not.to....()` - which describes the check(s) to run on the value in the `expect()` section.

## Testing filters

We have some Tasks-specific helper functions to make it easier to write expressive tests of task filters.

See [CustomMatchersForFilters.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/CustomMatchers/CustomMatchersForFilters.ts). All of its contents is automatically imported in to every test file.

The following tests of the `description regex` instruction work so conveniently because of the Tasks `toMatchTaskFromLine()` custom matcher.

<!-- snippet: example_test_of_filters -->
```ts
describe('search description for time stamps', () => {
    it('should find a time stamp in the description - simple version', () => {
        // Arrange
        const filter = new DescriptionField().createFilterOrErrorMessage(
            String.raw`description regex matches /\d\d:\d\d/`,
        );

        // Assert
        expect(filter).toMatchTaskFromLine('- [ ] Do me at 23:59');
        expect(filter).toMatchTaskFromLine('- [ ] Do me at 00:01');
        expect(filter).toMatchTaskFromLine('- [ ] Do me at 99:99');
    });

    it('should find a time stamp in the description - more precise version', () => {
        // Arrange
        const filter = new DescriptionField().createFilterOrErrorMessage(
            'description regex matches /[012][0-9]:[0-5][0-9]/',
        );

        // Assert
        expect(filter).toMatchTaskFromLine('- [ ] Do me at 23:59');
        expect(filter).toMatchTaskFromLine('- [ ] Do me at 00:01');
        expect(filter).not.toMatchTaskFromLine('- [ ] Do me at 99:99');
    });
});
```
<!-- endSnippet -->

Our Jest custom matchers are all in [tests/CustomMatchers/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/tests/CustomMatchers).

## An example with effective helper functions

The following example, from [DateParser.test.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/Query/DateParser.test.ts), shows how helper functions are used to hide away the implementation details of tests.

After the helper functions, the structure is:

- Each `it(` test has a name beginning `should` that explains the purpose.
- And then each `testParsingDateRange()` call is quite expressive, showing the intended behaviour.

And the `it(` tests are grouped together in to `describe(` blocks with clear names indicating what is being tested.

<!-- snippet: DateParser.test.ts -->
```ts
/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { DateParser } from '../../src/Query/DateParser';
import { TaskRegularExpressions } from '../../src/Task';

window.moment = moment;

function testParsingeSingleDate(input: string, result: string) {
    const moment = DateParser.parseDate(input);
    expect(moment.format(TaskRegularExpressions.dateFormat)).toEqual(result);
}

function testParsingDateRange(input: string, expectedStart: string, expectedEnd: string) {
    // Act
    const result = DateParser.parseDateRange(input);

    // Assert
    const start = result[0];
    const end = result[1];
    expect(start).toBeDefined();
    expect(end).toBeDefined();
    const startFmt = start.format(TaskRegularExpressions.dateFormat);
    const endFmt = end.format(TaskRegularExpressions.dateFormat);
    expect([startFmt, endFmt]).toStrictEqual([expectedStart, expectedEnd]);
}

describe('DateParser - single dates', () => {
    it('should parse a valid fixed date correctly', () => {
        const input = '2021-03-17';
        testParsingeSingleDate(input, input);
    });

    it('should recognise an invalid date correctly', () => {
        testParsingeSingleDate('2021-13-17', 'Invalid date');
    });

    it('should return date at midnight', () => {
        const dateToParse = '2023-07-08';
        const parsedDate = DateParser.parseDate(dateToParse);
        expect(parsedDate.format('YYYY-MM-DD HH:mm')).toStrictEqual('2023-07-08 00:00');
    });
});

describe('DateParser - date ranges', () => {
    it('should parse date range from absolute dates, supplied as words', () => {
        // Arrange
        testParsingDateRange('17 August 2013 19 August 2013', '2013-08-17', '2013-08-19');
    });

    it('should parse date range with  multiple spaces', () => {
        testParsingDateRange('2013-08-17   2014-08-19', '2013-08-17', '2014-08-19');
    });

    it('should parse date range with end before start', () => {
        testParsingDateRange('2017-08-17 2014-08-19', '2014-08-19', '2017-08-17');
    });

    it('should parse single date as date range', () => {
        // Arrange
        const input = '2019-12-28';
        testParsingDateRange(input, input, input);
    });

    it('should ignore invalid start date when parsing range', () => {
        testParsingDateRange('2013-99-29 2014-08-19', '2014-08-19', '2014-08-19');
    });

    it('should ignore invalid end date when parsing range', () => {
        testParsingDateRange('2014-08-19 2015-99-29', '2014-08-19', '2014-08-19');
    });

    it('should return 2 invalid dates when both dates are invalid', () => {
        testParsingDateRange('2015-99-29 2015-99-29', 'Invalid date', 'Invalid date');
    });

    it('should return date ranges at midnight', () => {
        const dateRangeToParse = '2023-09-28 2023-10-01';
        const parsedDateRange = DateParser.parseDateRange(dateRangeToParse);
        expect(parsedDateRange[0].format('YYYY-MM-DD HH:mm')).toStrictEqual('2023-09-28 00:00');
        expect(parsedDateRange[1].format('YYYY-MM-DD HH:mm')).toStrictEqual('2023-10-01 00:00');
    });
});

describe('DateParser - relative date ranges', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2021, 9, 6)); // 2021-10-06
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('should return relative date range at midnight (week)', () => {
        const dateRangeToParse = 'this week';
        const parsedDateRange = DateParser.parseDateRange(dateRangeToParse);
        expect(parsedDateRange[0].format('YYYY-MM-DD HH:mm')).toStrictEqual('2021-10-04 00:00');
        expect(parsedDateRange[1].format('YYYY-MM-DD HH:mm')).toStrictEqual('2021-10-10 00:00');
    });

    it('should return relative date range (week)', () => {
        testParsingDateRange('last week', '2021-09-27', '2021-10-03');
        testParsingDateRange('this week', '2021-10-04', '2021-10-10');
        testParsingDateRange('next week', '2021-10-11', '2021-10-17');
    });

    it('should return relative date range (month)', () => {
        testParsingDateRange('last month', '2021-09-01', '2021-09-30');
        testParsingDateRange('this month', '2021-10-01', '2021-10-31');
        testParsingDateRange('next month', '2021-11-01', '2021-11-30');
    });

    it('should return relative date range (quarter)', () => {
        testParsingDateRange('last quarter', '2021-07-01', '2021-09-30');
        testParsingDateRange('this quarter', '2021-10-01', '2021-12-31');
        testParsingDateRange('next quarter', '2022-01-01', '2022-03-31');
    });

    it('should return relative date range (year)', () => {
        testParsingDateRange('last year', '2020-01-01', '2020-12-31');
        testParsingDateRange('this year', '2021-01-01', '2021-12-31');
        testParsingDateRange('next year', '2022-01-01', '2022-12-31');
    });
});

describe('Date Parser - correct delta for next & last month & quarter (Today is 2021-04-03)', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2021, 3, 3)); // 2021-04-03
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('should return longer range even if the current range is shorter in days', () => {
        testParsingDateRange('last month', '2021-03-01', '2021-03-31');
        testParsingDateRange('next month', '2021-05-01', '2021-05-31');
        testParsingDateRange('last quarter', '2021-01-01', '2021-03-31');
        testParsingDateRange('next quarter', '2021-07-01', '2021-09-30');
        // The latest test case is not representative eg won't fail without the fix
        // because the length of Q2 in days is same as Q3.
    });
});
```
<!-- endSnippet -->
