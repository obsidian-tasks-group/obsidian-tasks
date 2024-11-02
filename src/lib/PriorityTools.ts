import { Priority } from '../Task/Priority';

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

    /**
     * Get the {@link Priority} value from a string. The algorithm is case-insensitive.
     *
     * In case the value was not recognised, {@link Priority.None} will be returned.
     *
     * @param priority - a string containing a name of one the supported {@link Priority} values.
     *                   Capitalisation is ignored.
     * @see priorityNameUsingNormal
     */
    public static priorityValue(priority: string): Priority {
        switch (priority.toLowerCase()) {
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
