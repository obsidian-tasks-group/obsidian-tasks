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

export function parseQueryShowHideOptions(queryLayoutOptions: QueryLayoutOptions, option: string, hide: boolean) {
    if (option.startsWith('tree')) {
        queryLayoutOptions.hideTree = hide;
        return true;
    }
    if (option.startsWith('task count')) {
        queryLayoutOptions.hideTaskCount = hide;
        return true;
    }
    if (option.startsWith('backlink')) {
        queryLayoutOptions.hideBacklinks = hide;
        return true;
    }
    if (option.startsWith('postpone button')) {
        queryLayoutOptions.hidePostponeButton = hide;
        return true;
    }
    if (option.startsWith('edit button')) {
        queryLayoutOptions.hideEditButton = hide;
        return true;
    }
    if (option.startsWith('urgency')) {
        queryLayoutOptions.hideUrgency = hide;
        return true;
    }
    return false;
}
