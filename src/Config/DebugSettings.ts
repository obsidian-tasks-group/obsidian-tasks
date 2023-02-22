export class DebugSettings {
    constructor(ignoreSortInstructions = false) {
        this.ignoreSortInstructions = ignoreSortInstructions;
    }

    // Optionally disable all sorting of search results, so that tasks are
    // displayed in the order they appear in the file.
    readonly ignoreSortInstructions: boolean;
}
