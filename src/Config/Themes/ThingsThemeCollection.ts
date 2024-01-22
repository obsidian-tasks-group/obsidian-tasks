import type { StatusCollection } from '../../Statuses/StatusCollection';

/**
 * Status supported by the Things theme. {@link https://github.com/colineckert/obsidian-things}
 * @see {@link StatusSettings.bulkAddStatusCollection}
 */
export function thingsSupportedStatuses() {
    const zzz: StatusCollection = [
        // Basic
        [' ', 'to-do', 'x', 'TODO'],
        ['/', 'incomplete', 'x', 'IN_PROGRESS'],
        ['x', 'done', ' ', 'DONE'],
        ['-', 'canceled', ' ', 'CANCELLED'],
        ['>', 'forwarded', 'x', 'TODO'],
        ['<', 'scheduling', 'x', 'TODO'],
        // Extras
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
