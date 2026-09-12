import flatpickr from 'flatpickr';
import type { Task } from '../../Task/Task';
import { RemoveReminderTime, SetReminderTime } from '../EditInstructions/ReminderInstructions';
import type { TaskSaver } from './TaskEditingMenu';

/**
 * A time-only picker for editing a task's {@link Task.reminderTime}.
 *
 * This is the click (as opposed to right-click) counterpart to {@link ReminderMenu}, in the same
 * way {@link promptForDate} is the click counterpart to {@link DateMenu} - but configured with
 * flatpickr's `noCalendar`/`enableTime` options, since a reminder is a time, not a date.
 */
export function promptForReminderTime(parentElement: HTMLElement, task: Task, taskSaver: TaskSaver) {
    const currentValue = task.reminderTime;
    const fp = flatpickr(parentElement, {
        defaultDate: currentValue ?? new Date(),
        disableMobile: true,
        noCalendar: true,
        enableTime: true,
        time_24hr: true,
        dateFormat: 'H:i',
        onClose: async (selectedDates, _dateStr, instance) => {
            if (selectedDates.length > 0) {
                const time = window.moment(selectedDates[0]).format('HH:mm');
                const newTask = new SetReminderTime(time).apply(task);
                await taskSaver(task, newTask);
            }
            instance.destroy();
        },
        onReady: (_selectedDates, _dateStr, instance) => {
            const buttonContainer = instance.calendarContainer.createDiv({ cls: 'tasks-date-picker-buttons' });

            const clearButton = buttonContainer.createEl('button', { cls: 'flatpickr-button', text: 'Clear' });
            clearButton.addEventListener('click', async () => {
                const newTask = new RemoveReminderTime().apply(task);
                await taskSaver(task, newTask);
                instance.destroy();
            });
        },
    });

    fp.open();
}
