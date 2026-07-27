import type { TaskGroups } from '../Query/Group/TaskGroups';
import type { Task } from '../Task/Task';
import type { TaskEditingInstruction } from '../ui/EditInstructions/TaskEditingInstruction';
import type { TaskGroup } from '../Query/Group/TaskGroup';
import { createEditingInstructionForGroup } from '../ui/EditInstructions/CreateEditingInstructionForGroup';
import { DragState } from './DragState';
import { HtmlQueryResultsRenderer } from './HtmlQueryResultsRenderer';
import { createAndAppendElement } from './TaskLineRenderer';

export class HtmlColumnQueryResultsRenderer extends HtmlQueryResultsRenderer {
    private readonly dragState = new DragState();

    protected async addAllTaskGroups(tasksSortedLimitedGrouped: TaskGroups) {
        const originalParent = this.content;

        const columnsContainer = createAndAppendElement('div', originalParent);
        columnsContainer.classList.add('tasks-columns');

        for (const [_index, group] of tasksSortedLimitedGrouped.groups.map((v, i) => [i, v] as const)) {
            if (group.tasks.length === 0) {
                continue;
            }

            if (group.groupHeadings[0].nestingLevel === 0) {
                const columnContainer = createAndAppendElement('div', columnsContainer);
                columnContainer.classList.add('tasks-columns-column');

                columnContainer.addEventListener('dragover', (e) => {
                    // An element rejects drops by default. Calling preventDefault() on
                    // dragover is what marks this column as a valid drop target - without
                    // it, the 'drop' event below never fires.
                    e.preventDefault();
                });

                const instruction = this.editingInstructionForColumn(group);
                columnContainer.addEventListener('drop', async (e) => {
                    // Fires when a card is released over this column. preventDefault()
                    // stops the browser's default handling; here we read the Task object
                    // that the dragged card recorded in DragState during dragstart.
                    e.preventDefault();
                    if (instruction) {
                        await this.dragState.dragged(instruction);
                    }
                });

                this.content = columnContainer;
            }

            // If there were no 'group by' instructions, no headings will be added.
            await this.addGroupHeadings(group);

            this.addedListItems.clear();
            await this.addTaskList(group.tasks);
        }

        this.content = originalParent;
    }

    protected extendTaskBehaviour(listItem: HTMLLIElement, task: Task) {
        if (this.nestingLevel === 0) {
            listItem.classList.add('tasks-columns-column-card');
            // TODO Only enable drag and drop when this column has an editing instruction associated with it.
            // TODO Provide visual indication of which columns the card can be dropped into.
            // TODO Prevent giving the appearance that the whole column can moved,
            //      if some characters in the heading and first task are selected.
            listItem.draggable = true;

            listItem.addEventListener('dragstart', (e) => {
                // Fires when the user starts dragging this card (only possible because
                // of draggable = true above). We record the whole Task object in
                // DragState so the column's 'drop' handler can read it back. Do NOT
                // preventDefault here - that would cancel the drag before it starts.
                console.log('drag start', task);
                this.dragState.start(task);
                if (e.dataTransfer) {
                    e.dataTransfer.effectAllowed = 'move';
                }
            });

            listItem.addEventListener('dragend', () => {
                // 'dragend' is fired every time the dragged object's drag has ended
                // regardless of drag's target, so we clear the state here to be sure that
                // we never end up in a stale state.
                // 'drop' only fires when the card lands on a valid target.
                // A cancelled drag (Escape, or a release over empty space) fires no 'drop',
                // which would leave a stale task for the next drag to read.
                this.dragState.clear();
            });
        }
    }

    private editingInstructionForColumn(group: TaskGroup): TaskEditingInstruction | null {
        const firstTask = group.tasks[0];
        if (!firstTask) {
            return null;
        }

        const groupedBy = this.query.viewLayoutOptions.grouper?.property;

        return createEditingInstructionForGroup(groupedBy, firstTask);
    }
}
