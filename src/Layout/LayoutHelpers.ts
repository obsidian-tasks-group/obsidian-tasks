export function generateHiddenClassForTaskList(hiddenClasses: string[], hide: boolean, component: string) {
    if (hide) {
        hiddenClasses.push(hiddenComponentClassName(component));
    }
}

function hiddenComponentClassName(component: string) {
    return `tasks-layout-hide-${component}`;
}
