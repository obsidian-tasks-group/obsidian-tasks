import type { StatusCollection } from '../../Statuses/StatusCollection';

/**
 * Statuses supported by the Border theme. {@link https://github.com/Akifyss/obsidian-border?tab=readme-ov-file#alternate-checkboxes}
 * @see {@link StatusSettings.bulkAddStatusCollection}
 */
export function borderSupportedStatuses() {
    const zzz: StatusCollection = [
        [' ', 'To Do', 'x', 'TODO'],
        ['/', 'In Progress', 'x', 'IN_PROGRESS'],
        ['x', 'Done', ' ', 'DONE'],
        ['-', 'Cancelled', ' ', 'CANCELLED'],
        ['>', 'Rescheduled', 'x', 'TODO'],
        ['<', 'Scheduled', 'x', 'TODO'],
        ['!', 'Important', 'x', 'TODO'],
        ['?', 'Question', 'x', 'TODO'],
        ['i', 'Infomation', 'x', 'TODO'],
        ['S', 'Amount', 'x', 'TODO'],
        ['*', 'Star', 'x', 'TODO'],
        ['b', 'Bookmark', 'x', 'TODO'],
        ['“', 'Quote', 'x', 'TODO'],
        ['n', 'Note', 'x', 'TODO'],
        ['l', 'Location', 'x', 'TODO'],
        ['I', 'Idea', 'x', 'TODO'],
        ['p', 'Pro', 'x', 'TODO'],
        ['c', 'Con', 'x', 'TODO'],
        ['u', 'Up', 'x', 'TODO'],
        ['d', 'Down', 'x', 'TODO'],
    ];
    return zzz;
}
