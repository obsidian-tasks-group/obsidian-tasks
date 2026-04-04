import { TaskLayoutComponent } from '../Layout/TaskLayoutOptions';
import { PriorityTools } from '../lib/PriorityTools';
import type { Priority } from '../Task/Priority';
import type { Task } from '../Task/Task';
import { DefaultTaskSerializer } from './DefaultTaskSerializer';
import { DATAVIEW_SYMBOLS } from './TaskSerializerSymbols';

// Re-export for backward compatibility
export { DATAVIEW_SYMBOLS } from './TaskSerializerSymbols';

/**
 * A {@link TaskSerializer} that that reads and writes tasks compatible with
 *   [Dataview]{@link https://github.com/blacksmithgu/obsidian-dataview}
 */
export class DataviewTaskSerializer extends DefaultTaskSerializer {
    constructor() {
        super(DATAVIEW_SYMBOLS);
    }

    protected parsePriority(p: string): Priority {
        return PriorityTools.priorityValue(p);
    }

    public componentToString(task: Task, shortMode: boolean, component: TaskLayoutComponent) {
        const stringComponent = super.componentToString(task, shortMode, component);
        const notInlineFieldComponents: TaskLayoutComponent[] = [
            TaskLayoutComponent.BlockLink,
            TaskLayoutComponent.Description,
        ];
        const shouldMakeInlineField = stringComponent !== '' && !notInlineFieldComponents.includes(component);
        return shouldMakeInlineField
            ? // Having 2 (TWO) leading spaces avoids a rendering issues that makes every other
              // square-bracketed inline-field invisible.
              // See https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1913
              `  [${stringComponent.trim()}]`
            : stringComponent;
    }
}
