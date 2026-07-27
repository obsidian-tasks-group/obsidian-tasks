import type { Task } from '../Task/Task';
import type { TaskEditingInstruction } from '../ui/EditInstructions/TaskEditingInstruction';
import { defaultTaskSaver } from '../ui/Menus/TaskEditingMenu';

/**
 * Tracks which {@link Task} is currently being dragged during a drag-and-drop operation.
 *
 * The HTML drag-and-drop `dataTransfer` channel can only carry strings, so it cannot
 * hand a live {@link Task} object from the dragged card to the column that receives the
 * drop. This class holds that object instead: the card records it on 'dragstart', the
 * column reads it on 'drop', and it is forgotten on 'dragend'.
 */
export class DragState {
    private draggedTask?: Task;

    /** Record the task that has started being dragged. Call from the card's 'dragstart'. */
    public start(task: Task): void {
        this.draggedTask = task;
    }

    /** The task currently being dragged, or `undefined` if no drag is in progress. */
    public async dragged(instruction: TaskEditingInstruction): Promise<Task | undefined> {
        await defaultTaskSaver(this.draggedTask!, instruction.apply(this.draggedTask!));
        return this.draggedTask;
    }

    /** Forget the dragged task once the drag finishes. Call from the card's 'dragend'. */
    public clear(): void {
        this.draggedTask = undefined;
    }
}
