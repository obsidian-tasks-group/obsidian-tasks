import type { Task } from './Task';

/**
 * This is taken from the Task Warrior approach.
 * https://taskwarrior.org/docs/urgency.html#:~:text=Urgency%20is%20a%20numeric%20score%20Taskwarrior%20assigns%20to,criteria%20when%20judging%20the%20importance%20of%20a%20task.
 *
 * @export
 * @class Urgency
 */
export class Urgency {
    private static readonly dueCoefficient = 12.0;
    private static readonly scheduledCoefficient = 5.0;
    private static readonly startedCoefficient = -3.0;
    private static readonly highPriorityCoefficient = 6.0;
    private static readonly mediumPriorityCoefficient = 3.9;
    private static readonly lowPriorityCoefficient = 1.8;

    private static readonly milliSecondsPerDay = 1000 * 60 * 60 * 24;

    public static calculate(task: Task): number {
        let urgency = 0.0;

        if (task.dueDate !== null) {
            // Map a range of 21 days to the value 0.2 - 1.0
            // if over 14 days in the future it is 0.2, as the
            // due date gets closer it increases to around 0.73 when due
            // then keeps on increasing to 1 when 7 days over due date.
            const daysOverdue = Math.round(
                window.moment().diff(task.dueDate) / Urgency.milliSecondsPerDay,
            );

            let dueMultiplier: number;
            if (daysOverdue >= 7.0) {
                dueMultiplier = 1.0; // < 1 wk ago
            } else if (daysOverdue >= -14.0) {
                // Due between 7 days (+7) ago and in 14 days (-14)
                dueMultiplier = ((daysOverdue + 14.0) * 0.8) / 21.0 + 0.2;
            } else {
                dueMultiplier = 0.2; // > 2 wks
            }

            urgency += dueMultiplier * Urgency.dueCoefficient;
        }

        if (task.scheduledDate !== null) {
            if (window.moment().isSameOrAfter(task.scheduledDate)) {
                urgency += 1 * Urgency.scheduledCoefficient;
            }
        }

        if (task.startDate !== null) {
            if (window.moment().isBefore(task.startDate)) {
                urgency += 1 * Urgency.startedCoefficient;
            }
        }

        switch (task.priority) {
            // High
            case '1':
                urgency += Urgency.highPriorityCoefficient;
                break;
            // Medium
            case '2':
                urgency += Urgency.mediumPriorityCoefficient;
                break;
            // None - this differs from the task warrior approach.
            case '3':
                urgency += Urgency.lowPriorityCoefficient;
                break;
        }

        return urgency;
    }
}
