/* This file contains re-usable functions for use in managing and editing
 * user settings for custom task statuses.
 * It intentionally does not import any Obsidian types, so that tests can
 * be written for its contents.
 */
import { StatusConfiguration } from '../StatusConfiguration';

/**
 * Return a one-line summary of the status, for presentation to users.
 * @param status
 */
export function statusPreviewText(status: StatusConfiguration) {
    let commandNotice = '';
    if (StatusConfiguration.tasksPluginCanCreateCommandsForStatuses() && status.availableAsCommand) {
        commandNotice = 'Available as a command.';
    }
    return `- [${status.indicator}] ${status.name}, next status is '${status.nextStatusIndicator}'. ${commandNotice}`;
}

/**
 * Status supported by the Minimal theme. {@link https://github.com/kepano/obsidian-minimal}
 * Values recognised by Tasks are excluded.
 * @todo Check if this is up-to-date.
 * @see {@link StatusSettings.bulkAddStatusCollection}
 */
export function minimalSupportedStatuses() {
    const zzz: Array<[string, string, string]> = [
        ['>', 'Forwarded', 'x'],
        ['<', 'Schedule', 'x'],
        ['?', 'Question', 'x'],
        // ['/', 'Incomplete', 'x'], This is used for In Progress
        ['!', 'Important', 'x'],
        ['"', 'Quote', 'x'],
        ['-', 'Canceled', 'x'],
        ['*', 'Star', 'x'],
        ['l', 'Location', 'x'],
        ['i', 'Info', 'x'],
        ['S', 'Amount/savings/money', 'x'],
        ['I', 'Idea/lightbulb', 'x'],
        ['f', 'Fire', 'x'],
        ['k', 'Key', 'x'],
        ['u', 'Up', 'x'],
        ['d', 'Down', 'x'],
        ['w', 'Win', 'x'],
        ['p', 'Pros', 'x'],
        ['c', 'Cons', 'x'],
        ['b', 'Bookmark', 'x'],
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
    const zzz: Array<[string, string, string]> = [
        //['X', 'Checked', 'x'],
        ['>', 'Forward', 'x'],
        ['D', 'Deferred/Scheduled', 'x'],
        //['-', 'Cancelled/Non-Task', 'x'],
        ['?', 'Question', 'x'],
        ['!', 'Important', 'x'],
        ['+', 'Add', 'x'],
        //['/', 'Half Done', 'x'],
        ['R', 'Research', 'x'],
        ['i', 'Idea', 'x'],
        ['B', 'Brainstorm', 'x'],
        ['P', 'Pro', 'x'],
        ['C', 'Con', 'x'],
        ['I', 'Info', 'x'],
        ['Q', 'Quote', 'x'],
        ['N', 'Note', 'x'],
        ['b', 'Bookmark', 'x'],
        ['p', 'Paraphrase', 'x'],
        ['E', 'Example', 'x'],
        ['L', 'Location', 'x'],
        ['A', 'Answer', 'x'],
        ['r', 'Reward', 'x'],
        ['c', 'Choice', 'x'],
    ];
    return zzz;
}
