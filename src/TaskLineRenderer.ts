import { Component, MarkdownRenderer } from 'obsidian';
import type { Moment } from 'moment';
import type { Task } from './Task';
import * as taskModule from './Task';
import type { LayoutComponent, LayoutOptions } from './TaskLayout';
import { TaskLayout } from './TaskLayout';
import { replaceTaskWithTasks } from './File';

export type TaskLineRenderDetails = {
    parentUlElement: HTMLElement;
    /** The nth item in this list (including non-tasks). */
    listIndex: number;
    layoutOptions?: LayoutOptions;
    isFilenameUnique?: boolean;
};

export async function renderTaskLine(task: Task, renderDetails: TaskLineRenderDetails): Promise<HTMLLIElement> {
    const li: HTMLLIElement = renderDetails.parentUlElement.createEl('li');
    li.addClasses(['task-list-item', 'plugin-tasks-list-item']);

    const textSpan = li.createSpan();
    textSpan.addClass('tasks-list-text');
    const classes = await taskToHtml(task, renderDetails, textSpan);
    li.addClasses(classes);

    // TODO understand and fix this
    // If the task is a block quote, the block quote wraps the p-tag that contains the content.
    // In that case, we need to unwrap the p-tag *inside* the surrounding block quote.
    // Otherwise, we unwrap the p-tag as a direct descendant of the textSpan.
    // const blockQuote = textSpan.querySelector('blockquote');
    // const directParentOfPTag = blockQuote ?? textSpan;

    // // Remove an empty trailing p-tag that the MarkdownRenderer appends when there is a block link:
    // textSpan.findAll('p').forEach((pElement) => {
    //     if (!pElement.hasChildNodes()) {
    //         pElement.remove();
    //     }
    // });

    // Remove the footnote that the MarkdownRenderer appends when there is a footnote in the task:
    textSpan.findAll('.footnotes').forEach((footnoteElement) => {
        footnoteElement.remove();
    });

    const checkbox = li.createEl('input');
    checkbox.addClass('task-list-item-checkbox');
    checkbox.type = 'checkbox';
    if (task.status !== taskModule.Status.TODO) {
        checkbox.checked = true;
        li.addClass('is-checked');
    }
    checkbox.onClickEvent((event: MouseEvent) => {
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
    li.setAttr('data-task', task.originalStatusCharacter.trim()); // Trim to ensure empty attribute for space. Same way as obsidian.
    li.setAttr('data-line', renderDetails.listIndex);
    checkbox.setAttr('data-line', renderDetails.listIndex);

    if (renderDetails.layoutOptions?.shortMode) {
        addTooltip({ task, element: textSpan, isFilenameUnique: renderDetails.isFilenameUnique });
    }

    return li;
}

async function taskToHtml(task: Task, renderDetails: TaskLineRenderDetails, parentElement: HTMLElement) {
    const allSpecificClasses: string[] = [];
    const taskLayout = new TaskLayout(renderDetails.layoutOptions);
    for (const component of taskLayout.layoutComponents) {
        const componentString = task.componentToString(taskLayout, component);
        if (componentString) {
            const span = parentElement.createSpan();
            if (span) {
                parentElement.appendChild(span);
                // TODO explain the purpose of this (to enable different formatting to layout like table cells and the text itself)
                const internalSpan = span.createSpan();
                await renderComponentText(internalSpan, componentString, component, task);
                const [genericClasses, specificClasses] = getComponentClasses(component, task);
                span.addClasses(genericClasses);
                span.addClasses(specificClasses);
                allSpecificClasses.push(...specificClasses);
            }
        }
    }
    return allSpecificClasses;
}

async function renderComponentText(
    span: HTMLSpanElement,
    componentString: string,
    component: LayoutComponent,
    task: Task,
) {
    if (component === 'description') {
        await MarkdownRenderer.renderMarkdown(componentString, span, task.path, null as unknown as Component);
        // Unwrap the p-tag that was created by the MarkdownRenderer:
        // TODO understand the block quote thing
        const pElement = span.querySelector('p');
        if (pElement !== null) {
            while (pElement.firstChild) {
                span.insertBefore(pElement.firstChild, pElement);
            }
            pElement.remove();
        }
    } else {
        span.innerHTML = componentString;
    }
}

function getComponentClasses(component: LayoutComponent, task: Task) {
    // TODO explain the difference
    const genericClasses: string[] = [];
    const specificClasses: string[] = [];
    switch (component) {
        case 'description':
            genericClasses.push('task-description');
            break;
        case 'priority': {
            let priorityClass = null;
            if (task.priority === taskModule.Priority.High) priorityClass = 'task-priority-high';
            else if (task.priority === taskModule.Priority.Medium) priorityClass = 'task-priority-medium';
            else if (task.priority === taskModule.Priority.Low) priorityClass = 'task-priority-low';
            else priorityClass = 'task-priority-none';
            genericClasses.push('task-priority');
            specificClasses.push(priorityClass);
            break;
        }
        case 'dueDate': {
            const date = task.dueDate;
            if (date) {
                genericClasses.push('task-due');
                specificClasses.push('task-due-' + dateToClassName(date));
            }
            break;
        }
        case 'startDate': {
            const date = task.startDate;
            if (date) {
                genericClasses.push('task-start');
                specificClasses.push('task-start-' + dateToClassName(date));
            }
            break;
        }
        case 'scheduledDate': {
            const date = task.scheduledDate;
            if (date) {
                genericClasses.push('task-scheduled');
                specificClasses.push('task-scheduled-' + dateToClassName(date));
            }
            break;
        }
        case 'doneDate': {
            const date = task.doneDate;
            if (date) {
                genericClasses.push('task-done');
                specificClasses.push('task-done-' + dateToClassName(date));
            }
            break;
        }
        case 'recurrenceRule': {
            genericClasses.push('task-recurring');
            break;
        }
    }
    return [genericClasses, specificClasses];
}

// TODO document
function dateToClassName(date: Moment) {
    const today = window.moment().startOf('day');
    let result = '';
    const diffDays = today.diff(date, 'days');
    if (diffDays === 0) return 'today';
    else if (diffDays > 0) result += 'past-';
    else if (diffDays < 0) result += 'future-';
    result += diffDays.toString() + 'd';
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
