import type { App } from 'obsidian';
import type { Task } from '../../Task/Task';
import { getSettings } from '../../Config/Settings';
import { type ReminderSuggestion, buildReminderSuggestions } from '../../DateTime/ReminderSuggestions';
import { MenuDividerInstruction } from '../EditInstructions/MenuDividerInstruction';
import { RemoveReminderTime, SetReminderDateTime, SetReminderTime } from '../EditInstructions/ReminderInstructions';
import type { TaskEditingInstruction } from '../EditInstructions/TaskEditingInstruction';
import { ReminderPromptModal } from './ReminderPromptModal';
import { TaskEditingMenu, type TaskSaver, defaultTaskSaver } from './TaskEditingMenu';

/**
 * The right-click (and click - see {@link TaskLineRenderer}) menu for a task's reminder time.
 *
 * Built from {@link buildReminderSuggestions} - the same options {@link ReminderEditor} offers as
 * autocomplete in the edit modal - so the list of quick options is user-configurable (via
 * `reminderPresetTimes`/`reminderRelativeOffsetsMinutes`/`reminderRoundingIncrementMinutes`, see
 * {@link Settings}) rather than a fixed set that may not suit everyone.
 */
export class ReminderMenu extends TaskEditingMenu {
    constructor(app: App, task: Task, taskSaver: TaskSaver = defaultTaskSaver) {
        super(taskSaver);

        const { reminderPresetTimes, reminderRelativeOffsetsMinutes, reminderRoundingIncrementMinutes } = getSettings();
        const now = window.moment();
        const { presetTimes, relativeOffsets } = buildReminderSuggestions(
            reminderPresetTimes,
            reminderRelativeOffsetsMinutes,
            reminderRoundingIncrementMinutes,
            now,
        );

        const toInstruction = (suggestion: ReminderSuggestion): TaskEditingInstruction => {
            if (suggestion.resolvedDate) {
                // Apply the already-rounded date directly - re-parsing suggestion.value ('in 30 minutes')
                // here instead would resolve the exact, unrounded offset from 'now', silently ignoring the
                // rounding the label promised.
                // suggestion.label ('In 30 minutes (11:00)') already reads fine as a menu action.
                return new SetReminderDateTime(suggestion.resolvedDate, suggestion.label);
            }
            // For a plain preset, use SetReminderTime's own default title ('Set reminder: 09:00') rather
            // than suggestion.label (just '09:00') - that bare form is for the modal's autocomplete list,
            // where the field it's filling already makes "set reminder" implicit.
            return new SetReminderTime(suggestion.value);
        };

        this.addItemsForInstructions(
            [...presetTimes.map(toInstruction), new MenuDividerInstruction(), ...relativeOffsets.map(toInstruction)],
            task,
        );

        this.addSeparator();
        this.addItem((item) =>
            item.setTitle('Custom time…').onClick(() => new ReminderPromptModal(app, task, taskSaver).open()),
        );

        this.addItemsForInstructions([new RemoveReminderTime()], task);
    }
}
