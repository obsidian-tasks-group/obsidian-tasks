import type { StatusCollection } from '../../Statuses/StatusCollection';

/**
 * Status supported by the ITS theme. {@link https://github.com/SlRvb/Obsidian--ITS-Theme}
 * Values recognised by Tasks are excluded.
 * @see {@link StatusSettings.bulkAddStatusCollection}
 */
export function itsSupportedStatuses() {
    const zzz: StatusCollection = [
        [' ', 'Unchecked', 'x', 'TODO'],
        ['x', 'Regular', ' ', 'DONE'],
        ['X', 'Checked', ' ', 'DONE'],
        ['-', 'Dropped', ' ', 'CANCELLED'],
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
        ['d', 'Doing', 'x', 'IN_PROGRESS'],
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
