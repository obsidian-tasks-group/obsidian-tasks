import type { App } from 'obsidian';
import type { Task } from '../../Task/Task';
import { getSettings } from '../../Config/Settings';
import { roundUpToIncrement } from '../../DateTime/ReminderTimeParser';
import { MenuDividerInstruction } from '../EditInstructions/MenuDividerInstruction';
import { RemoveReminderTime, SetReminderDateTime, SetReminderTime } from '../EditInstructions/ReminderInstructions';
import type { TaskEditingInstruction } from '../EditInstructions/TaskEditingInstruction';
import { ReminderPromptModal } from './ReminderPromptModal';
import { TaskEditingMenu, type TaskSaver, defaultTaskSaver } from './TaskEditingMenu';

/**
 * The right-click (and click - see {@link TaskLineRenderer}) menu for a task's reminder time.
 *
 * Built from three settings (`reminderPresetTimes`, `reminderRelativeOffsetsMinutes`,
 * `reminderRoundingIncrementMinutes` - see {@link Settings}), so the list of quick options is
 * user-configurable rather than a fixed set of times that may not suit everyone. The relative items are
 * computed fresh each time the menu opens, rounded to the configured increment so a quick pick lands on a
 * clean time rather than an exact-to-the-minute one (free-text entry - the modal field, or "Custom time…"
 * below - is never rounded, since a typed value is already a deliberate choice).
 */
export class ReminderMenu extends TaskEditingMenu {
    constructor(app: App, task: Task, taskSaver: TaskSaver = defaultTaskSaver) {
        super(taskSaver);

        const { reminderPresetTimes, reminderRelativeOffsetsMinutes, reminderRoundingIncrementMinutes } = getSettings();

        const presetInstructions: TaskEditingInstruction[] = reminderPresetTimes.map(
            (time) => new SetReminderTime(time),
        );

        const now = window.moment();
        const relativeInstructions: TaskEditingInstruction[] = reminderRelativeOffsetsMinutes.map((offsetMinutes) => {
            const target = roundUpToIncrement(
                now.clone().add(offsetMinutes, 'minutes'),
                reminderRoundingIncrementMinutes,
            );
            return new SetReminderDateTime(target, `${describeOffset(offsetMinutes)} (${target.format('HH:mm')})`);
        });

        this.addItemsForInstructions(
            [...presetInstructions, new MenuDividerInstruction(), ...relativeInstructions],
            task,
        );

        this.addSeparator();
        this.addItem((item) =>
            item.setTitle('Custom time…').onClick(() => new ReminderPromptModal(app, task, taskSaver).open()),
        );

        this.addItemsForInstructions([new RemoveReminderTime()], task);
    }
}

function describeOffset(offsetMinutes: number): string {
    if (offsetMinutes % 60 === 0) {
        const hours = offsetMinutes / 60;
        return `In ${hours} hour${hours === 1 ? '' : 's'}`;
    }
    return `In ${offsetMinutes} minutes`;
}
