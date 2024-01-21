import type { StatusCollection } from '../../Statuses/StatusCollection';

/**
 * Status supported by the Aura theme. {@link https://github.com/ashwinjadhav818/obsidian-aura}
 * @see {@link StatusSettings.bulkAddStatusCollection}
 */
export function auraSupportedStatuses() {
    const zzz: StatusCollection = [
        [' ', 'incomplete', 'x', 'TODO'],
        ['x', 'complete / done', ' ', 'DONE'],
        ['-', 'cancelled', ' ', 'CANCELLED'],
        ['>', 'deferred', 'x', 'TODO'],
        ['/', 'in progress, or half-done', 'x', 'IN_PROGRESS'],
        ['!', 'Important', 'x', 'TODO'],
        ['?', 'question', 'x', 'TODO'],
        ['R', 'review', 'x', 'TODO'],
        ['+', 'Inbox / task that should be processed later', 'x', 'TODO'],
        ['b', 'bookmark', 'x', 'TODO'],
        ['B', 'brainstorm', 'x', 'TODO'],
        ['D', 'deferred or scheduled', 'x', 'TODO'],
        ['I', 'Info', 'x', 'TODO'],
        ['i', 'idea', 'x', 'TODO'],
        ['N', 'note', 'x', 'TODO'],
        ['Q', 'quote', 'x', 'TODO'],
        ['W', 'win / success / reward', 'x', 'TODO'],
        ['P', 'pro', 'x', 'TODO'],
        ['C', 'con', 'x', 'TODO'],
    ];
    return zzz;
}
