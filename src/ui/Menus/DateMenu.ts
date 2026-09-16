import type { Task } from '../../Task/Task';
import { type AllTaskDateFields, isAHappensDate } from '../../DateTime/DateFieldTypes';
import { allHappensDateInstructions, allLifeCycleDateInstructions } from '../EditInstructions/DateInstructions';
import { SchedulePopover } from './SchedulePopover';
import { TaskEditingMenu, type TaskSaver, defaultTaskSaver } from './TaskEditingMenu';

export class DateMenu extends TaskEditingMenu {
    /**
     * Constructor, which sets up the menu items.
     * @param field - the Date field to edit
     * @param task - the Task to be edited.
     * @param taskSaver - an optional {@link TaskSaver} function. For details, see {@link TaskEditingMenu}.
     */
    constructor(field: AllTaskDateFields, task: Task, taskSaver: TaskSaver = defaultTaskSaver) {
        super(taskSaver);

        // Only for the Scheduled date field. Once a reminder already exists, greyed out and inert (see
        // DatePicker.ts's matching button) rather than removed outright.
        if (field === 'scheduledDate') {
            const alreadyHasReminder = task.reminderTime !== null;
            this.addItem((item) => {
                item.setTitle('Add a reminder…').setDisabled(alreadyHasReminder);
                if (!alreadyHasReminder) {
                    // No single persistent element to anchor to for a menu item (unlike the pill itself) -
                    // position at the click that fired this item, the same point-anchor SchedulePopover
                    // supports for exactly this case. A keyboard-activated item has no meaningful click
                    // point, so fall back to the menu item's own element.
                    item.onClick((evt: MouseEvent | KeyboardEvent) => {
                        const anchor =
                            evt instanceof MouseEvent
                                ? { x: evt.clientX, y: evt.clientY }
                                : (evt.target as HTMLElement);
                        new SchedulePopover(anchor, task, taskSaver);
                    });
                }
            });
        }

        const instructions = isAHappensDate(field)
            ? allHappensDateInstructions(field, task)
            : allLifeCycleDateInstructions(field, task);
        this.addItemsForInstructions(instructions, task);
    }
}
