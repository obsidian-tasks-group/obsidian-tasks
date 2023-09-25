import { Component, MarkdownRenderer } from 'obsidian';
import type { Moment } from 'moment';
import type { Task } from './Task';
import * as taskModule from './Task';
import type { LayoutOptions, TaskLayoutComponent } from './TaskLayout';
import { TaskLayout } from './TaskLayout';
import { replaceTaskWithTasks } from './File';
import { TASK_FORMATS, getSettings } from './Config/Settings';
import { GlobalFilter } from './Config/GlobalFilter';
import { PriorityTools } from './lib/PriorityTools';

export type TaskLineRenderDetails = {
    parentUlElement: HTMLElement;
    /** The nth item in this list (including non-tasks). */
    listIndex: number;
    obsidianComponent: Component | null;
    layoutOptions?: LayoutOptions;
    isFilenameUnique?: boolean;
    taskLayout?: TaskLayout;
};

export const LayoutClasses: { [c in TaskLayoutComponent]: string } = {
    description: 'task-description',
    priority: 'task-priority',
    dueDate: 'task-due',
    startDate: 'task-start',
    createdDate: 'task-created',
    scheduledDate: 'task-scheduled',
    doneDate: 'task-done',
    recurrenceRule: 'task-recurring',
    blockLink: '',
};

const MAX_DAY_VALUE_RANGE = 7;
const DAY_VALUE_OVER_RANGE_POSTFIX = 'far';

/**
 * The function used to render a Markdown task line into an existing HTML element.
 */
export type TextRenderer = (
    text: string,
    element: HTMLSpanElement,
    path: string,
    obsidianComponent: Component | null, // null is allowed here only for tests
) => Promise<void>;

/**
 * Renders a given Task object into an HTML List Item (LI) element, using the given renderDetails
 * configuration and a supplied TextRenderer (typically the Obsidian Markdown renderer, but for testing
 * purposes it can be a simpler one).
 * The element includes the task and its various components (description, priority, block link etc), the
 * checkbox on the left with its event handling of completing the task, and the button for editing the task.
 */
export async function renderTaskLine(
    task: Task,
    renderDetails: TaskLineRenderDetails,
    textRenderer: TextRenderer,
): Promise<HTMLLIElement> {
    const li: HTMLLIElement = document.createElement('li');
    renderDetails.parentUlElement.appendChild(li);

    li.classList.add('task-list-item', 'plugin-tasks-list-item');

    // Maintenance note:
    //  We don't use the Obsidian convenience function li.createEl() here, because we don't have it available
    //  when running tests, and we want the tests to be able to create the full div and span structure,
    //  so had to convert all of these to the equivalent but more elaborate document.createElement() and
    //  appendChild() calls.
    const textSpan = document.createElement('span');
    li.appendChild(textSpan);
    textSpan.classList.add('tasks-list-text');
    const attributes = await taskToHtml(task, renderDetails, textSpan, textRenderer);
    for (const key in attributes) li.dataset[key] = attributes[key];

    // NOTE: this area is mentioned in `CONTRIBUTING.md` under "How does Tasks handle status changes". When
    // moving the code, remember to update that reference too.
    const checkbox = document.createElement('input');
    li.appendChild(checkbox);
    checkbox.classList.add('task-list-item-checkbox');
    checkbox.type = 'checkbox';
    if (task.status.symbol !== ' ') {
        checkbox.checked = true;
        li.classList.add('is-checked');
    }

    checkbox.addEventListener('click', (event: MouseEvent) => {
        event.preventDefault();
        // It is required to stop propagation so that obsidian won't write the file with the
        // checkbox (un)checked. Obsidian would write after us and overwrite our change.
        event.stopPropagation();

        // Should be re-rendered as enabled after update in file.
        checkbox.disabled = true;
        const toggledTasks = task.toggleWithRecurrenceInUsersOrder();
        replaceTaskWithTasks({
            originalTask: task,
            newTasks: toggledTasks,
        });
    });

    li.prepend(checkbox);

    // Set these to be compatible with stock obsidian lists:
    li.setAttribute('data-task', task.status.symbol.trim()); // Trim to ensure empty attribute for space. Same way as obsidian.
    li.setAttribute('data-line', renderDetails.listIndex.toString());
    li.setAttribute('data-task-status-name', task.status.name);
    li.setAttribute('data-task-status-type', task.status.type);
    checkbox.setAttribute('data-line', renderDetails.listIndex.toString());

    if (renderDetails.layoutOptions?.shortMode) {
        addTooltip({ task, element: textSpan, isFilenameUnique: renderDetails.isFilenameUnique });
    }

    return li;
}

export type AttributesDictionary = { [key: string]: string };

async function taskToHtml(
    task: Task,
    renderDetails: TaskLineRenderDetails,
    parentElement: HTMLElement,
    textRenderer: TextRenderer,
): Promise<AttributesDictionary> {
    let allAttributes: AttributesDictionary = {};
    const taskLayout = new TaskLayout(renderDetails.layoutOptions);
    const emojiSerializer = TASK_FORMATS.tasksPluginEmoji.taskSerializer;
    // Render and build classes for all the task's visible components
    for (const component of taskLayout.shownTaskLayoutComponents) {
        let componentString = emojiSerializer.componentToString(task, taskLayout, component);
        if (componentString) {
            if (component === 'description') {
                componentString = GlobalFilter.getInstance().removeAsWordFromDependingOnSettings(componentString);
            }
            // Create the text span that will hold the rendered component
            const span = document.createElement('span');
            parentElement.appendChild(span);
            if (span) {
                // Inside that text span, we are creating another internal span, that will hold the text itself.
                // This may seem redundant, and by default it indeed does nothing, but we do it to allow the CSS
                // to differentiate between the container of the text and the text itself, so it will be possible
                // to do things like surrouding only the text (rather than its whole placeholder) with a highlight
                const internalSpan = document.createElement('span');
                span.appendChild(internalSpan);
                await renderComponentText(
                    internalSpan,
                    componentString,
                    component,
                    task,
                    textRenderer,
                    renderDetails.obsidianComponent,
                );
                addInternalClasses(component, internalSpan);

                // Add the component's CSS class describing what this component is (priority, due date etc.)
                const componentClass = getTaskComponentClass(component, task);
                span.classList.add(...componentClass);

                // Add the component's attribute ('priority-medium', 'due-past-1d' etc.)
                const componentDataAttribute = getComponentDataAttribute(component, task);
                for (const key in componentDataAttribute) span.dataset[key] = componentDataAttribute[key];
                allAttributes = { ...allAttributes, ...componentDataAttribute };
            }
        }
    }

    // Now build classes for the hidden task components without rendering them
    for (const component of taskLayout.hiddenTaskLayoutComponents) {
        const hiddenComponentDataAttribute = getComponentDataAttribute(component, task);
        allAttributes = { ...allAttributes, ...hiddenComponentDataAttribute };
    }

    // If a task has no priority field set, its priority will not be rendered as part of the loop above and
    // it will not be set a priority data attribute.
    // In such a case we want the upper task LI element to mark the task has a 'normal' priority.
    // So if the priority was not rendered, force it through the pipe of getting the component data for the
    // priority field.
    if (allAttributes.taskPriority === undefined) {
        const priorityDataAttribute = getComponentDataAttribute('priority', task);
        allAttributes = { ...allAttributes, ...priorityDataAttribute };
    }

    return allAttributes;
}

/*
 * Renders the given component into the given HTML span element.
 */
async function renderComponentText(
    span: HTMLSpanElement,
    componentString: string,
    component: TaskLayoutComponent,
    task: Task,
    textRenderer: TextRenderer,
    obsidianComponent: Component | null,
) {
    if (component === 'description') {
        const { debugSettings } = getSettings();
        if (debugSettings.showTaskHiddenData) {
            // Add some debug output to enable hidden information in the task to be inspected.
            componentString += `<br>🐛 <b>${task.lineNumber}</b> . ${task.sectionStart} . ${task.sectionIndex} . '<code>${task.originalMarkdown}</code>'<br>'<code>${task.path}</code>' > '<code>${task.precedingHeader}</code>'<br>`;
        }
        await textRenderer(componentString, span, task.path, obsidianComponent);

        // If the task is a block quote, the block quote wraps the p-tag that contains the content.
        // In that case, we need to unwrap the p-tag *inside* the surrounding block quote.
        // Otherwise, we unwrap the p-tag as a direct descendant of the span.
        const blockQuote = span.querySelector('blockquote');
        const directParentOfPTag = blockQuote ?? span;

        // Unwrap the p-tag that was created by the MarkdownRenderer:
        const pElement = directParentOfPTag.querySelector('p');
        if (pElement !== null) {
            while (pElement.firstChild) {
                directParentOfPTag.insertBefore(pElement.firstChild, pElement);
            }
            pElement.remove();
        }

        // Remove an empty trailing p-tag that the MarkdownRenderer appends when there is a block link:
        span.querySelectorAll('p').forEach((pElement) => {
            if (!pElement.hasChildNodes()) {
                pElement.remove();
            }
        });

        // Remove the footnote that the MarkdownRenderer appends when there is a footnote in the task:
        span.querySelectorAll('.footnotes').forEach((footnoteElement) => {
            footnoteElement.remove();
        });
    } else {
        span.innerHTML = componentString;
    }
}

/**
 * The CSS class that describes what the component is, e.g. a due date or a priority, and is a value from LayoutClasses.
 */
function getTaskComponentClass(component: TaskLayoutComponent, task: Task) {
    const componentClassContainer: string[] = [];

    const componentClass = LayoutClasses[component];
    switch (component) {
        case 'blockLink':
            break;
        case 'description':
        case 'priority':
        case 'recurrenceRule':
            componentClassContainer.push(componentClass);
            break;
        case 'createdDate':
        case 'dueDate':
        case 'startDate':
        case 'scheduledDate':
        case 'doneDate': {
            const date = task[component];
            if (date) {
                componentClassContainer.push(componentClass);
            }
            break;
        }
    }
    return componentClassContainer;
}

/**
 * The data attribute describes the content of the component, e.g. `data-task-priority="medium"`, `data-task-due="past-1d"` etc.
 */
function getComponentDataAttribute(component: TaskLayoutComponent, task: Task) {
    const dataAttribute: AttributesDictionary = {};

    // If a TaskLayoutComponent needs a data attribute in the task's <span>, add the data attribute name
    // to this dictionary: key is the component, value is the data attribute name.
    // Otherwise, just leave an empty string ('') as the value.
    // Also add the new component to the switch-case below in this function. This is where
    // the data attribute value shall be calculated and set in the returned dictionary.
    const DataAttributeNames: { [c in TaskLayoutComponent]: string } = {
        createdDate: 'taskCreated',
        dueDate: 'taskDue',
        startDate: 'taskStart',
        scheduledDate: 'taskScheduled',
        doneDate: 'taskDone',
        priority: 'taskPriority',
        description: '',
        recurrenceRule: '',
        blockLink: '',
    };

    switch (component) {
        case 'description':
        case 'recurrenceRule':
        case 'blockLink':
            break;
        case 'priority': {
            const attributeName = DataAttributeNames[component];
            dataAttribute[attributeName] = PriorityTools.priorityNameUsingNormal(task.priority).toLocaleLowerCase();
            break;
        }
        case 'createdDate':
        case 'dueDate':
        case 'startDate':
        case 'scheduledDate':
        case 'doneDate': {
            const date = task[component];
            if (date) {
                const attributeValue = dateToAttribute(date);
                if (attributeValue) {
                    const attributeName = DataAttributeNames[component];
                    dataAttribute[attributeName] = attributeValue;
                }
            }
            break;
        }
    }
    return dataAttribute;
}

/*
 * Adds internal classes for various components (right now just tags actually), meaning that we modify the existing
 * rendered element to add classes inside it.
 * In the case of tags, Obsidian renders a Markdown description with <a class="tag"> elements for tags. We want to
 * enable users to style these, so we modify the rendered Markdown by adding the specific tag classes for these <a>
 * elements.
 */
function addInternalClasses(component: TaskLayoutComponent, renderedComponent: HTMLSpanElement) {
    if (component === 'description') {
        const tags = renderedComponent.getElementsByClassName('tag');
        for (let i = 0; i < tags.length; i++) {
            const tagName = tags[i].textContent;
            if (tagName) {
                const className = tagToAttributeValue(tagName);
                const element = tags[i] as HTMLElement;
                if (className) element.dataset.tagName = className;
            }
        }
    }
}

/**
 * Translate a relative date to a CSS class: 'today', 'future-1d' (for tomorrow), 'past-1d' (for yesterday)
 * etc.
 * A cutoff (in days) is defined in MAX_DAY_VALUE_RANGE, from beyond that a generic 'far' postfix will be added.
 * (the cutoff exists because we don't want to flood the DOM with potentially hundreds of unique classes.)
 */
function dateToAttribute(date: Moment) {
    const today = window.moment().startOf('day');
    let result = '';
    const diffDays = today.diff(date, 'days');
    if (isNaN(diffDays)) return null;
    if (diffDays === 0) return 'today';
    else if (diffDays > 0) result += 'past-';
    else if (diffDays < 0) result += 'future-';
    if (Math.abs(diffDays) <= MAX_DAY_VALUE_RANGE) {
        result += Math.abs(diffDays).toString() + 'd';
    } else {
        result += DAY_VALUE_OVER_RANGE_POSTFIX;
    }
    return result;
}

/*
 * Sanitize tag names so they will be valid attribute values according to the HTML spec:
 * https://html.spec.whatwg.org/multipage/parsing.html#attribute-value-(double-quoted)-state
 */
function tagToAttributeValue(tag: string) {
    // eslint-disable-next-line no-control-regex
    const illegalChars = /["&\x00\r\n]/g;
    let sanitizedTag = tag.replace(illegalChars, '-');
    // And if after sanitazation the name starts with dashes or underscores, remove them.
    sanitizedTag = sanitizedTag.replace(/^[-_]+/, '');
    if (sanitizedTag.length > 0) return sanitizedTag;
    else return null;
}

function addTooltip({
    task,
    element,
    isFilenameUnique,
}: {
    task: Task;
    element: HTMLElement;
    isFilenameUnique: boolean | undefined;
}): void {
    const { recurrenceSymbol, startDateSymbol, createdDateSymbol, scheduledDateSymbol, dueDateSymbol, doneDateSymbol } =
        TASK_FORMATS.tasksPluginEmoji.taskSerializer.symbols;

    element.addEventListener('mouseenter', () => {
        const tooltip = element.createDiv();
        tooltip.addClasses(['tooltip', 'pop-up']);

        if (task.recurrence) {
            const recurrenceDiv = tooltip.createDiv();
            recurrenceDiv.setText(`${recurrenceSymbol} ${task.recurrence.toText()}`);
        }

        addDateToTooltip(tooltip, task.createdDate, createdDateSymbol);
        addDateToTooltip(tooltip, task.startDate, startDateSymbol);
        addDateToTooltip(tooltip, task.scheduledDate, scheduledDateSymbol);
        addDateToTooltip(tooltip, task.dueDate, dueDateSymbol);
        addDateToTooltip(tooltip, task.doneDate, doneDateSymbol);

        const linkText = task.getLinkText({ isFilenameUnique });
        if (linkText) {
            const backlinkDiv = tooltip.createDiv();
            backlinkDiv.setText(`🔗 ${linkText}`);
        }

        element.addEventListener('mouseleave', () => {
            tooltip.remove();
        });
    });
}

function addDateToTooltip(tooltip: HTMLDivElement, date: moment.Moment | null, signifier: string) {
    if (date) {
        const createdDateDiv = tooltip.createDiv();
        createdDateDiv.setText(
            toTooltipDate({
                signifier: signifier,
                date: date,
            }),
        );
    }
}

function toTooltipDate({ signifier, date }: { signifier: string; date: Moment }): string {
    return `${signifier} ${date.format(taskModule.TaskRegularExpressions.dateFormat)} (${date.from(
        window.moment().startOf('day'),
    )})`;
}

/**
 * Create an HTML rendered List Item element (LI) for a task.
 * @note Output is based on the {@link DefaultTaskSerializer}'s format, with default (emoji) symbols
 * @param task
 * @param renderDetails
 */
export function taskToLi(task: Task, renderDetails: TaskLineRenderDetails): Promise<HTMLLIElement> {
    async function obsidianMarkdownRenderer(
        text: string,
        element: HTMLSpanElement,
        path: string,
        obsidianComponent: Component | null,
    ) {
        if (!obsidianComponent) throw new Error('Must call the Obsidian renderer with an Obsidian Component object');
        await MarkdownRenderer.renderMarkdown(text, element, path, obsidianComponent);
    }

    return renderTaskLine(task, renderDetails, obsidianMarkdownRenderer);
}
