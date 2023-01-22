/* This file contains re-usable functions for use in managing and editing
 * user settings for custom task statuses.
 * It intentionally does not import any Obsidian types, so that tests can
 * be written for its contents.
 */

import type { StatusCollection } from '../StatusCollection';

/**
 * Status supported by the Minimal theme. {@link https://github.com/kepano/obsidian-minimal}
 * Values recognised by Tasks are excluded.
 * @todo Check if this is up-to-date.
 * @see {@link StatusSettings.bulkAddStatusCollection}
 */
export function minimalSupportedStatuses() {
    const zzz: StatusCollection = [
        ['>', 'Forwarded', 'x', 'TODO'],
        ['<', 'Schedule', 'x', 'TODO'],
        ['?', 'Question', 'x', 'TODO'],
        // ['/', 'Incomplete', 'x', 'IN_PROGRESS'], This is used for In Progress
        ['!', 'Important', 'x', 'TODO'],
        ['"', 'Quote', 'x', 'TODO'],
        ['-', 'Canceled', 'x', 'CANCELLED'],
        ['*', 'Star', 'x', 'TODO'],
        ['l', 'Location', 'x', 'TODO'],
        ['i', 'Info', 'x', 'TODO'],
        ['S', 'Amount/savings/money', 'x', 'TODO'],
        ['I', 'Idea/lightbulb', 'x', 'TODO'],
        ['f', 'Fire', 'x', 'TODO'],
        ['k', 'Key', 'x', 'TODO'],
        ['u', 'Up', 'x', 'TODO'],
        ['d', 'Down', 'x', 'TODO'],
        ['w', 'Win', 'x', 'TODO'],
        ['p', 'Pros', 'x', 'TODO'],
        ['c', 'Cons', 'x', 'TODO'],
        ['b', 'Bookmark', 'x', 'TODO'],
    ];
    return zzz;
}

/**
 * Status supported by the ITS theme. {@link https://github.com/SlRvb/Obsidian--ITS-Theme}
 * Values recognised by Tasks are excluded.
 * @todo  Check if this is up-to-date.
 * @see {@link StatusSettings.bulkAddStatusCollection}
 */
export function itsSupportedStatuses() {
    const zzz: StatusCollection = [
        [' ', 'Unchecked', 'x', 'TODO'],
        ['x', 'Regular', 'x', 'DONE'],
        ['X', 'Checked', 'x', 'DONE'],
        ['-', 'Dropped', 'x', 'CANCELLED'],
        ['>', 'Forward', 'x', 'TODO'],
        ['D', 'Date', 'x', 'TODO'],
        ['?', 'Question', 'x', 'TODO'],
        ['/', 'Half Done', 'x', 'IN_PROGRESS'],
        ['+', 'Add', 'x', 'TODO'],
        ['R', 'Research', 'x', 'TODO'],
        ['!', 'Important', 'x', 'TODO'],
        ['i', 'Idea', 'x', 'TODO'],
        ['B', 'Brainstorm', 'x', 'TODO'],
        ['P', 'Pro', 'x', 'TODO'],
        ['C', 'Con', 'x', 'TODO'],
        ['Q', 'Quote', 'x', 'TODO'],
        ['N', 'Note', 'x', 'TODO'],
        ['b', 'Bookmark', 'x', 'TODO'],
        ['I', 'Information', 'x', 'TODO'],
        ['p', 'Paraphrase', 'x', 'TODO'],
        ['L', 'Location', 'x', 'TODO'],
        ['E', 'Example', 'x', 'TODO'],
        ['A', 'Answer', 'x', 'TODO'],
        ['r', 'Reward', 'x', 'TODO'],
        ['c', 'Choice', 'x', 'TODO'],
        ['d', 'Doing', 'x', 'TODO'],
        ['T', 'Time', 'x', 'TODO'],
        ['@', 'Character / Person', 'x', 'TODO'],
        ['t', 'Talk', 'x', 'TODO'],
        ['O', 'Outline / Plot', 'x', 'TODO'],
        ['~', 'Conflict', 'x', 'TODO'],
        ['W', 'World', 'x', 'TODO'],
        ['f', 'Clue / Find', 'x', 'TODO'],
        ['F', 'Foreshadow', 'x', 'TODO'],
        ['H', 'Favorite / Health', 'x', 'TODO'],
        ['&', 'Symbolism', 'x', 'TODO'],
        ['s', 'Secret', 'x', 'TODO'],
    ];
    return zzz;
}
