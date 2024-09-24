import { Priority } from '../Task/Priority';
import type { EditableTaskPriority } from '../ui/EditableTask';

export class PriorityTools {
    /**
     * Get the name of a {@link Priority} value, returning 'None' for {@link Priority.None}
     * @param priority
     * @see priorityNameUsingNormal
     */
    public static priorityNameUsingNone(priority: Priority) {
        let priorityName = 'ERROR';
        switch (priority) {
            case Priority.High:
                priorityName = 'High';
                break;
            case Priority.Highest:
                priorityName = 'Highest';
                break;
            case Priority.Medium:
                priorityName = 'Medium';
                break;
            case Priority.None:
                priorityName = 'None';
                break;
            case Priority.Low:
                priorityName = 'Low';
                break;
            case Priority.Lowest:
                priorityName = 'Lowest';
                break;
        }
        return priorityName;
    }

    /**
     * Get the name of a {@link Priority} value, returning 'Normal' for {@link Priority.None}
     * @param priority
     * @see priorityNameUsingNone
     */
    public static priorityNameUsingNormal(priority: Priority) {
        return PriorityTools.priorityNameUsingNone(priority).replace('None', 'Normal');
    }

    public static priorityValue(priority: EditableTaskPriority): Priority {
        switch (priority) {
            case 'lowest':
                return Priority.Lowest;
            case 'low':
                return Priority.Low;
            case 'medium':
                return Priority.Medium;
            case 'high':
                return Priority.High;
            case 'highest':
                return Priority.Highest;
            default:
                return Priority.None;
        }
    }
}
