import type { Task } from '../../Task/Task';
import { MenuDividerInstruction } from '../EditInstructions/MenuDividerInstruction';
import { RemoveReminderTime, SetReminderTime } from '../EditInstructions/ReminderInstructions';
import { TaskEditingMenu, type TaskSaver, defaultTaskSaver } from './TaskEditingMenu';

/** A handful of common times, offered as one-click presets in the right-click reminder menu. */
const presetReminderTimes = ['09:00', '12:00', '15:00', '18:00'];

/**
 * The right-click menu for a task's reminder time: a few preset times plus "Remove reminder".
 *
 * Unlike {@link DateMenu}/{@link PostponeMenu}, this has no relative date math to offer (a
 * reminder is a time, not a date - see {@link Task.reminderDateTime}), so it's just a fixed list.
 */
export class ReminderMenu extends TaskEditingMenu {
    constructor(task: Task, taskSaver: TaskSaver = defaultTaskSaver) {
        super(taskSaver);

        const instructions = [
            ...presetReminderTimes.map((time) => new SetReminderTime(time)),
            new MenuDividerInstruction(),
            new RemoveReminderTime(),
        ];
        this.addItemsForInstructions(instructions, task);
    }
}
