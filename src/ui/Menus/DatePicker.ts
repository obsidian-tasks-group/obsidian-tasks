import flatpickr from 'flatpickr';
import type { Task } from '../../Task/Task';
import { RemoveTaskDate, SetTaskDate } from '../EditInstructions/DateInstructions';
import type { AllTaskDateFields } from '../../DateTime/DateFieldTypes';

/**
 * A calendar date picker which edits a date value in a {@link Task} object.
 * See also {@link openDatePicker}
 * @param parentElement
 * @param task
 * @param dateFieldToEdit
 * @param taskSaver
 *
 * See also {@link openDatePicker}
 */
export function promptForDate(
    parentElement: HTMLElement,
    task: Task,
    dateFieldToEdit: AllTaskDateFields,
    taskSaver: (originalTask: Task, newTasks: Task | Task[]) => Promise<void>,
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
            firstDayOfWeek: 1, // Sets Monday as the first day of the week
        },
        onClose: async (selectedDates, _dateStr, instance) => {
            if (selectedDates.length > 0) {
                const date = selectedDates[0];
                const newTask = new SetTaskDate(dateFieldToEdit, date).apply(task);
                await taskSaver(task, newTask);
            }
            instance.destroy(); // Proper cleanup
        },
        onReady: (_selectedDates, _dateStr, instance) => {
            // Add a "Clear" button dynamically
            const clearButton = document.createElement('button');
            clearButton.type = 'button';
            clearButton.textContent = 'Clear';
            clearButton.classList.add('flatpickr-clear-button'); // Add a custom class for styling
            clearButton.style.margin = '10px'; // Optional styling

            // Append the button to the Flatpickr calendar container
            const calendarContainer = instance.calendarContainer;
            calendarContainer.appendChild(clearButton);

            // Add click event to clear the date
            clearButton.addEventListener('click', async () => {
                const newTask = new RemoveTaskDate(dateFieldToEdit, task).apply(task); // Clear the date
                await taskSaver(task, newTask);
                instance.clear(); // Clear the Flatpickr selection
            });
        },
    });

    // Open the calendar programmatically
    fp.open();
}
