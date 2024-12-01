/**
 * Options to control {@link QueryRenderer} behaviour.
 *
 * @see LayoutOptions
 */
export class QueryLayoutOptions {
    hidePostponeButton: boolean = false;
    hideTaskCount: boolean = false;
    hideBacklinks: boolean = false;
    hideEditButton: boolean = false;
    hideUrgency: boolean = true;
    hideTree: boolean = true;
    shortMode: boolean = false;
    explainQuery: boolean = false;
}

/**
 * Parse show/hide options for Query Layout options
 * @param queryLayoutOptions
 * @param option - must already have been lower-cased
 * @param hide - whether the option should be hidden
 * @return True if the option was recognised, and false otherwise
 * @see parseTaskShowHideOptions
 */
export function parseQueryShowHideOptions(queryLayoutOptions: QueryLayoutOptions, option: string, hide: boolean) {
    const optionMap = new Map<string, keyof QueryLayoutOptions>([
        // Alphabetical order
        ['backlink', 'hideBacklinks'],
        ['edit button', 'hideEditButton'],
        ['postpone button', 'hidePostponeButton'],
        ['task count', 'hideTaskCount'],
        ['tree', 'hideTree'],
        ['urgency', 'hideUrgency'],
    ]);

    for (const [key, property] of optionMap.entries()) {
        if (option.startsWith(key)) {
            queryLayoutOptions[property] = hide;
            return true;
        }
    }
    return false;
}
