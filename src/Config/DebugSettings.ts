export class DebugSettings {
    constructor(ignoreSortInstructions = false, showTaskHiddenData = false) {
        this.ignoreSortInstructions = ignoreSortInstructions;
        this.showTaskHiddenData = showTaskHiddenData;
    }

    // Optionally disable all sorting of search results, so that tasks are
    // displayed in the order they appear in the file.
    readonly ignoreSortInstructions: boolean;
    readonly showTaskHiddenData: boolean;
}
