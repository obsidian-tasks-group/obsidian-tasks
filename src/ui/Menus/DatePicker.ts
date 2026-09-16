import flatpickr from 'flatpickr';
import type { Task } from '../../Task/Task';
import { RemoveTaskDate, SetTaskDate } from '../EditInstructions/DateInstructions';
import type { AllTaskDateFields } from '../../DateTime/DateFieldTypes';
import { SchedulePopover } from './SchedulePopover';
import type { TaskSaver } from './TaskEditingMenu';

interface LocaleWithWeekInfo extends Intl.Locale {
    weekInfo?: { firstDay: number };
}

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
    const currentValue = task[dateFieldToEdit];
    // TODO figure out how Today's date is determined: if Obsidian is left
    //      running overnight, the flatpickr modal shows the previous day as Today.
    const fp = flatpickr(parentElement, {
        defaultDate: currentValue ? currentValue.format('YYYY-MM-DD') : new Date(),
        disableMobile: true,
        enableTime: false, // Optional: Enable time picker
        dateFormat: 'Y-m-d', // Adjust the date and time format as needed
        locale: {
            // Try to determine the first day of the week based on the locale, or use Monday
            // if unavailable
            firstDayOfWeek: (new Intl.Locale(navigator.language) as LocaleWithWeekInfo).weekInfo?.firstDay ?? 1,
        },
        onClose: async (selectedDates, _dateStr, instance) => {
            if (selectedDates.length > 0) {
                const date = selectedDates[0];
                const newTask = new SetTaskDate(dateFieldToEdit, date).apply(task);
                await taskSaver(task, newTask);
            }
            instance.destroy();
        },
        onReady: (_selectedDates, _dateStr, instance) => {
            // Add custom buttons dynamically
            const buttonContainer = instance.calendarContainer.createDiv({ cls: 'tasks-date-picker-buttons' });

            // Create "Clear" button
            addButton(buttonContainer, instance, task, taskSaver, 'Clear', () => {
                return new RemoveTaskDate(dateFieldToEdit, task).apply(task);
            });

            // Create "Today" button
            addButton(buttonContainer, instance, task, taskSaver, 'Today', () => {
                const today = new Date();
                return new SetTaskDate(dateFieldToEdit, today).apply(task);
            });

            // "Add a reminder…" - only for the Scheduled date field. Once a reminder already exists, the
            // Reminder Time pill itself becomes the dedicated edit affordance, so this is greyed out and
            // inert rather than removed outright - still visible for discoverability, just not a second
            // "add" path that could read as creating a second reminder. Can't reuse addButton()'s
            // applyDate()-returns-Task[]-synchronously shape below, since opening a popover is inherently
            // async/user-driven rather than an immediate apply-and-save.
            if (dateFieldToEdit === 'scheduledDate') {
                const alreadyHasReminder = task.reminderTime !== null;
                const button = buttonContainer.createEl('button', { cls: 'flatpickr-button', text: 'Add a reminder…' });
                button.disabled = alreadyHasReminder;
                if (!alreadyHasReminder) {
                    button.addEventListener('click', () => {
                        // Anchor to parentElement (the date pill itself), not the button - it's about to be
                        // removed from the DOM by instance.destroy(), but the pill it's attached to isn't.
                        instance.destroy();
                        new SchedulePopover(parentElement, task, taskSaver);
                    });
                }
            }
        },
    });

    // Open the calendar programmatically
    fp.open();
}

function addButton(
    buttonContainer: HTMLDivElement,
    instance: flatpickr.Instance,
    task: Task,
    taskSaver: TaskSaver,
    buttonName: string,
    applyDate: () => Task[],
) {
    const button = buttonContainer.createEl('button', { cls: 'flatpickr-button', text: buttonName });

    button.addEventListener('click', async () => {
        const newTask = applyDate();
        await taskSaver(task, newTask);
        instance.destroy();
    });
}
