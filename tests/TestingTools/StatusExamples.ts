import type { StatusCollection } from '../../src/Statuses/StatusCollection';

export function doneTogglesToCancelled() {
    const statuses: StatusCollection = [
        [' ', 'Todo', '/', 'TODO'],
        ['x', 'Done', '-', 'DONE'],
        ['/', 'In Progress', 'x', 'IN_PROGRESS'],
        ['-', 'Cancelled', ' ', 'CANCELLED'],
    ];
    return statuses;
}

export function doneTogglesToCancelledWithUnconventionalSymbols() {
    const statuses: StatusCollection = [
        [' ', 'Todo', '*', 'TODO'],
        ['*', 'Done', 'x', 'DONE'],
        ['x', 'Cancelled', ' ', 'CANCELLED'],
    ];
    return statuses;
}

export function variousNonTaskStatuses() {
    const importantCycle: StatusCollection = [
        ['b', 'Bookmark', 'b', 'NON_TASK'],
        ['E', 'Example', 'E', 'NON_TASK'],
        ['I', 'Information', 'I', 'NON_TASK'],
        ['P', 'Paraphrase', 'P', 'NON_TASK'],
        ['Q', 'Quote', 'Q', 'NON_TASK'],
    ];
    return importantCycle;
}

export function importantCycle() {
    const importantCycle: StatusCollection = [
        ['!', 'Important', 'D', 'TODO'],
        ['D', 'Doing - Important', 'X', 'IN_PROGRESS'],
        ['X', 'Done - Important', '!', 'DONE'],
    ];
    return importantCycle;
}

export function todoToInProgressToDone() {
    const importantCycle: StatusCollection = [
        [' ', 'Todo', '/', 'TODO'],
        ['/', 'In Progress', 'x', 'IN_PROGRESS'],
        ['x', 'Done', ' ', 'DONE'],
    ];
    return importantCycle;
}

export function proCon() {
    const importantCycle: StatusCollection = [
        ['P', 'Pro', 'C', 'NON_TASK'],
        ['C', 'Con', 'P', 'NON_TASK'],
    ];
    return importantCycle;
}
