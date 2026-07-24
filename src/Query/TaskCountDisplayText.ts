function taskCountPluralised(tasksCount: number) {
    return `task${tasksCount !== 1 ? 's' : ''}`;
}

export function totalTasksCountDisplayText(tasksCount: number, tasksCountBeforeLimit: number): string {
    if (tasksCount === tasksCountBeforeLimit) {
        return `${tasksCount} ${taskCountPluralised(tasksCount)}`;
    } else {
        return `${tasksCount} of ${tasksCountBeforeLimit} ${taskCountPluralised(tasksCountBeforeLimit)}`;
    }
}
