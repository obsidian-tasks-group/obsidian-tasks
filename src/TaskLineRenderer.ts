import { Component, MarkdownRenderer } from 'obsidian';
import type { Moment } from 'moment';
import { Status } from './Status';
import type { Task } from './Task';
import * as taskModule from './Task';
import type { LayoutOptions, TaskLayoutComponent } from './TaskLayout';
import { TaskLayout } from './TaskLayout';
import { replaceTaskWithTasks } from './File';
import { getSettings } from './Config/Settings';

export type TaskLineRenderDetails = {
    parentUlElement: HTMLElement;
    /** The nth item in this list (including non-tasks). */
    listIndex: number;
    layoutOptions?: LayoutOptions;
    isFilenameUnique?: boolean;
};

export const LayoutClasses: { [c in TaskLayoutComponent]: string } = {
    description: 'task-description',
    priority: 'task-priority',
    dueDate: 'task-due',
    startDate: 'task-start',
    scheduledDate: 'task-scheduled',
    doneDate: 'task-done',
    recurrenceRule: 'task-recurring',
    blockLink: '',
};

const MAX_DAY_CLASS_RANGE = 7;
const DAY_CLASS_OVER_RANGE_POSTFIX = 'far';

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
    const classes = await taskToHtml(task, renderDetails, textSpan, textRenderer);
    li.classList.add(...classes);

    // NOTE: this area is mentioned in `CONTRIBUTING.md` under "How does Tasks handle status changes". When
    // moving the code, remember to update that reference too.
    const checkbox = document.createElement('input');
    li.appendChild(checkbox);
    checkbox.classList.add('task-list-item-checkbox');
    checkbox.type = 'checkbox';
    if (task.status !== Status.TODO) {
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
    li.setAttribute('data-task', task.status.indicator.trim()); // Trim to ensure empty attribute for space. Same way as obsidian.
    li.setAttribute('data-line', renderDetails.listIndex.toString());
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
) {
    const allSpecificClasses: string[] = [];
    const taskLayout = new TaskLayout(renderDetails.layoutOptions);
    for (const component of taskLayout.layoutComponents) {
        let componentString = task.componentToString(taskLayout, component);
        if (componentString) {
            if (component === 'description') componentString = removeGlobalFilterIfNeeded(componentString);
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
                const [genericClasses, specificClasses] = getComponentClasses(component, task);
                // Add the generic classes that apply to what this component is (priority, due date etc)
                span.classList.add(...genericClasses);
                // Add the specific classes that describe the content of the component
                // (task-priority-medium, task-due-past-1d etc).
                span.classList.add(...specificClasses);
                allSpecificClasses.push(...specificClasses);
            }
        }
    }
    return allSpecificClasses;
}

async function renderComponentText(
    span: HTMLSpanElement,
    componentString: string,
    component: TaskLayoutComponent,
    task: Task,
    textRenderer: TextRenderer,
) {
    if (component === 'description') {
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

/**
 * This function returns two lists of tags -- genericClasses and specificClasses -- that describe the
 * given component.
 * The genericClasses describe what the component is, e.g. a due date or a priority, and are one of the
 * options in LayoutClasses.
 * The specificClasses describe the content of the component translated to a CSS class,
 * e.g. task-priority-medium, task-due-past-1d etc.
 */
function getComponentClasses(component: TaskLayoutComponent, task: Task) {
    const genericClasses: string[] = [];
    const specificClasses: string[] = [];
    switch (component) {
        case 'description':
            genericClasses.push(LayoutClasses.description);
            for (const tag of task.tags) {
                // Add task tags as specific classes, but sanitize them first to contain only characters that are legal
                // for CSS classes.
                // Taken from here: https://stackoverflow.com/questions/448981/which-characters-are-valid-in-css-class-names-selectors
                const illegalCssClassChars = /[^_a-zA-Z0-9-]/g;
                let sanitizedTag = tag.replace(illegalCssClassChars, '-');
                // And if after sanitazation the name starts with dashes or underscores, remove them.
                sanitizedTag = sanitizedTag.replace(/^[-_]+/, '');
                if (sanitizedTag.length > 0) specificClasses.push(`task-tag-${sanitizedTag}`);
            }
            break;
        case 'priority': {
            let priorityClass = null;
            if (task.priority === taskModule.Priority.High) priorityClass = 'task-priority-high';
            else if (task.priority === taskModule.Priority.Medium) priorityClass = 'task-priority-medium';
            else if (task.priority === taskModule.Priority.Low) priorityClass = 'task-priority-low';
            else priorityClass = 'task-priority-none';
            genericClasses.push(LayoutClasses.priority);
            specificClasses.push(priorityClass);
            break;
        }
        case 'dueDate': {
            const date = task.dueDate;
            if (date) {
                genericClasses.push(LayoutClasses.dueDate);
                const dateClass = dateToClassName(date);
                if (dateClass) specificClasses.push('task-due-' + dateClass);
            }
            break;
        }
        case 'startDate': {
            const date = task.startDate;
            if (date) {
                genericClasses.push(LayoutClasses.startDate);
                const dateClass = dateToClassName(date);
                if (dateClass) specificClasses.push('task-start-' + dateClass);
            }
            break;
        }
        case 'scheduledDate': {
            const date = task.scheduledDate;
            if (date) {
                genericClasses.push(LayoutClasses.scheduledDate);
                const dateClass = dateToClassName(date);
                if (dateClass) specificClasses.push('task-scheduled-' + dateClass);
            }
            break;
        }
        case 'doneDate': {
            const date = task.doneDate;
            if (date) {
                genericClasses.push(LayoutClasses.doneDate);
                const dateClass = dateToClassName(date);
                if (dateClass) specificClasses.push('task-done-' + dateClass);
            }
            break;
        }
        case 'recurrenceRule': {
            genericClasses.push(LayoutClasses.recurrenceRule);
            break;
        }
    }
    return [genericClasses, specificClasses];
}

/**
 * Translate a relative date to a CSS class: 'today', 'future-1d' (for tomorrow), 'past-1d' (for yesterday)
 * etc.
 * A cutoff (in days) is defined in MAX_DAY_CLASS_RANGE, from beyond that a generic 'far' postfix will be added.
 * (the cutoff exists because we don't want to flood the DOM with potentially hundreds of unique classes.)
 */
function dateToClassName(date: Moment) {
    const today = window.moment().startOf('day');
    let result = '';
    const diffDays = today.diff(date, 'days');
    if (diffDays === 0) return 'today';
    else if (diffDays > 0) result += 'past-';
    else if (diffDays < 0) result += 'future-';
    if (Math.abs(diffDays) <= MAX_DAY_CLASS_RANGE) {
        result += Math.abs(diffDays).toString() + 'd';
    } else {
        result += DAY_CLASS_OVER_RANGE_POSTFIX;
    }
    return result;
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
    element.addEventListener('mouseenter', () => {
        const tooltip = element.createDiv();
        tooltip.addClasses(['tooltip', 'mod-right']);

        if (task.recurrence) {
            const recurrenceDiv = tooltip.createDiv();
            recurrenceDiv.setText(`${taskModule.recurrenceSymbol} ${task.recurrence.toText()}`);
        }

        if (task.startDate) {
            const startDateDiv = tooltip.createDiv();
            startDateDiv.setText(
                toTooltipDate({
                    signifier: taskModule.startDateSymbol,
                    date: task.startDate,
                }),
            );
        }

        if (task.scheduledDate) {
            const scheduledDateDiv = tooltip.createDiv();
            scheduledDateDiv.setText(
                toTooltipDate({
                    signifier: taskModule.scheduledDateSymbol,
                    date: task.scheduledDate,
                }),
            );
        }

        if (task.dueDate) {
            const dueDateDiv = tooltip.createDiv();
            dueDateDiv.setText(
                toTooltipDate({
                    signifier: taskModule.dueDateSymbol,
                    date: task.dueDate,
                }),
            );
        }

        if (task.doneDate) {
            const doneDateDiv = tooltip.createDiv();
            doneDateDiv.setText(
                toTooltipDate({
                    signifier: taskModule.doneDateSymbol,
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

function removeGlobalFilterIfNeeded(description: string) {
    const { globalFilter, removeGlobalFilter } = getSettings();
    if (removeGlobalFilter) {
        return description.replace(globalFilter, '').trim();
    }
    return description;
}
