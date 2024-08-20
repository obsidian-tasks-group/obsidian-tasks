import type { Task } from 'Task/Task';
import type { TaskEditingInstruction } from './TaskEditingInstruction';

/**
 * A placeholder to indicate that an instruction is meant to be a menu separator.
 */
export const SEPARATOR_INSTRUCTION_DISPLAY_NAME = '---';

export class MenuDividerInstruction implements TaskEditingInstruction {
    apply(_task: Task): Task[] {
        throw new Error('MenuDividerInstruction.apply(): Method not implemented.');
    }

    instructionDisplayName(): string {
        return SEPARATOR_INSTRUCTION_DISPLAY_NAME;
    }

    isCheckedForTask(_task: Task): boolean {
        return false;
    }
}
