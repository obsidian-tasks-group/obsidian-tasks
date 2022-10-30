import { Component, MarkdownRenderer } from 'obsidian';
import type { Moment } from 'moment';
import type { Task } from './Task';
import * as taskModule from './Task';
import type { LayoutOptions } from './TaskLayout';
import { getSettings } from './Config/Settings';
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

    let taskAsString = task.toString(renderDetails.layoutOptions);
    const { globalFilter, removeGlobalFilter } = getSettings();
    if (removeGlobalFilter) {
        taskAsString = taskAsString.replace(globalFilter, '').trim();
    }

    const textSpan = li.createSpan();
    textSpan.addClass('tasks-list-text');

    await MarkdownRenderer.renderMarkdown(taskAsString, textSpan, task.path, null as unknown as Component);

    // If the task is a block quote, the block quote wraps the p-tag that contains the content.
    // In that case, we need to unwrap the p-tag *inside* the surrounding block quote.
    // Otherwise, we unwrap the p-tag as a direct descendant of the textSpan.
    const blockQuote = textSpan.querySelector('blockquote');
    const directParentOfPTag = blockQuote ?? textSpan;

    // Unwrap the p-tag that was created by the MarkdownRenderer:
    const pElement = directParentOfPTag.querySelector('p');
    if (pElement !== null) {
        while (pElement.firstChild) {
            directParentOfPTag.insertBefore(pElement.firstChild, pElement);
        }
        pElement.remove();
    }

    // Remove an empty trailing p-tag that the MarkdownRenderer appends when there is a block link:
    textSpan.findAll('p').forEach((pElement) => {
        if (!pElement.hasChildNodes()) {
            pElement.remove();
        }
    });

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
