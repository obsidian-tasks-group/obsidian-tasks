import type { Task } from 'Task/Task';
import { RemoveTaskDate, SetTaskDate } from 'ui/EditInstructions/DateInstructions';
import type { AllTaskDateFields } from 'DateTime/DateFieldTypes';
import { splitDateText } from 'DateTime/Postponer';
import type { TaskSaver } from 'ui/Menus/TaskEditingMenu';

/** A Svelte action which also lets rendered tasks use the same native date picker. */
export function datePicker(input: HTMLInputElement) {
    input.type = 'date';
    const open = () => {
        try {
            input.showPicker();
        } catch {
            // On platforms without showPicker(), the input remains clickable and editable.
        }
    };
    input.addEventListener('click', open);
    return { destroy: () => input.removeEventListener('click', open) };
}

let closeDatePicker: (() => void) | undefined;

/**
 * A calendar date picker which edits a date value in a {@link Task} object.
 * @param parentElement
 * @param task
 * @param dateFieldToEdit
 * @param taskSaver
 */
export function promptForDate(
    parentElement: HTMLElement,
    task: Task,
    dateFieldToEdit: AllTaskDateFields,
    taskSaver: TaskSaver,
) {
    closeDatePicker?.();
    const doc = parentElement.ownerDocument;
    // Keep the input outside rendered Markdown and Live Preview editor content.
    const popover = doc.body.createDiv({ cls: 'tasks-date-picker-popover' });
    const input = popover.createEl('input', { attr: { 'aria-label': splitDateText(dateFieldToEdit) } });
    const picker = datePicker(input);
    input.value = task[dateFieldToEdit]?.format('YYYY-MM-DD') ?? '';

    const rect = parentElement.getBoundingClientRect();
    const view = doc.defaultView ?? window;
    popover.style.left = `${Math.max(0, Math.min(rect.left, view.innerWidth - popover.offsetWidth))}px`;
    popover.style.top = `${
        rect.bottom + popover.offsetHeight > view.innerHeight
            ? Math.max(0, rect.top - popover.offsetHeight)
            : rect.bottom
    }px`;

    const close = () => {
        picker.destroy();
        popover.remove();
        doc.removeEventListener('pointerdown', onPointerDown, true);
        doc.removeEventListener('keydown', onKeyDown, true);
        closeDatePicker = undefined;
    };
    const onPointerDown = (event: PointerEvent) => {
        if (!popover.contains(event.target as Node)) {
            close();
        }
    };
    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            close();
        }
    };
    closeDatePicker = close;
    doc.addEventListener('pointerdown', onPointerDown, true);
    doc.addEventListener('keydown', onKeyDown, true);

    input.addEventListener('change', async () => {
        const newTask = input.value
            ? new SetTaskDate(dateFieldToEdit, window.moment(input.value, 'YYYY-MM-DD').toDate()).apply(task)
            : new RemoveTaskDate(dateFieldToEdit, task).apply(task);
        close();
        await taskSaver(task, newTask);
    });

    input.focus();
    input.click();
}
