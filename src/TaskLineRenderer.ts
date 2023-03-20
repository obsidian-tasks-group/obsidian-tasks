import { Component, MarkdownRenderer } from 'obsidian';
import type { Moment } from 'moment';
import type { Task } from './Task';
import * as taskModule from './Task';
import type { LayoutOptions, TaskLayoutComponent } from './TaskLayout';
import { TaskLayout } from './TaskLayout';
import { replaceTaskWithTasks } from './File';
import { TASK_FORMATS, getSettings } from './Config/Settings';

export type TaskLineRenderDetails = {
    parentUlElement: HTMLElement;
    /** The nth item in this list (including non-tasks). */
    listIndex: number;
    layoutOptions?: LayoutOptions;
    isFilenameUnique?: boolean;
};

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
    await taskToHtml(task, renderDetails, textSpan, textRenderer);

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
    let taskAsString = '';
    const taskLayout = new TaskLayout(renderDetails.layoutOptions);
    const emojiSerializer = TASK_FORMATS.tasksPluginEmoji.taskSerializer;
    for (const component of taskLayout.layoutComponents) {
        let componentString = emojiSerializer.componentToString(task, taskLayout, component);
        if (componentString) {
            if (component === 'description') componentString = removeGlobalFilterIfNeeded(componentString);
            taskAsString += componentString;
        }
    }

    const { debugSettings } = getSettings();
    if (debugSettings.showTaskHiddenData) {
        // Add some debug output to enable hidden information in the task to be inspected.
        taskAsString += `<br>🐛 <b>${task.lineNumber}</b> . ${task.sectionStart} . ${task.sectionIndex} . '<code>${task.originalMarkdown}</code>'<br>'<code>${task.path}</code>' > '<code>${task.precedingHeader}</code>'<br>`;
    }

    await renderComponentText(parentElement, taskAsString, 'description', task, textRenderer);
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

function removeGlobalFilterIfNeeded(description: string) {
    const { globalFilter, removeGlobalFilter } = getSettings();
    if (removeGlobalFilter) {
        return description.replace(globalFilter, '').trim();
    }
    return description;
}
