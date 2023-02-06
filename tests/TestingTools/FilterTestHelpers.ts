import type { FilterOrErrorMessage } from '../../src/Query/Filter/Filter';
import { Task } from '../../src/Task';
import { Query } from '../../src/Query/Query';
import type { DateField } from '../../src/Query/Filter/DateField';
import { DoneDateField } from '../../src/Query/Filter/DoneDateField';
import { TaskBuilder } from './TaskBuilder';

/**
 * Current w/m/y period test array. It is not String[] as the moment
 * framework needs the unitOfTime type
 */
export const currentPeriodsTestArray: moment.unitOfTime.DurationConstructor[] = ['week', 'month', 'year'];

/**
 * Class for one period test vector
 * period - the period name eg week/month/year
 * date - date to be set in the task filter
 * expected - filter result
 */
class periodTestVector {
    readonly period: string;
    readonly date: string;
    readonly expected: boolean;

    constructor(period: string, date: string, expected: boolean) {
        this.period = period;
        this.date = date;
        this.expected = expected;
    }
}

/**
 * Vectors to test the period
 */
export const periodTestVectors = [
    // Inside the week
    new periodTestVector('week', '2022-01-10 (Monday 10th January 2022)', true),
    new periodTestVector('week', '2022-01-16 (Sunday 16th January 2022)', true),

    // Outside of the week
    new periodTestVector('week', '2022-01-09 (Sunday 9th January 2022)', false),
    new periodTestVector('week', '2022-01-17 (Monday 16th January 2022)', false),

    // Inside the month
    new periodTestVector('month', '2022-01-01 (Saturday 1st January 2022)', true),
    new periodTestVector('month', '2022-01-31 (Monday 31st January 2022)', true),

    // Outside of the month
    new periodTestVector('month', '2021-12-31 (Friday 31st December 2021)', false),
    new periodTestVector('month', '2022-02-01 (Tuesday 1st February 2022)', false),

    // Inside the year
    new periodTestVector('year', '2022-01-01 (Saturday 1st January 2022)', true),
    new periodTestVector('year', '2022-12-31 (Saturday 31st December 2022)', true),

    // Outside of the year
    new periodTestVector('year', '2021-12-31 (Friday 31st December 2021)', false),
    new periodTestVector('year', '2023-01-01 (Sunday 1st January 2023)', false),
];

/**
 * Generic DateField tester (presence in the query)
 *
 * @param - class implementing DateField
 * @param - name of the field TODO write this into the DateField implementing classes and remove the parameter
 */
export function testDateFilterInCurrentPeriod(dateField: new () => DateField, fieldName: string): void {
    periodTestVectors.forEach((testVector) => {
        const builder = new TaskBuilder();
        const testDateField = new dateField();
        if (testDateField instanceof DoneDateField) {
            builder.doneDate(testVector.date);
        }
        const task = builder.build();
        const filterOrMessage = testDateField.createFilterOrErrorMessage(
            fieldName + ' in current ' + testVector.period,
        );

        expect(filterOrMessage.filterFunction).toBeDefined();
        expect(filterOrMessage.error).toBeUndefined();
        expect(filterOrMessage.filterFunction!(task)).toEqual(testVector.expected);
    });
}

/**
 * Generic DateField tester (explanation)
 *
 * @param - class implementing DateField
 * @param - name of the field TODO write this into the DateField implementing classes and remove the parameter
 */
export function testDateFilterInCurrentPeriodExplanation(dateField: new () => DateField, fieldName: string): void {
    periodTestVectors.forEach((testVector) => {
        const filterOrMessage = new dateField().createFilterOrErrorMessage(
            fieldName + ' in current ' + testVector.period,
        );

        expect(filterOrMessage).toHaveExplanation(fieldName + ' date is ' + explainPeriod(testVector.period));
    });
}

/**
 * Convenience function to generate current w/m/y description with boundary dates
 * TODO remove moment.unitOfTime.DurationConstructor type once migration on periodTestVector is done
 *
 * @param period - the current period eg w/m/y to be generated.
 */
export function explainPeriod(period: moment.unitOfTime.DurationConstructor | string): String {
    switch (period) {
        case 'week':
            return 'between 2022-01-10 (Monday 10th January 2022) and 2022-01-16 (Sunday 16th January 2022)';
        case 'month':
            return 'between 2022-01-01 (Saturday 1st January 2022) and 2022-01-31 (Monday 31st January 2022)';
        case 'year':
            return 'between 2022-01-01 (Saturday 1st January 2022) and 2022-12-31 (Saturday 31st December 2022)';
    }

    return '--ERROR: WRONG PERIOD:' + period + '! PERIOD SHALL BE (week|month|year)';
}

/**
 * Convenience function to test a Filter on a single Task
 *
 * @param filter - a FilterOrErrorMessage, which should have a valid Filter.
 * @param taskBuilder - a TaskBuilder, populated with the required values for the test. For example:
 *                          new TaskBuilder().startDate('2022-04-15')
 * @param expected true if the task should match the filter, and false otherwise.
 */
export function testFilter(filter: FilterOrErrorMessage, taskBuilder: TaskBuilder, expected: boolean) {
    const task = taskBuilder.build();
    testTaskFilter(filter, task, expected);
}

/**
 * Convenience function to test a Filter on a single Task
 *
 * @param filter - a FilterOrErrorMessage, which should have a valid Filter.
 * @param task - the Task to filter.
 * @param expected true if the task should match the filter, and false otherwise.
 */
export function testTaskFilter(filter: FilterOrErrorMessage, task: Task, expected: boolean) {
    expect(filter.filterFunction).toBeDefined();
    expect(filter.error).toBeUndefined();
    expect(filter.filterFunction!(task)).toEqual(expected);
}

/**
 * Convenience function to test a Filter on a single Task
 *
 * This is to help with porting filter code out of Query and in to Field classes.
 * Unit tests can be first written using the Query class for filtering, and then
 * later updated to use testTaskFilter() instead
 *
 * @param filter - A string, such as 'priority is high'
 * @param task - the Task to filter
 * @param expected - true if the task should match the filter, and false otherwise.
 */
export function testTaskFilterViaQuery(filter: string, task: Task, expected: boolean) {
    // Arrange
    const query = new Query({ source: filter });

    const tasks = [task];

    // Act
    let filteredTasks = [...tasks];
    query.filters.forEach((filter) => {
        filteredTasks = filteredTasks.filter(filter.filterFunction);
    });
    const matched = filteredTasks.length === 1;

    // Assert
    expect(matched).toEqual(expected);
}

export type FilteringCase = {
    filters: Array<string>;
    tasks: Array<string>;
    expectedResult: Array<string>;
};

export function shouldSupportFiltering(
    filters: Array<string>,
    allTaskLines: Array<string>,
    expectedResult: Array<string>,
) {
    // Arrange
    const query = new Query({ source: filters.join('\n') });

    const tasks = allTaskLines.map(
        (taskLine) =>
            Task.fromLine({
                line: taskLine,
                sectionStart: 0,
                sectionIndex: 0,
                path: '',
                precedingHeader: '',
                fallbackDate: null, // For tests scheduled date needs to be set explicitly
            }) as Task,
    );

    // Act
    let filteredTasks = [...tasks];
    query.filters.forEach((filter) => {
        filteredTasks = filteredTasks.filter(filter.filterFunction);
    });

    // Assert
    const filteredTaskLines = filteredTasks.map((task) => `- [ ] ${task.toString()}`);
    expect(filteredTaskLines).toMatchObject(expectedResult);
}
