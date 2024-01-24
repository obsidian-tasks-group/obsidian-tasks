import { generateHiddenClassForTaskList } from './LayoutHelpers';
import { QueryLayoutOptions } from './QueryLayoutOptions';

/**
 * This class generates a list of hidden query components' classes.
 * The output depends on {@link QueryLayoutOptions} objects.
 */
export class QueryLayout {
    protected queryLayoutOptions: QueryLayoutOptions;

    constructor(queryLayoutOptions?: QueryLayoutOptions) {
        if (queryLayoutOptions) {
            this.queryLayoutOptions = queryLayoutOptions;
        } else {
            this.queryLayoutOptions = new QueryLayoutOptions();
        }
    }

    public getHiddenClasses() {
        const hiddenClasses: string[] = [];
        const componentsToGenerateClassesOnly: [boolean, string][] = [
            // The following components are handled in QueryRenderer.ts and thus are not part of the same flow that
            // hides TaskLayoutComponent items. However, we still want to have 'tasks-layout-hide' items for them
            // (see https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1866).
            // This can benefit from some refactoring, i.e. render these components in a similar flow rather than
            // separately.
            [this.queryLayoutOptions.hideUrgency, 'urgency'],
            [this.queryLayoutOptions.hideBacklinks, 'backlinks'],
            [this.queryLayoutOptions.hideEditButton, 'edit-button'],
            [this.queryLayoutOptions.hidePostponeButton, 'postpone-button'],
        ];
        for (const [hide, component] of componentsToGenerateClassesOnly) {
            generateHiddenClassForTaskList(hiddenClasses, hide, component);
        }

        if (this.queryLayoutOptions.shortMode) hiddenClasses.push('tasks-layout-short-mode');

        return hiddenClasses;
    }
}
