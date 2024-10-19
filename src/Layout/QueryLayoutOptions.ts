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
    hideTree: boolean = true; // WARNING: undocumented, and not yet ready for release.
    shortMode: boolean = false;
    explainQuery: boolean = false;
}
