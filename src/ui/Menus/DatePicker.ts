import type { Task } from 'Task/Task';
import { TaskRegularExpressions } from 'Task/TaskRegularExpressions';
import { RemoveTaskDate, SetTaskDate } from 'ui/EditInstructions/DateInstructions';
import type { AllTaskDateFields } from 'DateTime/DateFieldTypes';
import { splitDateText } from 'DateTime/Postponer';
import type { TaskSaver } from 'ui/Menus/TaskEditingMenu';
import { logging } from 'lib/logging';

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
    showNativeDatePicker(
        parentElement,
        task[dateFieldToEdit]?.format(TaskRegularExpressions.dateFormat) ?? '',
        splitDateText(dateFieldToEdit),
        async (value) => {
            const newTask = value
                ? new SetTaskDate(
                      dateFieldToEdit,
                      window.moment(value, TaskRegularExpressions.dateFormat).toDate(),
                  ).apply(task)
                : new RemoveTaskDate(dateFieldToEdit, task).apply(task);
            await taskSaver(task, newTask);
        },
    );
}

function showNativeDatePicker(
    parentElement: HTMLElement,
    initialDate: string,
    label: string,
    onChange: (value: string) => Promise<void>,
) {
    closeDatePicker?.();
    const doc = parentElement.ownerDocument;
    // Keep the input outside rendered Markdown and Live Preview editor content.
    const input = doc.body.createEl('input', {
        type: 'date',
        cls: 'tasks-date-picker-popover',
        attr: { 'aria-label': label, tabindex: '-1' },
    });
    input.value = initialDate;

    const rect = parentElement.getBoundingClientRect();
    const view = doc.defaultView ?? window;
    const gap = 4;
    input.style.height = `${rect.height + 2 * gap}px`;
    input.style.left = `${Math.max(0, Math.min(rect.left, view.innerWidth - input.offsetWidth))}px`;
    input.style.top = `${rect.top - gap}px`;

    const close = () => {
        input.remove();
        doc.removeEventListener('pointerdown', onPointerDown, true);
        doc.removeEventListener('keydown', onKeyDown, true);
        closeDatePicker = undefined;
    };
    const onPointerDown = (event: PointerEvent) => {
        if (!input.contains(event.target as Node)) {
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
        const value = input.value;
        close();
        await onChange(value);
    });

    if (typeof input.showPicker === 'function') {
        try {
            // Chromium snapshots the anchor position without updating layout.
            input.getBoundingClientRect();
            input.showPicker();
            return;
        } catch (error) {
            logging.getLogger('tasks.DatePicker').warn('Could not open the native date picker.', error);
        }
    }
    // Keep date editing available on platforms without showPicker() support.
    input.classList.add('tasks-date-picker-fallback');
    input.style.removeProperty('height');
    input.style.top = `${
        rect.bottom + input.offsetHeight > view.innerHeight ? Math.max(0, rect.top - input.offsetHeight) : rect.bottom
    }px`;
    input.tabIndex = 0;
    input.focus();
    input.click();
}
