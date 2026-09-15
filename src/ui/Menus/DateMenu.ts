import type { App } from 'obsidian';
import type { Task } from '../../Task/Task';
import { type AllTaskDateFields, isAHappensDate } from '../../DateTime/DateFieldTypes';
import { allHappensDateInstructions, allLifeCycleDateInstructions } from '../EditInstructions/DateInstructions';
import { ScheduleDialog } from './ScheduleDialog';
import { TaskEditingMenu, type TaskSaver, defaultTaskSaver } from './TaskEditingMenu';

export class DateMenu extends TaskEditingMenu {
    /**
     * Constructor, which sets up the menu items.
     * @param app - needed to open {@link ScheduleDialog} from the "Add a reminder…" item (see below).
     * @param field - the Date field to edit
     * @param task - the Task to be edited.
     * @param taskSaver - an optional {@link TaskSaver} function. For details, see {@link TaskEditingMenu}.
     */
    constructor(app: App, field: AllTaskDateFields, task: Task, taskSaver: TaskSaver = defaultTaskSaver) {
        super(taskSaver);

        // Only for the Scheduled date field. Once a reminder already exists, greyed out and inert (see
        // DatePicker.ts's matching button) rather than removed outright.
        if (field === 'scheduledDate') {
            const alreadyHasReminder = task.reminderTime !== null;
            this.addItem((item) => {
                item.setTitle('Add a reminder…').setDisabled(alreadyHasReminder);
                if (!alreadyHasReminder) {
                    item.onClick(() => new ScheduleDialog(app, task, taskSaver).open());
                }
            });
        }

        const instructions = isAHappensDate(field)
            ? allHappensDateInstructions(field, task)
            : allLifeCycleDateInstructions(field, task);
        this.addItemsForInstructions(instructions, task);
    }
}
