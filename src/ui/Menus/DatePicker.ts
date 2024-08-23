import flatpickr from 'flatpickr';
import type { Task } from '../../Task/Task';
import { SetTaskDate } from '../EditInstructions/DateInstructions';
import type { AllTaskDateFields } from '../../DateTime/DateFieldTypes';

// TODO Extract this out of the function below, instead of duplicating the code
export function selectDate(parentElement: HTMLElement, defaultDate?: Date): Promise<Date | null> {
    return new Promise((resolve) => {
        if (!parentElement) {
            console.log('Parent element not found.');
            resolve(null);
            return;
        }

        const input = document.createElement('input');
        input.type = 'text';
        parentElement.appendChild(input);

        // Ensure the input element is properly styled for Flatpickr
        input.style.position = 'absolute';
        input.style.opacity = '0';
        input.style.pointerEvents = 'none';
        input.style.width = '1px';
        input.style.height = '1px';

        // Delay the initialization of Flatpickr to ensure DOM is ready
        setTimeout(() => {
            const fp = flatpickr(input, {
                defaultDate: defaultDate || new Date(),
                enableTime: false, // Optional: Enable time picker
                dateFormat: 'Y-m-d', // Adjust the date format as needed
                locale: {
                    firstDayOfWeek: 1, // Sets Monday as the first day of the week
                },
                onClose: (selectedDates, _dateStr, instance) => {
                    if (selectedDates.length > 0) {
                        resolve(selectedDates[0]);
                    } else {
                        resolve(null);
                    }
                    instance.destroy(); // Proper cleanup
                    input.remove(); // Remove the elements after selection
                },
            });

            // Open the calendar programmatically
            fp.open();
        }, 0);
    });
}

export function promptForDate(
    parentElement: HTMLElement,
    task: Task,
    dateFieldToEdit: AllTaskDateFields,
    taskSaver: (originalTask: Task, newTasks: Task | Task[]) => Promise<void>,
) {
    if (!parentElement) {
        console.log('Parent element not found.');
        return;
    }

    const input = document.createElement('input');
    input.type = 'text'; // Flatpickr can hook into a text input
    parentElement.appendChild(input);

    // Ensure styles are applied so Flatpickr can render correctly
    input.style.minWidth = '200px'; // Ensure there's enough room for Flatpickr

    // Delay the initialization of Flatpickr to ensure DOM is ready
    setTimeout(() => {
        const currentValue = task[dateFieldToEdit];
        // TODO figure out how Today's date is determined: if Obsidian is left
        //      running overnight, the flatpickr modal shows the previous day as Today.
        const fp = flatpickr(input, {
            defaultDate: currentValue ? currentValue.format('YYYY-MM-DD') : new Date(),
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
                input.remove(); // Remove the elements after selection
            },
        });

        // Open the calendar programmatically
        fp.open();
    }, 0);
}
