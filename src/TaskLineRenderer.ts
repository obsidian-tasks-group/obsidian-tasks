import { Component, MarkdownRenderer } from 'obsidian';
import type { Moment } from 'moment';
import type { Task } from './Task';
import * as taskModule from './Task';
import type { LayoutOptions, TaskLayoutComponent } from './TaskLayout';
import { TaskLayout } from './TaskLayout';
import { replaceTaskWithTasks } from './File';
import { TASK_FORMATS, getSettings } from './Config/Settings';
import { GlobalFilter } from './Config/GlobalFilter';

export type TaskLineRenderDetails = {
    parentUlElement: HTMLElement;
    /** The nth item in this list (including non-tasks). */
    listIndex: number;
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
export type TextRenderer = (text: string, element: HTMLSpanElement, path: string) => Promise<void>;

async function obsidianMarkdownRenderer(text: string, element: HTMLSpanElement, path: string) {
    await MarkdownRenderer.renderMarkdown(text, element, path, null as unknown as Component);
}

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
    textRenderer: TextRenderer | null = null,
): Promise<HTMLLIElement> {
    if (!textRenderer) textRenderer = obsidianMarkdownRenderer;
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
        const toggledTasks = task.toggle();
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
    for (const component of taskLayout.layoutComponents) {
        let componentString = emojiSerializer.componentToString(task, taskLayout, component);
        if (componentString) {
            if (component === 'description') {
                componentString = GlobalFilter.removeAsSubstringFromDependingOnSettings(componentString);
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
                await renderComponentText(internalSpan, componentString, component, task, textRenderer);
                const [genericClasses, dataAttributes] = getComponentClassesAndData(component, task);
                addInternalClasses(component, internalSpan);
                // Add the generic classes that apply to what this component is (priority, due date etc)
                span.classList.add(...genericClasses);
                // Add the attributes to the component ('priority-medium', 'due-past-1d' etc)
                for (const key in dataAttributes) span.dataset[key] = dataAttributes[key];
                allAttributes = { ...allAttributes, ...dataAttributes };
            }
        }
    }

    // Now build classes for the hidden task components without rendering them
    for (const component of taskLayout.hiddenComponents) {
        const [_, dataAttributes] = getComponentClassesAndData(component, task);
        allAttributes = { ...allAttributes, ...dataAttributes };
    }

    // If a task has no priority field set, its priority will not be rendered as part of the loop above and
    // it will not be set a priority data attribute.
    // In such a case we want the upper task LI element to mark the task has a 'normal' priority.
    // So if the priority was not rendered, force it through the pipe of getting the component data for the
    // priority field.
    if (allAttributes.taskPriority === undefined) {
        const [_, dataAttributes] = getComponentClassesAndData('priority', task);
        allAttributes = { ...allAttributes, ...dataAttributes };
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
) {
    if (component === 'description') {
        const { debugSettings } = getSettings();
        if (debugSettings.showTaskHiddenData) {
            // Add some debug output to enable hidden information in the task to be inspected.
            componentString += `<br>🐛 <b>${task.lineNumber}</b> . ${task.sectionStart} . ${task.sectionIndex} . '<code>${task.originalMarkdown}</code>'<br>'<code>${task.path}</code>' > '<code>${task.precedingHeader}</code>'<br>`;
        }
        await textRenderer(componentString, span, task.path);

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

export type AttributesDictionary = { [key: string]: string };

/**
 * This function returns two lists -- genericClasses and dataAttributes -- that describe the
 * given component.
 * The genericClasses describe what the component is, e.g. a due date or a priority, and are one of the
 * options in LayoutClasses.
 * The dataAttributes describe the content of the component, e.g. `data-task-priority="medium"`, `data-task-due="past-1d"` etc.
 */
function getComponentClassesAndData(component: TaskLayoutComponent, task: Task): [string[], AttributesDictionary] {
    const genericClasses: string[] = [];
    const dataAttributes: AttributesDictionary = {};
    const setDateAttribute = (date: Moment, attributeName: string) => {
        const dateValue = dateToAttribute(date);
        if (dateValue) dataAttributes[attributeName] = dateValue;
    };
    switch (component) {
        case 'description':
            genericClasses.push(LayoutClasses.description);
            break;
        case 'priority': {
            let priorityValue = null;
            if (task.priority === taskModule.Priority.High) priorityValue = 'high';
            else if (task.priority === taskModule.Priority.Medium) priorityValue = 'medium';
            else if (task.priority === taskModule.Priority.Low) priorityValue = 'low';
            else priorityValue = 'normal';
            dataAttributes['taskPriority'] = priorityValue;
            genericClasses.push(LayoutClasses.priority);
            break;
        }
        case 'createdDate': {
            const date = task.createdDate;
            if (date) {
                genericClasses.push(LayoutClasses.createdDate);
                setDateAttribute(date, 'taskCreated');
            }
            break;
        }
        case 'dueDate': {
            const date = task.dueDate;
            if (date) {
                genericClasses.push(LayoutClasses.dueDate);
                setDateAttribute(date, 'taskDue');
            }
            break;
        }
        case 'startDate': {
            const date = task.startDate;
            if (date) {
                genericClasses.push(LayoutClasses.startDate);
                setDateAttribute(date, 'taskStart');
            }
            break;
        }
        case 'scheduledDate': {
            const date = task.scheduledDate;
            if (date) {
                genericClasses.push(LayoutClasses.scheduledDate);
                setDateAttribute(date, 'taskScheduled');
            }
            break;
        }
        case 'doneDate': {
            const date = task.doneDate;
            if (date) {
                genericClasses.push(LayoutClasses.doneDate);
                setDateAttribute(date, 'taskDone');
            }
            break;
        }
        case 'recurrenceRule': {
            genericClasses.push(LayoutClasses.recurrenceRule);
            break;
        }
    }
    return [genericClasses, dataAttributes];
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

        if (task.createdDate) {
            const createdDateDiv = tooltip.createDiv();
            createdDateDiv.setText(
                toTooltipDate({
                    signifier: createdDateSymbol,
                    date: task.createdDate,
                }),
            );
        }

        if (task.startDate) {
            const startDateDiv = tooltip.createDiv();
            startDateDiv.setText(
                toTooltipDate({
                    signifier: startDateSymbol,
                    date: task.startDate,
                }),
            );
        }

        if (task.scheduledDate) {
            const scheduledDateDiv = tooltip.createDiv();
            scheduledDateDiv.setText(
                toTooltipDate({
                    signifier: scheduledDateSymbol,
                    date: task.scheduledDate,
                }),
            );
        }

        if (task.dueDate) {
            const dueDateDiv = tooltip.createDiv();
            dueDateDiv.setText(
                toTooltipDate({
                    signifier: dueDateSymbol,
                    date: task.dueDate,
                }),
            );
        }

        if (task.doneDate) {
            const doneDateDiv = tooltip.createDiv();
            doneDateDiv.setText(
                toTooltipDate({
                    signifier: doneDateSymbol,
                    date: task.doneDate,
                }),
            );
        }

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

function toTooltipDate({ signifier, date }: { signifier: string; date: Moment }): string {
    return `${signifier} ${date.format(taskModule.TaskRegularExpressions.dateFormat)} (${date.from(
        window.moment().startOf('day'),
    )})`;
}
