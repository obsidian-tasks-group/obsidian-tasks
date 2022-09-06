import type { Task } from './Task';

export class Urgency {
    private static readonly dueCoefficient = 12.0;
    private static readonly scheduledCoefficient = 5.0;
    private static readonly startedCoefficient = -3.0;
    private static readonly priorityCoefficient = 6.0;

    private static readonly milliSecondsPerDay = 1000 * 60 * 60 * 24;

    public static calculate(task: Task): number {
        let urgency = 0.0;

        if (task.dueDate !== null) {
            // Map a range of 21 days to the value 0.2 - 1.0
            const daysOverdue = Math.round(window.moment().diff(task.dueDate) / Urgency.milliSecondsPerDay);

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
                urgency += 1.0 * Urgency.priorityCoefficient;
                break;
            // Medium
            case '2':
                urgency += 0.65 * Urgency.priorityCoefficient;
                break;
            // None
            case '3':
                urgency += 0.325 * Urgency.priorityCoefficient;
                break;
        }

        return urgency;
    }
}
