import type { StatusCollection } from '../../Statuses/StatusCollection';

/**
 * Status supported by the LYT Mode theme. {@link https://github.com/nickmilo/LYT-Mode}
 * @see {@link StatusSettings.bulkAddStatusCollection}
 */
export function lytModeSupportedStatuses() {
    const zzz: StatusCollection = [
        [' ', 'Unchecked', 'x', 'TODO'],
        ['x', 'Checked', ' ', 'DONE'],
        ['>', 'Rescheduled', 'x', 'TODO'],
        ['<', 'Scheduled', 'x', 'TODO'],
        ['!', 'Important', 'x', 'TODO'],
        ['-', 'Cancelled', ' ', 'CANCELLED'],
        ['/', 'In Progress', 'x', 'IN_PROGRESS'],
        ['?', 'Question', 'x', 'TODO'],
        ['*', 'Star', 'x', 'TODO'],
        ['n', 'Note', 'x', 'TODO'],
        ['l', 'Location', 'x', 'TODO'],
        ['i', 'Information', 'x', 'TODO'],
        ['I', 'Idea', 'x', 'TODO'],
        ['S', 'Amount', 'x', 'TODO'],
        ['p', 'Pro', 'x', 'TODO'],
        ['c', 'Con', 'x', 'TODO'],
        ['b', 'Bookmark', 'x', 'TODO'],
        ['f', 'Fire', 'x', 'TODO'],
        ['k', 'Key', 'x', 'TODO'],
        ['w', 'Win', 'x', 'TODO'],
        ['u', 'Up', 'x', 'TODO'],
        ['d', 'Down', 'x', 'TODO'],
    ];
    return zzz;
}
