import { BaseTaskEditingInstruction } from 'ui/EditInstructions/BaseTaskEditingInstruction';
import type { Task } from 'Task/Task';
import type { TaskEditingInstruction } from 'ui/EditInstructions/TaskEditingInstruction';

class TestingBaseTaskEditingInstruction extends BaseTaskEditingInstruction {
    public apply(task: Task): Task[] {
        return [task];
    }

    public instructionDisplayName(): string {
        return 'Dummy Instruction';
    }

    public isCheckedForTask(_task: Task): boolean {
        return false;
    }

    // Throwing commandId() implementation is inherited from BaseTaskEditingInstruction
}

describe('BaseTaskEditingInstruction', () => {
    it('should throw when asked for a commandId', () => {
        const instruction: TaskEditingInstruction = new TestingBaseTaskEditingInstruction();
        expect(() => instruction.commandId()).toThrow(
            'TestingBaseTaskEditingInstruction.commandId(): Method not implemented.',
        );
    });
});
