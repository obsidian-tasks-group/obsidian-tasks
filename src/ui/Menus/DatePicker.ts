import type { Task } from '../../Task/Task';
import { RemoveTaskDate, SetTaskDate } from '../EditInstructions/DateInstructions';
import type { AllTaskDateFields } from '../../DateTime/DateFieldTypes';
import type { TaskSaver } from './TaskEditingMenu';

/**
 * A calendar date picker which edits a date value in a {@link Task} object.
 *
 * Shows a small popover under the element, with the same date input as the 'Create or edit task' dialog,
 * and opens its calendar.
 * @param anchorElement - the element to show the picker under.
 * @param task
 * @param dateFieldToEdit
 * @param taskSaver
 */
export function promptForDate(
    anchorElement: HTMLElement,
    task: Task,
    dateFieldToEdit: AllTaskDateFields,
    taskSaver: TaskSaver,
) {
    const doc = anchorElement.ownerDocument;
    doc.querySelectorAll('.tasks-date-picker-popover').forEach((popover) => popover.remove());

    // Outside the element, so that editors do not see it as content. Positioned here, so it never depends on CSS.
    const popover = doc.body.createDiv({ cls: 'tasks-date-picker-popover' });
    const rect = anchorElement.getBoundingClientRect();
    popover.setCssProps({ position: 'fixed', left: `${rect.left}px`, top: `${rect.bottom + 4}px` });

    const input = popover.createEl('input', { cls: 'tasks-date-picker-input', type: 'date' });
    const currentValue = task[dateFieldToEdit];
    input.value = currentValue ? currentValue.format('YYYY-MM-DD') : '';

    // Keep the popover on screen.
    const popoverRect = popover.getBoundingClientRect();
    const view = doc.defaultView ?? window;
    if (popoverRect.bottom > view.innerHeight) {
        popover.setCssProps({ top: `${Math.max(0, rect.top - popoverRect.height - 4)}px` });
    }
    if (popoverRect.right > view.innerWidth) {
        popover.setCssProps({ left: `${Math.max(0, view.innerWidth - popoverRect.width - 4)}px` });
    }

    const close = () => {
        popover.remove();
        doc.removeEventListener('mousedown', onMouseDown, true);
        doc.removeEventListener('keydown', onKeyDown, true);
    };
    const onMouseDown = (event: MouseEvent) => {
        if (!popover.contains(event.target as Node)) {
            close();
        }
    };
    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            close();
        }
    };
    // Wait until the click that opened the picker has finished, so that it does not close it again.
    view.setTimeout(() => {
        doc.addEventListener('mousedown', onMouseDown, true);
        doc.addEventListener('keydown', onKeyDown, true);
    }, 0);

    input.addEventListener('change', async () => {
        const newTask =
            input.value === ''
                ? new RemoveTaskDate(dateFieldToEdit, task).apply(task)
                : new SetTaskDate(dateFieldToEdit, window.moment(input.value, 'YYYY-MM-DD').toDate()).apply(task);
        close();
        await taskSaver(task, newTask);
    });

    input.focus();
    try {
        input.showPicker();
    } catch {
        // showPicker() is not available on some platforms: the user can click the input instead.
    }
}
