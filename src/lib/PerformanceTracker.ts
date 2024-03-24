/**
 * Helper class for measuring performance of code, and adding labels for profiling.
 * @example
 *  const tracker = new PerformanceTracker('some descriptive text');
 *  tracker.start();
 *  // ... some slow code
 *  tracker.finish();
 */
import { getSettings } from '../Config/Settings';

export class PerformanceTracker {
    private readonly label: string;

    constructor(labelForPerformance: string) {
        this.label = labelForPerformance;
        this.start();
    }

    public start() {
        if (!this.recordTimings()) {
            return;
        }

        performance.mark(this.labelForStart());
    }

    public finish() {
        if (!this.recordTimings()) {
            return;
        }

        performance.mark(this.labelForEnd());

        // Measure the time between the marks
        performance.measure(this.label, this.labelForStart(), this.labelForEnd());
        this.printDuration();
    }

    private printDuration() {
        // Get all entries matching the name this.label
        const entries = performance.getEntriesByName(this.label);

        // Get the last entry, in case the operation with this label has been run more than once this session.
        const lastEntry = entries[entries.length - 1];

        // Log the duration to the console
        if (lastEntry) {
            console.log(this.label + ':', lastEntry.duration, 'milliseconds');
        } else {
            console.log(`Measurement for ${this.label} not found`);
        }
    }

    private labelForStart() {
        return `${this.label} - start`;
    }

    private labelForEnd() {
        return `${this.label} - end`;
    }

    private recordTimings() {
        const { debugSettings } = getSettings();
        return debugSettings.recordTimings;
    }
}
