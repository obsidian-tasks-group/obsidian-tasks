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
        [' ', 'to-do', 'x', 'TODO'],
        ['/', 'incomplete', 'x', 'IN_PROGRESS'],
        ['x', 'done', 'x', 'DONE'],
        ['-', 'canceled', 'x', 'CANCELLED'],
        ['>', 'forwarded', 'x', 'TODO'],
        ['<', 'scheduling', 'x', 'TODO'],
        ['?', 'question', 'x', 'TODO'],
        ['!', 'important', 'x', 'TODO'],
        ['*', 'star', 'x', 'TODO'],
        ['"', 'quote', 'x', 'TODO'],
        ['l', 'location', 'x', 'TODO'],
        ['b', 'bookmark', 'x', 'TODO'],
        ['i', 'information', 'x', 'TODO'],
        ['S', 'savings', 'x', 'TODO'],
        ['I', 'idea', 'x', 'TODO'],
        ['p', 'pros', 'x', 'TODO'],
        ['c', 'cons', 'x', 'TODO'],
        ['f', 'fire', 'x', 'TODO'],
        ['k', 'key', 'x', 'TODO'],
        ['w', 'win', 'x', 'TODO'],
        ['u', 'up', 'x', 'TODO'],
        ['d', 'down', 'x', 'TODO'],
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
