import type { StatusCollection } from '../../Statuses/StatusCollection';

/**
 * Status supported by the Ebullientworks theme. {@link https://github.com/ebullient/obsidian-theme-ebullientworks}
 * @see {@link StatusSettings.bulkAddStatusCollection}
 */
export function ebullientworksSupportedStatuses() {
    const zzz: StatusCollection = [
        [' ', 'Unchecked', 'x', 'TODO'],
        ['x', 'Checked', ' ', 'DONE'],
        ['-', 'Cancelled', ' ', 'CANCELLED'],
        ['/', 'In Progress', 'x', 'IN_PROGRESS'],
        ['>', 'Deferred', 'x', 'TODO'],
        ['!', 'Important', 'x', 'TODO'],
        ['?', 'Question', 'x', 'TODO'],
        ['r', 'Review', 'x', 'TODO'],
    ];
    return zzz;
}
