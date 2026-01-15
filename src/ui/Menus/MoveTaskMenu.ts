import type { App } from 'obsidian';
import type { Task } from '../../Task/Task';
import { openMoveTaskModal } from './MoveTaskModal';

// Re-export the modal for direct use
export { MoveTaskModal, openMoveTaskModal } from './MoveTaskModal';

/**
 * Helper function to show the move task modal.
 * This is called when the move button is clicked on a task.
 */
export function showMoveMenu(ev: MouseEvent, app: App, task: Task, allTasks: Task[]): void {
    ev.preventDefault();
    ev.stopPropagation();
    openMoveTaskModal(app, task, allTasks);
}
