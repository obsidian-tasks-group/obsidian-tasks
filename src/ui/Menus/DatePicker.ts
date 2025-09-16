import flatpickr from 'flatpickr';
import type { Task } from '../../Task/Task';
import { RemoveTaskDate, SetTaskDate } from '../EditInstructions/DateInstructions';
import type { AllTaskDateFields } from '../../DateTime/DateFieldTypes';
import type { TaskSaver } from './TaskEditingMenu';

/**
 * Determines the first day of the week based on moment's current locale.
 * Returns 0 for Sunday, 1 for Monday, etc.
 * Falls back to Monday (1) if moment locale information is unavailable.
 */
function getFirstDayOfWeekFromMoment(): number {
    try {
        // Get the current moment locale
        const currentLocale = window.moment.locale();
        
        // Get locale data for the current locale
        const localeData = window.moment.localeData(currentLocale);
        
        // Get the first day of the week (0 = Sunday, 1 = Monday, etc.)
        const firstDay = localeData.firstDayOfWeek();
        
        return firstDay;
    } catch (error) {
        // Fallback to Monday if there's any error accessing locale data
        console.warn('Could not determine first day of week from moment locale, defaulting to Monday:', error);
        return 1;
    }
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
            // Use moment's locale to determine the first day of the week
            // This respects the user's locale settings in Obsidian
            firstDayOfWeek: getFirstDayOfWeekFromMoment(),
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
            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.justifyContent = 'space-between';
            buttonContainer.style.marginTop = '10px';

            // Create "Clear" button
            addButton(buttonContainer, instance, task, taskSaver, 'Clear', () => {
                return new RemoveTaskDate(dateFieldToEdit, task).apply(task);
            });

            // Create "Today" button
            addButton(buttonContainer, instance, task, taskSaver, 'Today', () => {
                const today = new Date();
                return new SetTaskDate(dateFieldToEdit, today).apply(task);
            });

            // Append the button container to the Flatpickr calendar container
            const calendarContainer = instance.calendarContainer;
            calendarContainer.appendChild(buttonContainer);
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
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = buttonName;
    button.classList.add('flatpickr-button');

    button.addEventListener('click', async () => {
        const newTask = applyDate();
        await taskSaver(task, newTask);
        instance.destroy();
    });
    buttonContainer.appendChild(button);
}
