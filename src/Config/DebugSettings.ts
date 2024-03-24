export class DebugSettings {
    constructor(ignoreSortInstructions = false, showTaskHiddenData = false, recordTimings = false) {
        this.ignoreSortInstructions = ignoreSortInstructions;
        this.showTaskHiddenData = showTaskHiddenData;
        this.recordTimings = recordTimings; // Enables or disables PerformanceTracker
    }

    // Optionally disable all sorting of search results, so that tasks are
    // displayed in the order they appear in the file.
    readonly ignoreSortInstructions: boolean;
    readonly showTaskHiddenData: boolean;
    readonly recordTimings: boolean;
}
