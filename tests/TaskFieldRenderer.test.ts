/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { TaskFieldHTMLData, TaskFieldRenderer } from '../src/TaskFieldRenderer';
import { TaskBuilder } from './TestingTools/TaskBuilder';

window.moment = moment;

describe('Field Layouts Container tests', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-11-19'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should get the data attribute of an existing component (date)', () => {
        const container = new TaskFieldRenderer();
        const task = new TaskBuilder().dueDate('2023-11-20').build();

        const dueDateDataAttribute = container.dataAttribute('dueDate', task);

        expect(Object.keys(dueDateDataAttribute).length).toEqual(1);
        expect(dueDateDataAttribute['taskDue']).toEqual('future-1d');
    });

    it('should get the data attribute of an existing component (not date)', () => {
        const container = new TaskFieldRenderer();
        const task = TaskBuilder.createFullyPopulatedTask();

        const dueDateDataAttribute = container.dataAttribute('priority', task);

        expect(Object.keys(dueDateDataAttribute).length).toEqual(1);
        expect(dueDateDataAttribute['taskPriority']).toEqual('medium');
    });

    it('should return empty data attributes dictionary for a missing component', () => {
        const container = new TaskFieldRenderer();
        const task = new TaskBuilder().build();

        const dueDateDataAttribute = container.dataAttribute('recurrenceRule', task);

        expect(Object.keys(dueDateDataAttribute).length).toEqual(0);
    });
});

describe('Field Layout Detail tests', () => {
    it('should supply a class name and a data attribute name', () => {
        const fieldLayoutDetail = new TaskFieldHTMLData('stuff', 'taskAttribute', () => {
            return '';
        });
        expect(fieldLayoutDetail.className).toEqual('stuff');
    });

    it('should return a data attribute', () => {
        const fieldLayoutDetail = new TaskFieldHTMLData('dataAttributeTest', 'aKey', () => {
            return 'aValue';
        });
        const dataAttribute = fieldLayoutDetail.dataAttribute('description', new TaskBuilder().build());

        expect(Object.keys(dataAttribute).length).toEqual(1);
        expect(dataAttribute['aKey']).toEqual('aValue');
    });
});
