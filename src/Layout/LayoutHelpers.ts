export function generateHiddenClassForTaskList(taskListHiddenClasses: string[], hide: boolean, component: string) {
    if (hide) {
        taskListHiddenClasses.push(hiddenComponentClassName(component));
    }
}

function hiddenComponentClassName(component: string) {
    return `tasks-layout-hide-${component}`;
}
