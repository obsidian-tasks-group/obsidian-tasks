/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { TaskLayoutComponent } from '../../src/Layout/TaskLayoutOptions';
import { TaskFieldHTMLData, TaskFieldRenderer } from '../../src/Renderer/TaskFieldRenderer';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

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

        fieldRenderer.addDataAttribute(span, task, TaskLayoutComponent.DueDate);

        expect(span).toHaveDataAttributes('taskDue: future-1d');
    });

    it('should add a data attribute for an existing component (not date)', () => {
        const task = TaskBuilder.createFullyPopulatedTask();
        const span = document.createElement('span');

        fieldRenderer.addDataAttribute(span, task, TaskLayoutComponent.Priority);

        expect(span).toHaveDataAttributes('taskPriority: medium');
    });

    it('should not add any data attributes for a missing component', () => {
        const task = new TaskBuilder().build();
        const span = document.createElement('span');

        fieldRenderer.addDataAttribute(span, task, TaskLayoutComponent.RecurrenceRule);

        expect(span).toHaveDataAttributes('');
    });

    it('should add a class name for a component', () => {
        const span = document.createElement('span');

        fieldRenderer.addClassName(span, TaskLayoutComponent.StartDate);

        expect(span.classList.toString()).toEqual('task-start');
    });
});

describe('Field Layout Detail tests', () => {
    it('should supply a class name', () => {
        const fieldLayoutDetail = new TaskFieldHTMLData('task-description', '', () => {
            return '';
        });
        expect(fieldLayoutDetail.className).toEqual('task-description');
    });

    it('should add a data attribute with a value and a name', () => {
        const fieldLayoutDetail = new TaskFieldHTMLData('task-priority', 'taskPriority', () => {
            return 'highest';
        });
        const span = document.createElement('span');

        fieldLayoutDetail.addDataAttribute(span, new TaskBuilder().build(), TaskLayoutComponent.Priority);

        expect(span).toHaveDataAttributes('taskPriority: highest');
    });

    it('should not add a data attribute without a name', () => {
        const fieldLayoutDetail = new TaskFieldHTMLData('task-due', '', () => {
            return 'past-far';
        });
        const span = document.createElement('span');

        fieldLayoutDetail.addDataAttribute(span, new TaskBuilder().build(), TaskLayoutComponent.DueDate);

        expect(span).toHaveDataAttributes('');
    });

    it('should not add a data attribute with a name but without value', () => {
        const fieldLayoutDetail = new TaskFieldHTMLData('task-start', 'taskStart', () => {
            return '';
        });
        const span = document.createElement('span');

        fieldLayoutDetail.addDataAttribute(span, new TaskBuilder().build(), TaskLayoutComponent.StartDate);

        expect(span).toHaveDataAttributes('');
    });
});
