import { EditorView, ViewPlugin } from '@codemirror/view';
import type { PluginValue } from '@codemirror/view';
import { Notice } from 'obsidian';
import { TasksFile } from '../Scripting/TasksFile';

import { Task } from '../Task/Task';
import { TaskLocation } from '../Task/TaskLocation';

export const newLivePreviewExtension = () => {
    return ViewPlugin.fromClass(LivePreviewExtension);
};

/**
 * Integrate custom handling of checkbox clicks in the Obsidian editor's Live Preview mode.
 *
 * This class is primarily designed for checkbox-driven task management in the Obsidian plugin, overriding the default handling behavior.
 * It listens for click events, detects checkbox interactions, and updates the document state accordingly.
 *
 * Bug reports associated with this code: (label:"display: live preview")
 * https://github.com/obsidian-tasks-group/obsidian-tasks/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22display%3A%20live%20preview%22%20label%3A%22type%3A%20bug%22
 *
 * See also {@link InlineRenderer} which handles Markdown task lines in Obsidian's Reading mode.
 */
class LivePreviewExtension implements PluginValue {
    private readonly view: EditorView;

    constructor(view: EditorView) {
        this.view = view;

        this.handleClickEvent = this.handleClickEvent.bind(this);
        this.view.dom.addEventListener('click', this.handleClickEvent);
    }

    public destroy(): void {
        this.view.dom.removeEventListener('click', this.handleClickEvent);
    }

    private handleClickEvent(event: MouseEvent): boolean {
        const { target } = event;

        // Only handle checkbox clicks.
        if (!target || !(target instanceof HTMLInputElement) || target.type !== 'checkbox') {
            return false;
        }

        /* Right now Obsidian API does not give us a way to handle checkbox clicks inside rendered-widgets-in-LP such as
         * callouts, tables, and transclusions because `this.view.posAtDOM` will return the beginning of the widget
         * as the position for any click inside the widget.
         * For callouts, this means that the task will never be found, since the `lineAt` will be the beginning of the callout.
         * Therefore, produce an error message pop-up using Obsidian's "Notice" feature, log a console warning, then return.
         */

        // Tasks from "task" query codeblocks handle themselves thanks to `toLi`, so be specific about error messaging, but still return.
        const ancestor = target.closest('ul.plugin-tasks-query-result, div.callout-content');
        if (ancestor) {
            if (ancestor.matches('div.callout-content')) {
                // Error message for now.
                const msg =
                    'obsidian-tasks-plugin warning: Tasks cannot add or remove completion dates or make the next copy of a recurring task for tasks written inside a callout when you click their checkboxes in Live Preview. \n' +
                    'If you wanted Tasks to do these things, please undo your change, then either click the line of the task and use the "Toggle Task Done" command, or switch to Reading View to click the checkbox.';
                console.warn(msg);
                new Notice(msg, 45000);
            }
            return false;
        }

        const { state } = this.view;
        const position = this.view.posAtDOM(target);
        const line = state.doc.lineAt(position);
        const task = Task.fromLine({
            line: line.text,
            // None of this data is relevant here.
            // The task is created, toggled, and written back to the CM6 document,
            // replacing the old task in-place.
            taskLocation: TaskLocation.fromUnknownPosition(new TasksFile('')),
            fallbackDate: null,
        });

        // Temporary edit - See https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2160
        // console.debug(`Live Preview Extension: toggle called. Position: ${position} Line: ${line.text}`);

        // Only handle checkboxes of tasks.
        if (task === null) {
            return false;
        }

        // We need to prevent default so that the checkbox is only handled by us and not obsidian.
        event.preventDefault();

        // Clicked on a task's checkbox. Toggle the task and set it.
        const toggled = task.toggleWithRecurrenceInUsersOrder();
        const toggledString = toggled.map((t) => t.toFileLineString()).join(state.lineBreak);

        let to = line.to;

        if (toggledString === '') {
            // We also need to remove any line break at the end of the line.
            const nextLine = line.number < state.doc.lines ? state.doc.line(line.number + 1) : null;
            if (nextLine) {
                // If not the last line, delete up to the start of the next line, including the line break
                to = nextLine.from;
            }
        }

        // Creates a CodeMirror transaction in order to update the document.
        const transaction = state.update({
            changes: {
                from: line.from,
                to,
                insert: toggledString,
            },
        });
        this.view.dispatch(transaction);

        // Dirty workaround.
        // While the code in this method properly updates the `checked` state
        // of the target checkbox, some Obsidian internals revert the state.
        // This means that the checkbox would remain in its original `checked`
        // state (`true` or `false`), even though the underlying document
        // updates correctly.
        // As a "fix", we set the checkbox's `checked` state *explicitly* after a
        // timeout in case we need to revert Obsidian's possibly wrongful reversal.
        const needToForceCheckedProperty = toggled.length === 1;
        if (needToForceCheckedProperty) {
            // The smoke tests show the workaround is only needed when the event replaces
            // a single task line.
            // (When one task line becomes two because of recurrence, both the
            // edited task lines are rendered correctly by this code)
            // Since the advent of 'on completion: delete', we cannot rely on the
            // event target's opinion of the new status, as that facility means
            // that the new status *may* be different from that in the event.
            const desiredCheckedStatus = toggled[0].status.symbol !== ' ';
            setTimeout(() => {
                target.checked = desiredCheckedStatus;
            }, 1);
        }

        return true;
    }
}
