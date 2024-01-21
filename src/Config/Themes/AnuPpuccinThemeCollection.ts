import type { StatusCollection } from '../../Statuses/StatusCollection';

/**
 * Status supported by the AnuPpuccin theme. {@link https://github.com/AnubisNekhet/AnuPpuccin}
 * @see {@link StatusSettings.bulkAddStatusCollection}
 */
export function anuppuccinSupportedStatuses() {
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
        ['"', 'Quote', 'x', 'TODO'],
        ['0', 'Speech bubble 0', '0', 'NON_TASK'],
        ['1', 'Speech bubble 1', '1', 'NON_TASK'],
        ['2', 'Speech bubble 2', '2', 'NON_TASK'],
        ['3', 'Speech bubble 3', '3', 'NON_TASK'],
        ['4', 'Speech bubble 4', '4', 'NON_TASK'],
        ['5', 'Speech bubble 5', '5', 'NON_TASK'],
        ['6', 'Speech bubble 6', '6', 'NON_TASK'],
        ['7', 'Speech bubble 7', '7', 'NON_TASK'],
        ['8', 'Speech bubble 8', '8', 'NON_TASK'],
        ['9', 'Speech bubble 9', '9', 'NON_TASK'],
    ];
    return zzz;
}
