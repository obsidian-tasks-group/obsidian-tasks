import type { Moment } from 'moment';

import type { TaskLayoutComponent } from '../Layout/TaskLayoutOptions';
import { PriorityTools } from '../lib/PriorityTools';
import type { Task } from '../Task/Task';

export class TaskFieldRenderer {
    private readonly data = taskFieldHTMLData;

    /**
     * Adds data attribute to an {@link element} for a component. For example,
     * a `<span>` describing a task with medium priority and done yesterday will have
     * `data-task-priority="medium" data-task-due="past-1d"` in its data attributes (One data attribute per component).
     *
     * If no data attribute was found for a component or data attribute's value is empty, data attribute won't be added.
     *
     * For detailed calculation see {@link TaskFieldHTMLData.addDataAttribute}.
     *
     * @param element the HTML element to add the data attribute to.
     * @param task the task from which the for the data attribute shall be taken.
     * @param component the component of the task for which the data attribute has to be added.
     */
    public addDataAttribute(element: HTMLElement, task: Task, component: TaskLayoutComponent) {
        this.data[component].addDataAttribute(element, task, component);
    }

    /**
     * Adds the component's CSS class describing what this component is (priority, due date etc.) to an HTML element.
     *
     * @param element where the class shall be added.
     *
     * @param component of the task.
     */
    public addClassName(element: HTMLElement, component: TaskLayoutComponent) {
        const componentClass = this.data[component].className;
        element.classList.add(...[componentClass]);
    }
}

type AttributeValueCalculator = (component: TaskLayoutComponent, task: Task) => string;

export class TaskFieldHTMLData {
    public readonly className: string;
    private readonly attributeName: string;
    private readonly attributeValueCalculator: AttributeValueCalculator;

    public static readonly noAttributeName = '';
    public static readonly noAttributeValueCalculator: AttributeValueCalculator = () => {
        return '';
    };
    public static readonly dateAttributeCalculator = (component: TaskLayoutComponent, task: Task) => {
        /**
         * Translate a relative date to a CSS class: 'today', 'future-1d' (for tomorrow), 'past-1d' (for yesterday)
         * etc.
         * A cutoff (in days) is defined in MAX_DAY_VALUE_RANGE, from beyond that a generic 'far' postfix will be added.
         * (the cutoff exists because we don't want to flood the DOM with potentially hundreds of unique classes.)
         */
        const MAX_DAY_VALUE_RANGE = 7;
        const DAY_VALUE_OVER_RANGE_POSTFIX = 'far';

        function dateToAttribute(date: Moment) {
            const today = window.moment().startOf('day');
            const diffDays = today.diff(date, 'days');

            if (isNaN(diffDays)) {
                return null;
            }
            if (diffDays === 0) {
                return 'today';
            }

            let result = '';
            if (diffDays > 0) {
                result += 'past-';
            } else if (diffDays < 0) {
                result += 'future-';
            }

            if (Math.abs(diffDays) <= MAX_DAY_VALUE_RANGE) {
                result += Math.abs(diffDays).toString() + 'd';
            } else {
                result += DAY_VALUE_OVER_RANGE_POSTFIX;
            }
            return result;
        }

        const date = task[component];

        // TS2345: Argument of type 'string[] | Moment' is not assignable to parameter of type 'Moment'.
        // Type 'string[]' is missing the following properties from type 'Moment': format, startOf, endOf, add, and 78 more.
        if (!Array.isArray(date) && date instanceof window.moment) {
            const attributeValue = dateToAttribute(date);
            if (attributeValue) {
                return attributeValue;
            }
        }
        return '';
    };

    /**
     * @param className CSS class that describes what the component is, e.g. a due date or a priority.
     *
     * @param attributeName if the component needs data attribute (`data-key="value"`) this is the key.
     * Otherwise, set this to {@link TaskFieldHTMLData.noAttributeName}.
     *
     * @param attributeValueCalculator And this is the value calculator.
     * Set to {@link TaskFieldHTMLData.noAttributeValueCalculator} if the component has no data attribute.
     *
     * There is a relation between {@link attributeName} and {@link attributeValueCalculator}.
     * For a component to have the data attribute, both need to be set to values other than
     * {@link TaskFieldHTMLData.noAttributeName} and {@link TaskFieldHTMLData.noAttributeValueCalculator} respectively.
     * This means that having an empty data attribute (`data-key=""`) is not supported.
     */
    constructor(className: string, attributeName: string, attributeValueCalculator: AttributeValueCalculator) {
        // If className is empty, `span.classList.add(...componentClass);` will fail in runtime.
        if (className === '') {
            throw Error('Developer note: CSS class cannot be an empty string, please specify one.');
        }
        this.className = className;
        this.attributeName = attributeName;
        this.attributeValueCalculator = attributeValueCalculator;
    }

    /**
     * Shall be called only by {@link TaskFieldRenderer}. Use that class if you need to add a data attribute.
     *
     * Adds the data attribute, associated to with a task's component to an HTML element.
     * For example, a task with medium priority and done yesterday will have
     * `data-task-priority="medium" data-task-due="past-1d" ` in its data attributes (One data attribute per component).
     *
     * Calculation of the value is done with {@link TaskFieldHTMLData.attributeValueCalculator}.
     *
     * If the data attribute's key or its value is an empty string, no data attribute will be added.
     *
     * @param element the HTML element to add the data attribute to.
     * @param task the task from which the data shall be taken.
     * @param component the component of the task for which the data attribute has to be added.
     */
    public addDataAttribute(element: HTMLElement, task: Task, component: TaskLayoutComponent) {
        if (this.attributeName === TaskFieldHTMLData.noAttributeName) {
            return;
        }

        const attributeValue = this.attributeValueCalculator(component, task);
        if (attributeValue === '') {
            return;
        }

        element.dataset[this.attributeName] = attributeValue;
    }
}

function createFieldWithoutDataAttributes(className: string) {
    return new TaskFieldHTMLData(
        className,
        TaskFieldHTMLData.noAttributeName,
        TaskFieldHTMLData.noAttributeValueCalculator,
    );
}

function createDateField(className: string, attributeName: string) {
    return new TaskFieldHTMLData(className, attributeName, TaskFieldHTMLData.dateAttributeCalculator);
}

const taskFieldHTMLData: { [c in TaskLayoutComponent]: TaskFieldHTMLData } = {
    // NEW_TASK_FIELD_EDIT_REQUIRED
    createdDate: createDateField('task-created', 'taskCreated'),
    dueDate: createDateField('task-due', 'taskDue'),
    startDate: createDateField('task-start', 'taskStart'),
    scheduledDate: createDateField('task-scheduled', 'taskScheduled'),
    doneDate: createDateField('task-done', 'taskDone'),
    cancelledDate: createDateField('task-cancelled', 'taskCancelled'),

    priority: new TaskFieldHTMLData('task-priority', 'taskPriority', (_component, task) => {
        return PriorityTools.priorityNameUsingNormal(task.priority).toLocaleLowerCase();
    }),

    description: createFieldWithoutDataAttributes('task-description'),
    recurrenceRule: createFieldWithoutDataAttributes('task-recurring'),
    dependsOn: createFieldWithoutDataAttributes('task-dependsOn'),
    id: createFieldWithoutDataAttributes('task-id'),
    blockLink: createFieldWithoutDataAttributes('task-block-link'),
};
