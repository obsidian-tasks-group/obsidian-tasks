/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { TaskFieldHTMLData, TaskFieldRenderer } from '../src/TaskFieldRenderer';
import { TaskBuilder } from './TestingTools/TaskBuilder';

window.moment = moment;

const fieldRenderer = new TaskFieldRenderer();

describe('Field Layouts Container tests', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-11-19'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should add a data attribute for an existing component (date)', () => {
        const task = new TaskBuilder().dueDate('2023-11-20').build();
        const span = document.createElement('span');

        fieldRenderer.addDataAttribute(span, task, 'dueDate');

        expect(Object.keys(span.dataset).length).toEqual(1);
        expect(span.dataset['taskDue']).toEqual('future-1d');
    });

    it('should add a data attribute for an existing component (not date)', () => {
        const task = TaskBuilder.createFullyPopulatedTask();
        const span = document.createElement('span');

        fieldRenderer.addDataAttribute(span, task, 'priority');

        expect(Object.keys(span.dataset).length).toEqual(1);
        expect(span.dataset['taskPriority']).toEqual('medium');
    });
    it('should not add any data attributes for a missing component', () => {
        const task = new TaskBuilder().build();
        const span = document.createElement('span');

        fieldRenderer.addDataAttribute(span, task, 'recurrenceRule');

        expect(Object.keys(span.dataset).length).toEqual(0);
    });
});

describe('Field Layout Detail tests', () => {
    it('should supply a class name', () => {
        const fieldLayoutDetail = new TaskFieldHTMLData('stuff', 'taskAttribute', () => {
            return '';
        });
        expect(fieldLayoutDetail.className).toEqual('stuff');
    });

    it('should add a data attribute for an HTML element', () => {
        const fieldLayoutDetail = new TaskFieldHTMLData('dataAttributeTest', 'aKey', () => {
            return 'aValue';
        });
        const span = document.createElement('span');

        fieldLayoutDetail.addDataAttribute(span, new TaskBuilder().build(), 'description');

        expect(Object.keys(span.dataset).length).toEqual(1);
        expect(span.dataset['aKey']).toEqual('aValue');
    });
});
