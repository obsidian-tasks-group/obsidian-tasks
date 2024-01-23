import { generateHiddenClassForTaskList } from './LayoutHelpers';
import { TaskLayoutOptions } from './TaskLayoutOptions';

/**
 * This class generates a list of hidden task components' classes.
 * The output depends on {@link TaskLayoutOptions} objects.
 */
export class TaskLayout {
    private taskLayoutOptions: TaskLayoutOptions;

    constructor(taskLayoutOptions?: TaskLayoutOptions) {
        if (taskLayoutOptions) {
            this.taskLayoutOptions = taskLayoutOptions;
        } else {
            this.taskLayoutOptions = new TaskLayoutOptions();
        }
    }
    public applyTaskLayoutOptions() {
        const taskListHiddenClasses: string[] = [];
        this.taskLayoutOptions.toggleableComponents.forEach((component) => {
            generateHiddenClassForTaskList(
                taskListHiddenClasses,
                !this.taskLayoutOptions.isShown(component),
                component,
            );
        });

        // Tags are hidden, rather than removed. See tasks-layout-hide-tags in styles.css.
        generateHiddenClassForTaskList(taskListHiddenClasses, !this.taskLayoutOptions.areTagsShown(), 'tags');

        return taskListHiddenClasses;
    }
}
