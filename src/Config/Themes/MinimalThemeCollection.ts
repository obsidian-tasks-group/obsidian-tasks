import type { StatusCollection } from '../../Statuses/StatusCollection';

/**
 * Status supported by the Minimal theme. {@link https://github.com/kepano/obsidian-minimal}
 * Values recognised by Tasks are excluded.
 * @see {@link StatusSettings.bulkAddStatusCollection}
 */
export function minimalSupportedStatuses() {
    const zzz: StatusCollection = [
        [' ', 'to-do', 'x', 'TODO'],
        ['/', 'incomplete', 'x', 'IN_PROGRESS'],
        ['x', 'done', ' ', 'DONE'],
        ['-', 'canceled', ' ', 'CANCELLED'],
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
