import type { TaskGroups } from '../Query/Group/TaskGroups';
import type { Task } from '../Task/Task';
import { HtmlQueryResultsRenderer } from './HtmlQueryResultsRenderer';
import { createAndAppendElement } from './TaskLineRenderer';

export class HtmlColumnQueryResultsRenderer extends HtmlQueryResultsRenderer {
    private draggedTask?: Task;

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

                columnContainer.addEventListener('drop', (e) => {
                    // Fires when a card is released over this column. preventDefault()
                    // stops the browser's default handling; here we read the Task object
                    // that the dragged card stashed on the instance during dragstart.
                    e.preventDefault();
                    console.log({ droppedTask: this.draggedTask });
                });

                this.content = columnContainer;
            }

            // If there were no 'group by' instructions, group.groupHeadings
            // will be empty, and no headings will be added.
            await this.addGroupHeadings(group.groupHeadings);

            this.addedListItems.clear();
            await this.addTaskList(group.tasks);
        }

        this.content = originalParent;
    }

    protected extendTaskBehaviour(listItem: HTMLLIElement, task: Task) {
        if (this.nestingLevel === 0) {
            listItem.classList.add('tasks-columns-column-card');
            listItem.draggable = true;

            listItem.addEventListener('dragstart', (e) => {
                // Fires when the user starts dragging this card (only possible because
                // of draggable = true above). We stash the whole Task object on the
                // instance so the column's 'drop' handler can read it back. Do NOT
                // preventDefault here - that would cancel the drag before it starts.
                console.log('drag start', task);
                this.draggedTask = task;
                if (e.dataTransfer) {
                    e.dataTransfer.effectAllowed = 'move';
                }
            });
        }
    }
}
